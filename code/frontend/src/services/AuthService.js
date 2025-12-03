import axios from 'axios'

const apiClient = axios.create({
  // Use a relative path so the same frontend build works when served
  // from the backend or when running locally against a proxy.
  baseURL: '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

async function loginUser(pseudo, password) {
  // POST to /api/login
  return apiClient.post('login', { pseudo, password })
}

async function registerUser(pseudo, password) {
  // POST to /api/register
  return apiClient.post('register', { pseudo, password })
}

export default {
  loginUser,
  registerUser,
}
