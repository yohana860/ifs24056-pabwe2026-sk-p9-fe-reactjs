import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../components/Toast'
import { AuthContext } from '../context/AuthContext'

// Render dengan Router + Toast + AuthContext palsu agar komponen dapat diuji terisolasi.
export function renderWithProviders(ui, { route = '/', auth = {}, ...options } = {}) {
  const value = { user: null, loading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn(), ...auth }
  return {
    auth: value,
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>
        </ToastProvider>
      </MemoryRouter>,
      options,
    ),
  }
}

export const apiError = (message, status = 400) => ({ response: { status, data: { status: 'fail', message } } })
