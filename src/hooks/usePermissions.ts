import { getCurrentUser } from '../api/services'
import MOCK_USERS from '../api/users.json'

export function usePermissions() {
  const session = getCurrentUser()
  if (!session) return { permissions: [], can: () => false }

  // Busca el usuario completo en el JSON para leer sus permisos reales
  const user = MOCK_USERS.find(u => u.id === session.id)
  const permissions = user?.permissions ?? []

  const can = (permission: string) => permissions.includes(permission)

  return { permissions, can, role: session.role }
}