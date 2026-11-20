import axios from 'axios'

export const TOKEN_KEY = 'token'
export const AUTH_EXPIRED_EVENT = 'auth:expired'

// Seluruh request memakai prefix /api: di dev di-proxy Vite, di production dilayani binary Go yang sama.
export const http = axios.create({ baseURL: '/api', timeout: 60000 })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export const unwrap = (response) => response.data.data

export const errorMessage = (error, fallback = 'Terjadi kesalahan, coba lagi.') =>
  error.response?.data?.message ?? fallback
