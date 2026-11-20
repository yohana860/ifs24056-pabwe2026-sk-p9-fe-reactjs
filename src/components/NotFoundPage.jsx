import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-slate-800">404</h1>
      <p className="text-slate-600">Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Kembali ke beranda</Link>
    </main>
  )
}
