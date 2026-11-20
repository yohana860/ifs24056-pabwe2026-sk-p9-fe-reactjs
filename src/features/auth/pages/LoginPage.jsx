import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { homePath } from '../../../components/ProtectedRoute'
import { useToast } from '../../../components/Toast'
import { errorMessage } from '../../../lib/http'

export default function LoginPage() {
  const { login } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Username dan password wajib diisi.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form.username.trim(), form.password)
      notify('success', `Selamat datang, ${user.username}!`)
      navigate(location.state?.from ?? homePath(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Login gagal, coba lagi.'))
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full space-y-4 rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">Masuk</h1>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input id="login-username" name="username" autoComplete="username" value={form.username} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input id="login-password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <button id="login-submit" type="submit" disabled={submitting} className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
        <p className="text-center text-sm text-slate-600">Belum punya akun? <Link to="/register" className="font-medium text-emerald-600">Daftar</Link></p>
      </form>
    </main>
  )
}
