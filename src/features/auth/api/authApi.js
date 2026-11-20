import { http, unwrap } from '../../../lib/http'

export const login = (body) => http.post('/auth/login', body).then(unwrap)
export const register = (body) => http.post('/auth/register', body).then(unwrap)
export const logout = () => http.post('/auth/logout').then(unwrap)
export const getProfile = () => http.get('/auth/profile').then(unwrap)
export const updateProfile = (body) => http.put('/auth/profile', body).then(unwrap)
