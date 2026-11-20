import { Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import NotFoundPage from './components/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import AuthorDashboardPage from './features/posts/pages/AuthorDashboardPage'
import AuthorPostDetailPage from './features/posts/pages/AuthorPostDetailPage'
import HomePage from './features/posts/pages/HomePage'
import PostDetailPage from './features/posts/pages/PostDetailPage'

// Layout publik: Sticky Top Navbar, tanpa sidebar, konten selebar layar.
function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/public" element={<HomePage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/author" element={<ProtectedRoute role="author"><AuthorDashboardPage /></ProtectedRoute>} />
        <Route path="/author/posts/:id" element={<ProtectedRoute role="author"><AuthorPostDetailPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
