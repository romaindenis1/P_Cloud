import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default {
  async getBooks(limit, sortByDateAsc = false) {
    return apiClient.get('/books?limit=' + limit + '&sortByDateAsc=' + sortByDateAsc)
  },
  async getCategories() {
    return apiClient.get('/categories')
  },
  async getBooksById(id) {
    return apiClient.get(`books/${id}`)
  },
  async deleteBook(id) {
    return apiClient.delete('/books/' + id)
  },
  async getComments(bookId) {
    return apiClient.get('/books/' + bookId + '/comments')
  },
  async getNotes(bookId) {
    return apiClient.get('/books/' + bookId + '/notes')
  },
  async postNote(bookId, note) {
    return apiClient.post('/books/' + bookId + '/notes', note)
  },
  async postComment(bookId, comment) {
    return apiClient.post('/books/' + bookId + '/comments', comment)
  },
}
