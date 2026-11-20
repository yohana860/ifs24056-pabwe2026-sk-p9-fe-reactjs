import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from '../lib/http'
import * as authApi from '../features/auth/api/authApi'
import { useAuth } from '../hooks/useAuth'
import { AuthProvider } from './AuthContext'

vi.mock('../features/auth/api/authApi')

function Probe() {
  const { user, loading, login, logout, register } = useAuth()
  return (
    <div>
      <span data-testid="state">{loading ? 'loading' : user ? user.username : 'guest'}</span>
      <button onClick={() => login('yobez', 'rahasia')}>login</button>
      <button onClick={logout}>logout</button>
      <span data-testid="register">{register === authApi.register ? 'ok' : 'x'}</span>
    </div>
  )
}

const renderProbe = () => render(<AuthProvider><Probe /></AuthProvider>)

describe('AuthProvider', () => {
  it('tanpa token: langsung guest tanpa memanggil API', () => {
    renderProbe()
    expect(screen.getByTestId('state')).toHaveTextContent('guest')
    expect(authApi.getProfile).not.toHaveBeenCalled()
  })

  it('dengan token valid: memuat profil', async () => {
    localStorage.setItem(TOKEN_KEY, 't')
    authApi.getProfile.mockResolvedValue({ username: 'yobez', role: 'member' })
    renderProbe()
    expect(screen.getByTestId('state')).toHaveTextContent('loading')
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('yobez'))
  })

  it('dengan token tidak valid: token dihapus', async () => {
    localStorage.setItem(TOKEN_KEY, 't')
    authApi.getProfile.mockRejectedValue(new Error('401'))
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('guest'))
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('login menyimpan token dan user; logout menghapusnya', async () => {
    authApi.login.mockResolvedValue({ token: 'jwt', user: { username: 'yobez', role: 'member' } })
    authApi.logout.mockResolvedValue(null)
    renderProbe()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('yobez'))
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt')
    expect(authApi.login).toHaveBeenCalledWith({ username: 'yobez', password: 'rahasia' })
    expect(screen.getByTestId('register')).toHaveTextContent('ok')

    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('guest'))
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('logout tetap membersihkan sesi walau API gagal', async () => {
    authApi.login.mockResolvedValue({ token: 'jwt', user: { username: 'yobez' } })
    authApi.logout.mockRejectedValue(new Error('401'))
    renderProbe()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('yobez'))
    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('guest'))
  })

  it('event kedaluwarsa mengeluarkan pengguna dan listener dilepas saat unmount', async () => {
    authApi.login.mockResolvedValue({ token: 'jwt', user: { username: 'yobez' } })
    const { unmount } = renderProbe()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('yobez'))
    act(() => { window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)) })
    expect(screen.getByTestId('state')).toHaveTextContent('guest')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    const spy = vi.spyOn(window, 'removeEventListener')
    unmount()
    expect(spy).toHaveBeenCalledWith(AUTH_EXPIRED_EVENT, expect.any(Function))
  })
})
