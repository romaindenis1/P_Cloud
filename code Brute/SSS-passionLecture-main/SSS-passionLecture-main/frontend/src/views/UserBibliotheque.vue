<script setup>
import BookService from '@/services/BookService.js'
import UserService from '@/services/UserService.js'
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const books = ref(null)
const user_id = ref(null)

onMounted(async () => {
  try {
    await UserService.getUserId().then((response) => {
      user_id.value = response.data.user_id
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error)
  }

  await BookService.getBooks(0)
    .then((response) => {
      books.value = response.data.data
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
  <nav>
    <div class="center-links">
      <RouterLink to="/profile">Info user</RouterLink> |
      <RouterLink to="/userBibliotheque">Mes livres</RouterLink> |
      <RouterLink to="/addBook">Ajouter un livre</RouterLink>
    </div>
  </nav>

  <div class="home">
    <div class="div-title">
      <p class="title">Mes livres</p>
    </div>
    <div class="recent-books">
      <div class="books-row">
        <template v-for="book in books" :key="book.livre_id">
          <div v-if="book.user_fk === user_id" class="book-card">
            <RouterLink
              :to="{ name: 'bookDetail', params: { id: book.livre_id } }"
              class="book-link"
            >
              <img
                v-if="book._imageCouverture != null"
                :src="'http://localhost:3000/' + book._imageCouverture"
                class="book-cover"
              />
              <img v-else :src="'http://localhost:3000/uploads/default.png'" class="book-cover" />
              <p class="book-title">{{ book.titre }}</p>
            </RouterLink>

            <div class="book-actions">
              <RouterLink :to="`/modifyBook/${book.livre_id}`">
                <button class="btn edit">Modifier</button>
              </RouterLink>

              <form @submit.prevent="deleteBook(book.livre_id)">
                <button type="submit" class="btn delete">Supprimer</button>
              </form>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buttons {
  margin-top: 10px;
}
.btn {
  margin: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.edit {
  background-color: #4caf50;
}

.delete {
  background-color: #f44336;
}

.home {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.book-title:hover {
  color: #1470d1;
  cursor: pointer;
}

.title {
  font-size: 80px;
  font-weight: 500;
  color: rgb(0, 0, 0);
  position: relative;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}
.center-links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  font-weight: bold;
}
nav a {
  font-weight: bold;
  color: #2c3e50;
}
nav a.router-link-exact-active {
  color: #42b983;
}
.recent-books {
  padding: 2rem;
}

.books-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
}

.book-card {
  background-color: rgb(223, 223, 223);
  padding: 10px;
  margin: 10px;
  border-radius: 7.5px;
  margin-top: auto;
  font-family: 'Segoe UI', sans-serif;
  position: relative; /* Nécessaire pour positionner le pseudo dans le coin */
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.book-link {
  text-decoration: none;
  color: inherit;
}

.book-cover {
  height: auto;
  border-radius: 8px;
  width: 250px;
  height: 400px;
}

.book-title {
  margin: 0.5rem 0;
  font-weight: bold;
  font-size: 1rem;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn.edit {
  background-color: #4caf50;
  color: white;
}

.btn.delete {
  background-color: #f44336;
  color: white;
}
</style>
