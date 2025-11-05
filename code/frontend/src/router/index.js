import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import axios from 'axios'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/addBook',
      name: 'addBook',
      component: () => import('../views/AddBook.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bibliotheque',
      name: 'bibliotheque',
      component: () => import('../views/BibliothèqueView.vue'),
    },
    {
      path: '/bookDetail/:id',
      name: 'bookDetail',
      component: () => import('../views/bookDetail.vue'),
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: () => import('../views/ConnexionView.vue'),
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { requiresAuth: true },
      component: () => import('../views/UserView.vue'),
    },
    {
      path: '/userBibliotheque',
      name: 'userBibliotheque',
      meta: { requiresAuth: true },
      component: () => import('../views/UserBibliotheque.vue'),
    },
    {
      path: '/modifyBook/:id',
      name: 'modifyBook',
      meta: { requiresAuth: true },
      component: () => import('../views/ModifyBooks.vue'),
    },
    {
      path: '/viewUser/:id',
      name: 'viewUser',
      meta: { requiresAuth: true },
      component: () => import('../views/ViewUser.vue'),
    },
    { path: '/logout', name: 'logout', component: () => import('../views/logout.vue') },
  ],
})

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      await apiClient.get('/auth/check')
      next()
    } catch (err) {
      next({ name: 'connexion' }) // redirect to login
    }
  } else {
    next()
  }
})
export default router
