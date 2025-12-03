<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import UserService from './services/UserService'
import { ref, onMounted } from 'vue'
const user_id = ref(null)
const userDetails = ref(null)
const router = useRouter()
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

const handleLogout = async () => {
  try {
    await UserService.logout() // Optional: call your logout API or clear tokens
    user_id.value = null
    userDetails.value = null
    router.push('/') // Redirect to homepage
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error)
  }
}
</script>

<template>
  <div id="layout">
    <header>
      <div class="wrapper">
        <nav>
          <div class="center-links">
            <RouterLink to="/">Accueil</RouterLink> |
            <RouterLink to="/bibliotheque"> Bibliothèque </RouterLink> |
            <RouterLink to="/profile">Profile</RouterLink>
          </div>
          <div class="login-btn" v-if="user_id == null">
            <RouterLink to="/connexion">
              <Button> Connection </Button>
            </RouterLink>
          </div>
          <div class="register-btn" v-if="user_id == null">
            <RouterLink to="/inscription">
              <Button> Inscription </Button>
            </RouterLink>
          </div>
          <div class="register-btn" v-if="user_id !== null">
            <Button @click="handleLogout">Déconnection</Button>
          </div>
        </nav>
      </div>
    </header>

    <RouterView />
    <footer>
      <p><strong>Site créé par</strong></p>
      <ul>
        <li>Bastien Segalen (bastien.segalen@eduvaud.ch)</li>
        <li>Samuel Sallaku (samuel.sallaku@eduvaud.ch)</li>
        <li>Romain Schertenleib (romain.schertenleib@eduvaud.ch)</li>
      </ul>
      <p><strong>Mis en production par</strong></p>
      <ul>
        <li>Romain Denis (romain.denis@eduvaud.ch)</li>
        <li>Romain Schertenleib (romain.schertenleib@eduvaud.ch)</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
footer {
  padding: 20px 0;
  text-align: center;
  font-size: 15px;
  color: #6c757d;
  margin-top: 50px;
}

footer p {
  margin: 0;
  color: #343a40;
}

footer ul {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

footer li {
  margin: 5px 0;
}

#layout {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
.login-btn {
  margin-left: auto;
}
nav a.router-link-exact-active {
  color: #42b983;
}
</style>
