import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../test/utils'
import ConfirmDialog from './ConfirmDialog'
import FullScreenModal from './FullScreenModal'
import KebabMenu from './KebabMenu'
import Navbar from './Navbar'
import NotFoundPage from './NotFoundPage'
import ProtectedRoute, { homePath } from './ProtectedRoute'
import Spinner from './Spinner'
import { ToastProvider, useToast } from './Toast'

describe('Spinner', () => {
  it('menampilkan label default dan kustom', () => {
    const { rerender } = render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat...')
    rerender(<Spinner label="Tunggu" />)
    expect(screen.getByRole('status')).toHaveTextContent('Tunggu')
  })
})

describe('Toast', () => {
  function Trigger() {
    const notify = useToast()
    return (
      <>
        <button onClick={() => notify('success', 'Berhasil!')}>ok</button>
        <button onClick={() => notify('error', 'Gagal!')}>err</button>
      </>
    )
  }

  it('menampilkan notifikasi sukses/error, dapat ditutup, dan hilang otomatis', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<ToastProvider><Trigger /></ToastProvider>)
    await userEvent.click(screen.getByText('ok'))
    await userEvent.click(screen.getByText('err'))
    expect(screen.getByRole('status')).toHaveTextContent('Berhasil!')
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal!')
    await userEvent.click(screen.getAllByLabelText('Tutup notifikasi')[1])
    expect(screen.queryByRole('alert')).toBeNull()
    act(() => { vi.advanceTimersByTime(4100) })
    expect(screen.queryByRole('status')).toBeNull()
    vi.useRealTimers()
  })
})

describe('FullScreenModal', () => {
  const setup = (props = {}) => {
    const onClose = vi.fn()
    const onSubmit = vi.fn()
    render(<FullScreenModal title="Judul" onClose={onClose} onSubmit={onSubmit} {...props}><p>isi</p></FullScreenModal>)
    return { onClose, onSubmit }
  }

  it('layout layar penuh dengan header/footer kontras dan tombol di kanan footer', () => {
    setup()
    const dialog = screen.getByRole('dialog', { name: 'Judul' })
    expect(dialog.className).toContain('fixed inset-0')
    expect(dialog.className).toContain('w-screen')
    expect(dialog.querySelector('header').className).toContain('bg-emerald-700')
    const footer = dialog.querySelector('footer')
    expect(footer.className).toContain('bg-slate-800')
    expect(footer.className).toContain('justify-end')
    expect(footer.querySelectorAll('button')[0]).toHaveTextContent('Batal')
    expect(footer.querySelectorAll('button')[1]).toHaveTextContent('Simpan')
  })

  it('Batal & Tutup memanggil onClose; submit memanggil onSubmit', async () => {
    const { onClose, onSubmit } = setup()
    await userEvent.click(screen.getByText('Batal'))
    await userEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByText('Simpan'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('menampilkan indikator loading dan menonaktifkan tombol saat submitting', () => {
    setup({ submitting: true })
    expect(screen.getByText('Menyimpan...')).toBeDisabled()
  })

  it('submitDisabled dan label kustom', () => {
    setup({ submitDisabled: true, submitLabel: 'Terapkan' })
    expect(screen.getByText('Terapkan')).toBeDisabled()
  })
})

describe('KebabMenu', () => {
  it('membuka menu, menjalankan aksi, dan menutup', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<KebabMenu label="Aksi X" items={[{ label: 'Edit', icon: '✏️', onClick: onEdit }, { label: 'Hapus', danger: true, onClick: onDelete }]} />)
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.click(screen.getByLabelText('Aksi X'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Hapus').className).toContain('text-red-600')
    await userEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.click(screen.getByLabelText('Aksi X'))
    await userEvent.click(screen.getByText('Hapus'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('menutup ketika klik di luar, tetap terbuka saat klik di dalam, dan label default', async () => {
    render(<div><span>luar</span><KebabMenu items={[{ label: 'Detail', onClick: () => {} }]} /></div>)
    await userEvent.click(screen.getByLabelText('Menu aksi'))
    await userEvent.click(screen.getByRole('menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(screen.getByText('luar'))
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.click(screen.getByLabelText('Menu aksi'))
    await userEvent.click(screen.getByLabelText('Menu aksi'))
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

describe('ConfirmDialog', () => {
  it('konfirmasi, batal, dan status sibuk', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { rerender } = render(<ConfirmDialog message="Yakin?" onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByText('Hapus'))
    await userEvent.click(screen.getByText('Batal'))
    expect(onConfirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
    rerender(<ConfirmDialog message="Yakin?" confirmLabel="Lanjut" busy onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByText('Lanjut')).toBeDisabled()
  })
})

describe('ProtectedRoute', () => {
  const app = (role) => (
    <Routes>
      <Route path="/login" element={<p>halaman login</p>} />
      <Route path="/author" element={<p>halaman author</p>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><p>halaman admin</p></ProtectedRoute>} />
      <Route path="/area" element={<ProtectedRoute role={role}><p>area terlindungi</p></ProtectedRoute>} />
    </Routes>
  )

  it('homePath per role', () => {
    expect(homePath('admin')).toBe('/admin')
    expect(homePath('author')).toBe('/author')
  })

  it('menampilkan spinner saat memuat sesi', () => {
    renderWithProviders(app('author'), { route: '/area', auth: { loading: true } })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('guest diarahkan ke login', () => {
    renderWithProviders(app('author'), { route: '/area' })
    expect(screen.getByText('halaman login')).toBeInTheDocument()
  })

  it('author tidak boleh masuk admin; admin diarahkan ke /admin saat salah rute', () => {
    renderWithProviders(app('admin'), { route: '/admin', auth: { user: { role: 'author' } } })
    expect(screen.getByText('halaman author')).toBeInTheDocument()
  })

  it('role sesuai dapat mengakses', () => {
    renderWithProviders(app('author'), { route: '/area', auth: { user: { role: 'author' } } })
    expect(screen.getByText('area terlindungi')).toBeInTheDocument()
  })
})

describe('Navbar', () => {
  it('guest melihat Masuk & Daftar dan menu sticky', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Masuk')).toHaveAttribute('href', '/login')
    expect(screen.getByText('Daftar')).toHaveAttribute('href', '/register')
    expect(screen.getByRole('navigation').className).toContain('sticky')
    expect(screen.queryByText('Keluar')).toBeNull()
  })

  it('author melihat Dashboard Penulis dan dapat keluar', async () => {
    const logout = vi.fn().mockResolvedValue()
    renderWithProviders(<Routes><Route path="/" element={<Navbar />} /></Routes>, { auth: { user: { username: 'yobez', role: 'author' }, logout } })
    expect(screen.getByText('Dashboard Penulis')).toHaveAttribute('href', '/author')
    await userEvent.click(screen.getByText('Keluar'))
    await waitFor(() => expect(logout).toHaveBeenCalled())
  })

  it('admin melihat menu Admin', () => {
    renderWithProviders(<Navbar />, { auth: { user: { username: 'root', role: 'admin' } } })
    expect(screen.getByText('Admin')).toHaveAttribute('href', '/admin')
  })
})

describe('NotFoundPage', () => {
  it('menampilkan 404 dengan tautan beranda', () => {
    renderWithProviders(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Kembali ke beranda')).toHaveAttribute('href', '/')
  })
})
