import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { apiError, renderWithProviders } from '../../../test/utils'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

const loginApp = (auth, route = '/login') =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/author" element={<p>dashboard author</p>} />
      <Route path="/admin" element={<p>dashboard admin</p>} />
      <Route path="/posts/5" element={<p>detail artikel</p>} />
    </Routes>,
    { auth, route },
  )

describe('LoginPage', () => {
  it('memiliki id login-username, login-password, login-submit pada elemen aktual', () => {
    loginApp({})
    expect(document.getElementById('login-username')).toBeInstanceOf(HTMLInputElement)
    expect(document.getElementById('login-password')).toHaveAttribute('type', 'password')
    expect(document.getElementById('login-submit')).toBeInstanceOf(HTMLButtonElement)
  })

  it('validasi: field kosong', async () => {
    const login = vi.fn()
    loginApp({ login })
    await userEvent.click(document.getElementById('login-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('wajib diisi')
    expect(login).not.toHaveBeenCalled()
  })

  it('login author berhasil -> dashboard author', async () => {
    const login = vi.fn().mockResolvedValue({ username: 'yobez', role: 'author' })
    loginApp({ login })
    await userEvent.type(document.getElementById('login-username'), ' yobez ')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('dashboard author')).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith('yobez', 'rahasia')
    expect(screen.getByRole('status')).toHaveTextContent('Selamat datang, yobez')
  })

  it('login admin -> /admin', async () => {
    loginApp({ login: vi.fn().mockResolvedValue({ username: 'root', role: 'admin' }) })
    await userEvent.type(document.getElementById('login-username'), 'admin')
    await userEvent.type(document.getElementById('login-password'), 'admin')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('dashboard admin')).toBeInTheDocument()
  })

  it('kembali ke halaman asal (state.from) setelah login', async () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/posts/5" element={<p>detail artikel</p>} />
      </Routes>,
      { auth: { login: vi.fn().mockResolvedValue({ username: 'a', role: 'author' }) }, route: { pathname: '/login', state: { from: '/posts/5' } } },
    )
    expect(container).toBeTruthy()
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('detail artikel')).toBeInTheDocument()
  })

  it('menampilkan pesan error server dan fallback', async () => {
    const login = vi.fn().mockRejectedValueOnce(apiError('username atau password salah', 401)).mockRejectedValueOnce(new Error('net'))
    loginApp({ login })
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('username atau password salah')).toBeInTheDocument()
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('Login gagal, coba lagi.')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).not.toBeDisabled()
  })

  it('menonaktifkan tombol selama proses', async () => {
    loginApp({ login: vi.fn(() => new Promise(() => {})) })
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(document.getElementById('login-submit')).toBeDisabled()
    expect(screen.getByText('Memproses...')).toBeInTheDocument()
  })
})

describe('RegisterPage', () => {
  const setup = (register = vi.fn().mockResolvedValue({})) => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<p>halaman login</p>} />
      </Routes>,
      { auth: { register }, route: '/register' },
    )
    return register
  }
  const fill = async (u, e, p) => {
    if (u) await userEvent.type(document.getElementById('register-username'), u)
    if (e) await userEvent.type(document.getElementById('register-email'), e)
    if (p) await userEvent.type(document.getElementById('register-password'), p)
    await userEvent.click(document.getElementById('register-submit'))
  }

  it('validasi klien berurutan', async () => {
    const register = setup()
    await fill('ab', '', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Username minimal 3')
    await fill('c', 'bukan-email', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Format email')
    await userEvent.clear(document.getElementById('register-email'))
    await fill(null, 'a@b.co', '123')
    expect(screen.getByRole('alert')).toHaveTextContent('Password minimal 6')
    expect(register).not.toHaveBeenCalled()
  })

  it('registrasi berhasil -> halaman login', async () => {
    const register = setup()
    await fill('yobez', 'y@b.co', 'rahasia1')
    expect(await screen.findByText('halaman login')).toBeInTheDocument()
    expect(register).toHaveBeenCalledWith({ username: 'yobez', email: 'y@b.co', password: 'rahasia1' })
  })

  it('error server dan fallback', async () => {
    const register = setup(vi.fn().mockRejectedValueOnce(apiError('username atau email sudah digunakan', 409)).mockRejectedValueOnce(new Error('x')))
    await fill('yobez', 'y@b.co', 'rahasia1')
    expect(await screen.findByText('username atau email sudah digunakan')).toBeInTheDocument()
    await userEvent.click(document.getElementById('register-submit'))
    expect(await screen.findByText('Registrasi gagal, coba lagi.')).toBeInTheDocument()
    expect(register).toHaveBeenCalledTimes(2)
  })
})
