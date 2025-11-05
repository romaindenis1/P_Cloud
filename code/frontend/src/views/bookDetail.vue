<script setup>
import BookService from '@/services/BookService.js'
import UserService from '@/services/UserService'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const book = ref(null)
const comments = ref(null)
const notes = ref(null)
const avgNote = ref(null)
const note = ref(null)
const commentaire = ref(null)
const user_id = ref(null)

onMounted(() => {
  BookService.getBooksById(route.params.id)
    .then((response) => {
      console.log(response.data)
      book.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
  UserService.getUserId()
    .then((response) => {
      user_id.value = response.data.user_id
    })
    .catch((error) => {
      console.log(error)
    })
  loadComments()
  loadNotes()
})

function loadComments() {
  BookService.getComments(route.params.id)
    .then((response) => {
      console.log(response.data)
      comments.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
}

function loadNotes() {
  BookService.getNotes(route.params.id)
    .then((response) => {
      notes.value = response.data.data
      avgNote.value = calculateAvgNote(notes.value)
    })
    .catch((error) => {
      console.log(error)
    })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function calculateAvgNote(notes) {
  const totalNote = notes.reduce((sum, currentValue) => sum + currentValue.note, 0)
  // arrondir la moyenne au dixieme
  return Math.round((totalNote / notes.length) * 10) / 10
}

function submitNote() {
  const noteJson = {
    note: note.value ? note.value : 0,
    user_fk: user_id.value,
  }
  BookService.postNote(route.params.id, JSON.stringify(noteJson)).then(() => {
    note.value = ''
    loadNotes()
  })
}

function submitComment() {
  //si le commentaire est vide
  if (!commentaire.value || commentaire.value.trim() === '') {
    return
  }
  const commentJson = {
    contenu: commentaire.value,
    user_fk: user_id.value,
  }
  BookService.postComment(route.params.id, JSON.stringify(commentJson)).then(() => {
    commentaire.value = ''
    loadComments()
  })
}
</script>

<template>
  <div v-if="book" class="book-detail">
    <div class="card">
      <img
        v-if="book._imageCouverture != null"
        :src="'http://localhost:3000/' + book._imageCouverture"
        class="cover"
      />
      <img v-else :src="'http://localhost:3000/uploads/default.png'" class="cover" />
      <div class="info">
        <h1 class="title">{{ book.titre }}</h1>
        <p class="meta"><strong>Pages :</strong> {{ book.nbPages }}</p>
        <p class="excerpt">« {{ book.extrait }} »</p>
        <p class="summary">{{ book.resume }}</p>
        <div class="dates">
          <p><strong>Édition :</strong> {{ formatDate(book.anneeEdition) }}</p>
          <p><strong>Publication :</strong> {{ formatDate(book.datePublication) }}</p>
        </div>
      </div>
      <div class="note-comment-div" v-if="user_id">
        <div class="add-note">
          <form @submit.prevent="submitNote">
            <label for="note"><strong>Votre note :</strong></label>
            <div class="rating-stars">
              <label v-for="i in 5" :key="i" class="star-label">
                <input type="radio" name="note" :value="i" v-model="note" />
                <span class="star" :class="{ filled: i <= note }">★</span>
              </label>
            </div>
            <button type="submit">Envoyer</button>
          </form>
        </div>
        <div class="add-commentaire">
          <form @submit.prevent="submitComment">
            <label for="comment"><strong>Votre commentaire :</strong></label>
            <textarea
              id="comment"
              v-model="commentaire"
              placeholder="Écrivez votre avis ici..."
              required
            ></textarea>
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </div>
      <div v-else>Connecter vous pour ajouter une note et un commentaire</div>
      <div class="note-commentaire">
        <p v-if="avgNote"><strong>Note :</strong> {{ avgNote }}⭐</p>
        <p v-else><strong>Note :</strong> Aucune note</p>
        <p><strong>Commentaires: </strong></p>
        <div v-if="comments.length" v-for="comment in comments" :key="comment.id">
          {{ comment.contenu }}
        </div>
        <div v-else>Aucun commentaire</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 700px;
  width: 100%;
  padding: 2rem;
  text-align: center;
}

.cover {
  width: 320px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #222;
}

.meta {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
}

.excerpt {
  font-style: italic;
  color: #666;
  margin-bottom: 1.2rem;
}

.summary {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.dates p {
  margin: 0.3rem 0;
  color: #444;
}

.dates p:last-child {
  margin-bottom: 20px;
}

.note-commentaire {
  background-color: #ffffff;
  padding: 20px;
  margin-top: 30px;
  width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
  font-family: 'Segoe UI', sans-serif;
}

.note-commentaire p {
  margin-bottom: 10px;
  font-size: 1rem;
  color: #333;
}

.note-commentaire strong {
  color: #111;
  font-weight: 600;
}

.note-commentaire div {
  background-color: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #444;
  border-left: 4px solid #ffc107;
}

.add-note,
.add-commentaire {
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.add-note label,
.add-commentaire label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.rating-stars {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin: 10px 0 20px 0;
}

.rating-stars input[type='radio'] {
  display: none;
}

.star {
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.star:hover,
.star:hover ~ .star {
  color: #ffdb70;
  transform: scale(1.1);
}

.star.filled {
  color: #ffc107;
}

textarea {
  width: 100%;
  min-height: 90px;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

textarea:focus {
  border-color: #007bff;
  outline: none;
}

button[type='submit'] {
  margin-top: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button[type='submit']:hover {
  background-color: #0056b3;
}

.note-comment-div {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.add-note button[type='submit'] {
  margin-top: 25px;
}
</style>
