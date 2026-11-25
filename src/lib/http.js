import axios from 'axios'

export const TOKEN_KEY = 'token'
export const AUTH_EXPIRED_EVENT = 'auth:expired'

// Di production FE & BE berada di domain berbeda, jadi URL BE diisi lewat VITE_API_URL.
// Di dev dikosongkan: request relatif /api dan di-proxy oleh Vite.
const API_URL = import.meta.env.VITE_API_URL ?? ''

export const http = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 })

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