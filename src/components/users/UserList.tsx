import MOCK_USERS from '../../api/users.json'

const roleStyles: Record<string, { bg: string; color: string; label: string }> = {
  admin:    { bg: 'rgba(34,211,238,0.1)',  color: '#22d3ee', label: 'Admin'    },
  operator: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'Operador' },
  viewer:   { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Viewer'   },
}

export default function UserList() {
  return (
    <div>
      <div className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
              {['Usuario', 'Email', 'Rol', 'Permisos', 'Estado', 'Último acceso'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium tracking-widest"
                  style={{ color: '#64748b', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user, i) => {
              const rs = roleStyles[user.role] ?? roleStyles.viewer
              return (
                <tr key={user.id}
                  style={{
                    background: i % 2 === 0 ? '#1e293b' : '#162032',
                    borderBottom: '1px solid rgba(148,163,184,0.06)',
                  }}>

                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                        style={{ background: '#0e7490', color: '#22d3ee' }}>
                        {user.avatar}
                      </div>
                      <span style={{ color: '#cbd5e1' }}>{user.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: '#64748b' }}>{user.email}</span>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ background: rs.bg, color: rs.color }}>
                      {rs.label}
                    </span>
                  </td>

                  {/* Permisos */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map(p => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ background: 'rgba(148,163,184,0.08)', color: '#475569' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: user.active ? '#10b981' : '#f43f5e' }}/>
                      <span className="text-xs" style={{ color: user.active ? '#10b981' : '#f43f5e' }}>
                        {user.active ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>
                  </td>

                  {/* Último acceso */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: '#475569' }}>
                      {new Date(user.lastLogin).toLocaleString('es-PE', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-3" style={{ color: '#334155' }}>
        Para agregar o editar usuarios modifica <span className="font-mono">src/api/users.json</span>. 
        Al conectar Supabase esto se reemplaza por la tabla <span className="font-mono">auth.users</span>.
      </p>
    </div>
  )
}