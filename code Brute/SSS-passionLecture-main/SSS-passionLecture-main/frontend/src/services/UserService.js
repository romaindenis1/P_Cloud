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
  async getUserDetails(userId) {
    return apiClient.get(`users/${userId}`)
  },
  async getUserId() {
    return apiClient.get('users/currentUser', {
      withCredentials: true,
    })
  },
  async logout() {
    return apiClient.post('users/logout', {
      withCredentials: true,
    })
  },
}
