<script>
import AuthService from '@/services/AuthService'

export default {
  data() {
    return {
      user: {
        pseudo: '',
        password: '',
      },
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const userResponse = await AuthService.loginUser(this.user.pseudo, this.user.password)
        console.log(userResponse.data)
        window.location.href = '/'
      } catch (error) {
        console.error('Error during login:', error)
      }
    },
    msalLogin() {
      // Redirect to backend MSAL login endpoint. Backend must mount /auth/msal/login.
      // Use the current origin so we don't hard-code localhost.
      window.location.href = `${location.origin}/auth/msal/login`
    },
  },
}
</script>
<template>
  <div class="connexion">
    <div class="connexion-form">
      <h1>Connexion</h1>
      <form @submit.prevent="handleSubmit">
        <input type="text" v-model="user.pseudo" placeholder="Nom d'utilisateur" required />
        <input type="password" v-model="user.password" placeholder="Mot de passe" required />
        <router-link to="/inscription">Pas encore inscrit ?</router-link>
        <button type="submit">Se connecter</button>
        <button type="button" class="msal-button" @click="msalLogin">Se connecter avec Microsoft</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.connexion {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f2f4f8;
  padding: 1rem;
}

.connexion-form {
  background: #ffffff;
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.connexion-form h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
}

.connexion-form form {
  display: flex;
  flex-direction: column;
}

.connexion-form input {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.3s ease;
}

.connexion-form input:focus {
  border-color: #328d64;
  outline: none;
}

.connexion-form a {
  text-align: center;
  color: #34976b;
  font-size: 0.9rem;
  margin-bottom: 1.2rem;
  text-decoration: none;
}

.connexion-form a:hover {
  text-decoration: underline;
}

.connexion-form button {
  padding: 0.75rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.connexion-form button:hover {
  background: #318d64;
}

.msal-button {
  padding: 0.75rem;
  background: #2f5bb7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.75rem;
}
.msal-button:hover {
  background: #254a9a;
}
</style>
