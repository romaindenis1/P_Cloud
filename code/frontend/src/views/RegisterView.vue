<script>
import AuthService from '@/services/AuthService'

export default {
  data() {
    return {
      user: {
        pseudo: '',
        password: '',
        confirmPassword: '',
      },
    }
  },
  methods: {
    async handleSubmit() {
      if (this.user.password !== this.user.confirmPassword) {
        alert('Les mots de passe ne correspondent pas')
        return
      }
      try {
        const userResponse = await AuthService.registerUser(this.user.pseudo, this.user.password)
        console.log(userResponse.data)
        this.$router.push('/connexion')
      } catch (error) {
        console.error('Error during registration:', error)
      }
    },
  },
}
</script>
<template>
  <div class="register">
    <div class="register-form">
      <h1>Inscription</h1>
      <form @submit.prevent="handleSubmit">
        <input type="text" v-model="user.pseudo" placeholder="Nom d'utilisateur" required />
        <input type="password" v-model="user.password" placeholder="Mot de passe" required />
        <input
          type="password"
          v-model="user.confirmPassword"
          placeholder="Confirmer le mot de passe"
          required
        />
        <router-link to="/connexion">Déjà inscrit ?</router-link>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f2f4f8;
  padding: 1rem;
}

.register-form {
  background: #ffffff;
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.register-form h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
}

.register-form form {
  display: flex;
  flex-direction: column;
}

.register-form input {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.3s ease;
}

.register-form input:focus {
  border-color: #328d64;
  outline: none;
}

.register-form a {
  text-align: center;
  color: #34976b;
  font-size: 0.9rem;
  margin-bottom: 1.2rem;
  text-decoration: none;
}

.register-form a:hover {
  text-decoration: underline;
}

.register-form button {
  padding: 0.75rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.register-form button:hover {
  background: #318d64;
}
</style>
