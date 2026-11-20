import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../components/Toast'
import { errorMessage } from '../../../lib/http'

export default function RegisterPage() {
  const { register } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (form.username.trim().length < 3) return setError('Username minimal 3 karakter.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Format email tidak valid.')
    if (form.password.length < 6) return setError('Password minimal 6 karakter.')
    setError('')
    setSubmitting(true)
    try {
      await register({ ...form, username: form.username.trim() })
      notify('success', 'Registrasi berhasil, silakan masuk.')
      navigate('/login')
    } catch (err) {
      setError(errorMessage(err, 'Registrasi gagal, coba lagi.'))
      setSubmitting(false)
    }
  }

  const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2'
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full space-y-4 rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">Daftar</h1>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">Username
          <input id="register-username" name="username" value={form.username} onChange={change} className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Email
          <input id="register-email" name="email" type="email" value={form.email} onChange={change} className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Password
          <input id="register-password" name="password" type="password" value={form.password} onChange={change} className={input} />
        </label>
        <button id="register-submit" type="submit" disabled={submitting} className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>
        <p className="text-center text-sm text-slate-600">Sudah punya akun? <Link to="/login" className="font-medium text-emerald-600">Masuk</Link></p>
      </form>
    </main>
  )
}
