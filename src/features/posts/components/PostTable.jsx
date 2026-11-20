import KebabMenu from '../../../components/KebabMenu'
import { formatDate } from '../../../utils/format'

export default function PostTable({ posts, onToggle, onDetail, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">Judul</th>
            <th className="hidden px-4 py-3 md:table-cell">Kategori</th>
            <th className="px-4 py-3">Status</th>
            <th className="hidden px-4 py-3 sm:table-cell">Terbit</th>
            <th className="w-16 px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{post.title}</td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{post.category}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={post.is_published}
                  aria-label={`Status publikasi: ${post.title}`}
                  onClick={() => onToggle(post)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${post.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                >
                  {post.is_published ? 'Terbit' : 'Draf'}
                </button>
              </td>
              <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{formatDate(post.published_at)}</td>
              <td className="px-4 py-3 text-right">
                <KebabMenu
                  label={`Aksi untuk ${post.title}`}
                  items={[
                    { label: 'Detail', icon: '👁', onClick: () => onDetail(post) },
                    { label: 'Edit', icon: '✏️', onClick: () => onEdit(post) },
                    { label: 'Hapus', icon: '🗑', danger: true, onClick: () => onDelete(post) },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
