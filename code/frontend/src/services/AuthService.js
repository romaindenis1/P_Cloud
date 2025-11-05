import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
async function loginUser(pseudo, password) {
  return apiClient.post('/login', { pseudo, password, withCredentials: true })
}

async function registerUser(pseudo, password) {
  return apiClient.post('/register', { pseudo, password, withCredentials: true })
}

export default {
  loginUser,
  registerUser,
}
