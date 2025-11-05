<script setup>
import BookService from '@/services/BookService.js'
import { ref, onMounted } from 'vue'

const books = ref(null)

onMounted(() => {
  BookService.getBooks(5, true)
    .then((response) => {
      books.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
})
</script>

<template>
  <div class="home">
    <h1>Bienvenue</h1>
    <p>Notre site</p>
    <p>
      Notre site vous permet de découvrir une vaste collection de livres, classés par catégorie.
      Découvrez des livres que les autres utilisateurs ont ajoutés, et gérez vos propres livres.
    </p>
    <h3>Dernier ajout</h3>
    <div class="recent-books">
      <RouterLink
        v-for="book in books"
        class="book"
        :key="book.livre_id"
        :to="{ name: 'bookDetail', params: { id: book.livre_id } }"
      >
        <img
          v-if="book._imageCouverture != null"
          :src="'http://localhost:3000/' + book._imageCouverture"
        />
        <img v-else :src="'http://localhost:3000/uploads/default.png'" />
        <p class="book-title">{{ book.titre }}</p>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.recent-books {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 950px;
  margin: auto;
}
.book img {
  width: 250px;
  height: 400px;
}

.book-title {
  margin-top: 5px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 550;
  color: #333;
  transition: color 0.3s;
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
  text-decoration: none;
}
.book:hover {
  background-color: rgb(179, 179, 179);
  transition: 100ms;
}
</style>
