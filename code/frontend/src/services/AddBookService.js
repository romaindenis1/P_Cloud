import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})
async function addBook(bookFormData) {
  return apiClient.post('/books', bookFormData, {
    withCredentials: true,
  })
}

async function getEditors() {
  return apiClient.get(`/editors`)
}

async function getCategories() {
  return apiClient.get(`/categories`)
}

async function getAuthors() {
  return apiClient.get(`/authors`)
}

async function findUserById(id) {
  return apiClient.get(`users/${id}`)
}

async function findUsers() {
  return apiClient.get(`users`)
}

async function updateBook(id, data) {
  return apiClient.put(`/books/${id}`, data)
}

async function getBookById(id) {
  return apiClient.get(`/books/${id}`)
}

export default {
  addBook,
  getEditors,
  getCategories,
  getAuthors,
  findUserById,
  findUsers,
  updateBook,
  getBookById,
}
