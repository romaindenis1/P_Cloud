<script setup>
import BookService from '@/services/BookService.js'
import { ref, onMounted } from 'vue'
import AddBookService from '@/services/AddBookService'
import UserService from '@/services/UserService'

const books = ref(null)
const categorys = ref(null)
const loggedInUser = ref(null)
const allUsers = ref([])
const Authors = ref(null)

onMounted(() => {
  BookService.getBooks(0)
    .then((response) => {
      books.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })

  BookService.getCategories()
    .then((response) => {
      categorys.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })

  AddBookService.findUsers()
    .then((response) => {
      allUsers.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })

  UserService.getUserId()
    .then((response) => {
      loggedInUser.value = response.data
      console.log('Utilisateur connecté :', loggedInUser.value)
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération de l'utilisateur :", error)
    })

  AddBookService.getAuthors()
    .then((response) => {
      Authors.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
})

async function deleteBook(id) {
  try {
    await BookService.deleteBook(id)
    books.value = books.value.filter((book) => book.livre_id != id)
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="home">
    <div class="div-title">
      <p class="title">bibliothèque</p>
    </div>
    <div class="recent-books">
      <div v-for="category in categorys" class="categories" :key="category.categorie_id">
        <p class="book-name">{{ category.nom }}</p>
        <div class="book-categorie">
          <div v-for="book in books" class="books-row" :key="book.livre_id">
            <div v-if="book.categorie_fk == category.categorie_id" class="book">
              <RouterLink :to="{ name: 'bookDetail', params: { id: book.livre_id } }">
                <img
                  v-if="book._imageCouverture != null"
                  :src="`${location.origin}/${book._imageCouverture}`"
                />
                <img v-else :src="`${location.origin}/uploads/default.png`" />
              </RouterLink>
              <RouterLink
                :to="{ name: 'bookDetail', params: { id: book.livre_id } }"
                class="book-title"
              >
                {{ book.titre }}
              </RouterLink>
              <div v-for="author in Authors" class="Author-name">
                <div v-if="author.auteur_id == book.auteur_fk" class="Author-name">
                  <p>{{ author.prenom }} {{ author.nom }}</p>
                </div>
              </div>
              <div v-for="user in allUsers" :key="user.user_id">
                <div v-if="user.user_id == book.user_fk">
                  <RouterLink
                    :to="{ name: 'viewUser', params: { id: book.user_fk } }"
                    class="user-link"
                  >
                    {{ user.pseudo }}
                  </RouterLink>
                  <div v-if="loggedInUser && loggedInUser.isAdmin" class="book-actions">
                    <RouterLink
                      :to="{ name: 'modifyBook', params: { id: book.livre_id } }"
                      class="btn modify"
                    >
                      Modifier
                    </RouterLink>
                    <form @submit.prevent="deleteBook(book.livre_id)">
                      <button type="submit" class="btn delete">Supprimer</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.Author-name {
  color: #000000;
}
.recent-books > div {
  margin-bottom: 40px;
}
.book-categorie {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.categories {
  background-color: rgb(245, 245, 245);
  border-radius: 20px;
}
.categories p {
  margin-bottom: 15px;
  padding-top: 15px;
}
.book-name {
  font-size: 20px;
  font-weight: 550;
  color: #333;
  transition: color 0.3s;
}
.home {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.books-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  text-decoration: none;
  gap: 16px;
}
.book-title {
  margin-top: 5px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 550;
  color: #333;
  transition: color 0.3s;
  text-decoration: none;
}
.book-title:hover {
  color: #1470d1;
  cursor: pointer;
}
.book {
  background-color: rgb(223, 223, 223);
  padding: 10px;
  margin: 10px;
  border-radius: 7.5px;
  margin-top: auto;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.book:hover {
  background-color: rgb(179, 179, 179);
  transition: 100ms;
}
.title {
  font-size: 80px;
  font-weight: 500;
  color: rgb(0, 0, 0);
  position: relative;
}
.book img {
  width: 250px;
  height: 400px;
}
.book a:last-child {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #555;
  text-decoration: none;
}
.btn {
  text-align: center;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn.delete {
  background-color: crimson;
  color: white;
}
.btn.delete:hover {
  background-color: darkred;
}
.btn.modify {
  background-color: green;
  color: white;
}
.btn.modify:hover {
  background-color: darkgreen;
}
</style>
