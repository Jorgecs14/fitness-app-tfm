import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { User } from '../../types/User'
import * as userService from '../../services/userService'
import { useToast } from '../../utils/notifications'
import { useExport } from '../../utils/hooks/useExport'
import { UserList } from './UserList'
import { UserForm } from './UserForm'
import { AssignTrainerModal } from './AssignTrainerModal'

export const UserManager = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigningClient, setAssigningClient] = useState<User | null>(null)

  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { exportToPDF, exportToExcel, exportToCSV } = useExport()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const user = await userService.getCurrentUser()
      setCurrentUser(user)

      // Regla de aislamiento: Un cliente no puede ver el directorio de otros usuarios
      if (user.role === 'client' || user.role === 'cliente') {
        navigate('/dashboard/client-home', { replace: true })
        return
      }

      // Si es entrenador, cargar ÚNICAMENTE sus alumnos asignados
      if (user.role === 'trainer' || user.role === 'entrenador') {
        const clients = await userService.getTrainerClients(user.id)
        setUsers(Array.isArray(clients) ? clients : [])
      } else {
        // Administrador: ver todos los usuarios
        const all = await userService.getUsers()
        setUsers(Array.isArray(all) ? all : [])
      }
    } catch (error) {
      showToast('Error al cargar la lista de usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (
    userData: Omit<User, 'id' | 'created_at'>
  ) => {
    try {
      // Si el creador es un entrenador, asignar automáticamente el trainer_id a sí mismo
      const payload = {
        ...userData,
        trainer_id: (currentUser?.role === 'trainer' || currentUser?.role === 'entrenador')
          ? currentUser.id
          : userData.trainer_id || null,
      }

      await userService.createUser(payload)
      showToast('Alumno registrado correctamente', 'success')
      loadData()
    } catch (error: any) {
      showToast(error.message || 'Error al crear el usuario', 'error')
      throw error
    }
  }

  const handleUpdateUser = async (
    userData: Omit<User, 'id' | 'created_at'>
  ) => {
    if (!editingUser) return

    try {
      await userService.updateUser(editingUser.id, userData)
      showToast('Usuario actualizado correctamente', 'success')
      loadData()
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar el usuario', 'error')
      throw error
    }
  }

  const handleSubmitUser = async (
    userData: Omit<User, 'id' | 'created_at'>
  ) => {
    if (editingUser) {
      await handleUpdateUser(userData)
    } else {
      await handleCreateUser(userData)
    }
    handleCloseForm()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleAssignTrainer = (user: User) => {
    setAssigningClient(user)
    setAssignModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userService.deleteUser(id)
        showToast('Usuario eliminado correctamente', 'success')
        loadData()
      } catch (error) {
        showToast('Error al eliminar el usuario', 'error')
      }
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const isTrainer = currentUser?.role === 'trainer' || currentUser?.role === 'entrenador'
    const headers = [
      'ID',
      'Nombre',
      'Apellido',
      'Email',
      'Fecha Nacimiento',
      'Rol'
    ]
    const data = users.map((user) => [
      user.id.toString(),
      user.name,
      user.surname || '',
      user.email,
      user.birth_date
        ? new Date(user.birth_date).toLocaleDateString('es-ES')
        : 'N/A',
      user.role === 'admin' ? 'Administrador' : user.role === 'trainer' ? 'Entrenador' : 'Alumno'
    ])

    const exportData = {
      headers,
      data,
      filename: `${isTrainer ? 'mis_alumnos' : 'usuarios'}_${new Date().toISOString().split('T')[0]}`,
      title: isTrainer ? 'Reporte de Mis Alumnos Asignados' : 'Reporte General de Usuarios'
    }

    switch (format) {
      case 'pdf':
        exportToPDF(exportData)
        showToast('Reporte PDF generado correctamente', 'success')
        break
      case 'excel':
        exportToExcel(exportData)
        showToast('Archivo Excel descargado correctamente', 'success')
        break
      case 'csv':
        exportToCSV(exportData)
        showToast('Archivo CSV descargado correctamente', 'success')
        break
    }
  }

  const handleCreateNew = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  const isTrainer = currentUser?.role === 'trainer' || currentUser?.role === 'entrenador'

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <ToastContainer />

      <UserList
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        onCreateNew={handleCreateNew}
        onAssignTrainer={handleAssignTrainer}
        customTitle={isTrainer ? `Mis Alumnos Asignados (${users.length})` : 'Directorio de Usuarios'}
        customSubtitle={isTrainer ? 'Gestión, estado físico y seguimiento de tus atletas asignados.' : 'Gestión de roles, expedientes 360° y accesos de atletas y preparadores.'}
      />

      <UserForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitUser}
        userToEdit={editingUser}
      />

      <AssignTrainerModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        client={assigningClient}
        onUpdated={() => {
          showToast('Entrenador asignado correctamente', 'success')
          loadData()
        }}
      />
    </Box>
  )
}

export default UserManager
