import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { homePath } from './ProtectedRoute'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const link = 'rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-emerald-800">📝 Delcom Blog</Link>
        <div className="flex flex-wrap items-center gap-1">
          <Link to="/" className={link}>Beranda</Link>
          {user ? (
            <>
              <Link to={homePath(user.role)} className={link}>{user.role === 'admin' ? 'Admin' : 'Dashboard Penulis'}</Link>
              <span className="hidden px-2 text-sm text-slate-500 sm:inline">{user.username}</span>
              <button type="button" onClick={handleLogout} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" className={link}>Masuk</Link>
              <Link to="/register" className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-900">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
