<script setup>
import BookService from '@/services/BookService.js'
import UserService from '@/services/UserService.js'
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

onMounted(async () => {
  try {
    await UserService.logout().then((response) => {
      window.location.href = '/'
    })
  } catch (error) {
    console.error("Erreur lors de la deconnection de l'utilisateur :", error)
  }
})
</script>

<template></template>
