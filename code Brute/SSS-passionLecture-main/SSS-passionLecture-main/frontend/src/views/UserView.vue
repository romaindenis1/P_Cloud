<script setup>
import UserService from '@/services/UserService.js'
import { ref, onMounted } from 'vue'

const userDetails = ref(null)
const user_id = ref(null)

onMounted(async () => {
  try {
    await UserService.getUserId().then((response) => {
      user_id.value = response.data.user_id
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error)
  }

  await UserService.getUserDetails(user_id.value)
    .then((response) => {
      userDetails.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
})
</script>

<template>
  <nav>
    <div class="center-links">
      <RouterLink to="/profile">Info user</RouterLink>
      |
      <RouterLink to="/userBibliotheque"> Mes livres </RouterLink>
      |
      <RouterLink to="/addBook">Ajouter un livre</RouterLink>
    </div>
  </nav>
  <div class="user-info-card">
    <h2 class="title">Informations personnelles</h2>

    <div v-if="userDetails" class="user-details">
      <p><span class="label">Pseudo :</span> {{ userDetails.pseudo }}</p>
      <p><span class="label">Date d'entrée :</span> {{ userDetails.dateEntree }}</p>
      <p><span class="label">Admin :</span> {{ userDetails.isAdmin ? 'Oui' : 'Non' }}</p>
    </div>

    <div v-else class="loading">Chargement des données...</div>
  </div>
</template>

<style scoped>
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

.user-info-card {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px 25px;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

.user-details p {
  font-size: 1rem;
  margin: 10px 0;
  color: #444;
}

.label {
  font-weight: 600;
  color: #222;
}

.loading {
  text-align: center;
  color: #888;
  font-style: italic;
}
</style>
