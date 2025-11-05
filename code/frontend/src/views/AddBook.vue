<script>
import AddBookService from '@/services/AddBookService'

export default {
  data() {
    return {
      book: {
        titre: '',
        nbPages: '',
        extrait: '',
        resume: '',
        anneeEdition: '',
        _imageCouverture: null,
        editeur_fk: '',
        categorie_fk: '',
        auteur_fk: '',
        user_fk: '',
      },
      editors: [],
      categories: [],
      authors: [],
    }
  },
  async mounted() {
    try {
      const [editors, categories, authors] = await Promise.all([
        AddBookService.getEditors(),
        AddBookService.getCategories(),
        AddBookService.getAuthors(),
      ])

      this.editors = editors.data.data
      this.categories = categories.data.data
      this.authors = authors.data.data
      //check si l'utilisateur est connecter
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    }
  },

  methods: {
    async submitBook() {
      try {
        //vérification coté server
        if (
          !this.book.titre ||
          !this.book.nbPages ||
          !this.book.extrait ||
          !this.book.resume ||
          !this.book.anneeEdition ||
          !this.book.editeur_fk ||
          !this.book.categorie_fk ||
          !this.book.auteur_fk
        ) {
          return
        }
        const formData = new FormData()
        formData.append('titre', this.book.titre)
        formData.append('nbPages', this.book.nbPages)
        formData.append('extrait', this.book.extrait)
        formData.append('resume', this.book.resume)
        formData.append('anneeEdition', this.book.anneeEdition)
        formData.append('editeur_fk', this.book.editeur_fk)
        formData.append('categorie_fk', this.book.categorie_fk)
        formData.append('auteur_fk', this.book.auteur_fk)
        formData.append('user_fk', this.book.user_fk)
        if (this.book._imageCouverture) {
          formData.append('_imageCouverture', this.book._imageCouverture)
        }

        const response = await AddBookService.addBook(formData)
        console.log('Added Book:', response.data)
        this.$router.push('/bibliotheque')
      } catch (error) {
        console.error('Error while adding book:', error.response?.data || error.message)
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      this.book._imageCouverture = file
    },
  },
}
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
  <div class="add-book">
    <div class="book-form">
      <h1>Ajouter un livre</h1>
      <form @submit.prevent="submitBook">
        <label>Titre</label>
        <input type="text" v-model="book.titre" placeholder="Titre" required />
        <label>Nombre de pages</label>
        <input type="text" v-model="book.nbPages" placeholder="Nb. Pages" required />
        <label>Extrait</label>
        <input type="text" v-model="book.extrait" placeholder="Extrait" required />
        <label>Resume</label>
        <input type="text" v-model="book.resume" placeholder="Resume" required />
        <label>Année d'edition</label>
        <input type="text" v-model="book.anneeEdition" placeholder="Année d'édition" required />
        <label>Editeur</label>
        <select v-model="book.editeur_fk" required>
          <option disabled value="">Choisir un éditeur</option>
          <option v-for="editor in editors" :key="editor.editeur_id" :value="editor.editeur_id">
            {{ editor.nom }}
          </option>
        </select>

        <label>Catégorie</label>
        <select v-model="book.categorie_fk" required>
          <option disabled value="">Choisir une catégorie</option>
          <option
            v-for="category in categories"
            :key="category.categorie_id"
            :value="category.categorie_id"
          >
            {{ category.nom }}
          </option>
        </select>

        <label>Auteur</label>
        <select v-model="book.auteur_fk" required>
          <option disabled value="">Choisir un auteur</option>
          <option v-for="author in authors" :key="author.auteur_id" :value="author.auteur_id">
            {{ author.prenom }} {{ author.nom }}
          </option>
        </select>
        <label>Image de courverture</label>
        <input type="file" @change="handleFileUpload" />

        <button id="send-book" type="submit">Ajouter</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.author-fields {
  display: flex;
  gap: 10px;
}

.author-fields input {
  flex: 1;
}

.add-book {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; /* Full page height */
  background-color: #f5f5f5; /* Light background */
}

.book-form {
  background: white;
  padding: 1.5rem; /* Reduced padding */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 350px; /* Reduced width */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-form form {
  display: flex;
  flex-direction: column;
}

.book-form label {
  font-weight: bold;
  margin: 8px;
}

.book-form input,
.book-form select {
  padding: 7px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 5px;
}

.book-form select {
  -webkit-appearance: none; /* Remove default styling for Safari */
  -moz-appearance: none; /* Remove default styling for Firefox */
  appearance: none; /* Remove default styling for other browsers */
  background: url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20d=%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')
    no-repeat right 0.5rem center; /* Add custom dropdown icon */
  background-size: 12px;
  padding-right: 2.5rem; /* Ensure space for the dropdown icon */
  height: 40px; /* Set a fixed height */
  overflow-y: auto; /* Make it scrollable if there are too many options */
  z-index: 10; /* Ensure dropdown shows above other content */
}

.book-form select option {
  padding: 8px; /* Add padding to options for better readability */
}

h1 {
  text-align: center;
  margin-bottom: 1rem; /* Reduced margin */
}

#send-book {
  color: white;
  font-size: 20px;
  background-color: cadetblue;
  border: none;
  border-radius: 7px;
  width: 200px;
  height: 50px;
  margin: 20px auto 0;
  display: block;
  cursor: pointer;
  transition: all 0.2s ease;
}

#send-book:hover {
  background-color: #5f9ea0; /* slightly lighter cadetblue */
  transform: scale(1.05);
}

#send-book:active {
  transform: scale(0.95);
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
</style>
