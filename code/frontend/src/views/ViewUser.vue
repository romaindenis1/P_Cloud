<script setup>
import UserService from '@/services/UserService.js'
import BookService from '@/services/BookService'
import AddBookService from '@/services/AddBookService'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user_id = ref(route.params.id)
const userDetails = ref(null)
const userBooks = ref([])
const authors = ref([])
const categories = ref([])

onMounted(async () => {
  try {
    const response = await UserService.getUserDetails(user_id.value)

    userDetails.value = response.data.data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error)
  }

  await BookService.getBooks(1000)
    .then((response) => {
      userBooks.value = response.data.data.filter((book) => book.user_fk == user_id.value)
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des livres :', error)
    })

  await AddBookService.getAuthors().then((response) => {
    authors.value = response.data.data
  })

  await BookService.getCategories().then((response) => {
    categories.value = response.data.data
  })
})
</script>

<template>
  <div class="user-info-card">
    <h2 class="title">Profil de {{ userDetails?.pseudo || 'En chargement' }}</h2>

    <div v-if="userDetails" class="user-details">
      <p><span class="label">Pseudo :</span> {{ userDetails.pseudo }}</p>
      <p><span class="label">Date d'entrée :</span> {{ userDetails.dateEntree }}</p>
      <p><span class="label">Admin :</span> {{ userDetails.isAdmin ? 'Oui' : 'Non' }}</p>
    </div>

    <div v-else class="loading">Chargement des données...</div>

    <hr />

    <h3>Livres créés par {{ userDetails?.pseudo }}</h3>
    <div class="book-categorie">
      <div v-for="book in userBooks" :key="book.livre_id" class="book">
        <div v-if="userBooks.length > 0">
          <img :src="'http://localhost:3000/' + book._imageCouverture" />

          <RouterLink
            :to="{ name: 'bookDetail', params: { id: book.livre_id } }"
            class="book-title"
          >
            {{ book.titre }}
          </RouterLink>

          <p class="Author-name">
            {{ authors.find((a) => a.auteur_id === book.auteur_fk)?.prenom || 'Auteur inconnu' }}
            {{ authors.find((a) => a.auteur_id === book.auteur_fk)?.nom || 'Auteur inconnu' }}
          </p>

          <RouterLink
            :to="{ name: 'viewUser', params: { id: userDetails.user_id } }"
            class="user-link"
          >
            {{ userDetails.pseudo }}
          </RouterLink>
        </div>
        <div v-else>
          <p>Aucun livre trouvé pour cet utilisateur.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  font-size: 32px;
  margin-bottom: 20px;
}
.label {
  font-weight: bold;
}
.recent-books {
  margin-top: 40px;
}
.categories {
  background-color: rgb(245, 245, 245);
  border-radius: 20px;
  padding: 10px;
  margin-bottom: 30px;
}
.book-categorie {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 1200px; /* Or any reasonable width */
  margin: 0 auto; /* This centers the container itself */
}

.book {
  background-color: rgb(223, 223, 223);
  padding: 10px;
  border-radius: 8px;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.book img {
  width: 250px;
  height: 400px;
  object-fit: cover;
}
.book-title {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  color: #333;
}
.book-title:hover {
  color: #1470d1;
}
.Author-name {
  font-size: 14px;
  color: #555;
}
.user-link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #555;
  text-decoration: none;
}
.user-link:hover {
  color: #1470d1;
  text-decoration: underline;
}
.user-info-card {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}
</style>
