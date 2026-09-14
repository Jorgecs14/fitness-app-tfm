// Componentes de navegación desktop y móvil para el dashboard con estilo Liquid Glass iOS 26
import type { Breakpoint } from '@mui/material/styles'
import { useLocation, Link, useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import { useTheme } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'
import Drawer, { drawerClasses } from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'

import { Iconify } from '../../utils/iconify'
import { Scrollbar } from '../../utils/scrollbar'
import { supabase } from '../../lib/supabase'
import { User } from '../../types/User'

import type { NavItem } from '../nav-config-dashboard'

export type NavContentProps = {
  data: NavItem[]
  currentUser?: User | null
  slots?: {
    topArea?: React.ReactNode
    bottomArea?: React.ReactNode
  }
  onItemClick?: () => void
}

export function NavDesktop({
  data,
  currentUser,
  slots,
  layoutQuery = 'lg'
}: NavContentProps & { layoutQuery?: Breakpoint }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2,
        pb: 2,
        top: 0,
        left: 0,
        height: '100vh',
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: theme.zIndex.drawer + 1,
        width: 280,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.82) 100%)',
        backdropFilter: 'blur(28px) saturate(200%)',
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.25)',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex'
        }
      }}
    >
      <NavContent data={data} currentUser={currentUser} slots={slots} />
    </Box>
  )
}

// ----------------------------------------------------------------------

export function NavMobile({
  data,
  currentUser,
  open,
  slots,
  onClose
}: NavContentProps & { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2,
          pb: 2,
          overflow: 'unset',
          width: 280,
          zIndex: 1300,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.92) 100%)',
          backdropFilter: 'blur(30px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '15px 0 40px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <NavContent data={data} currentUser={currentUser} slots={slots} onItemClick={onClose} />
    </Drawer>
  )
}

// ----------------------------------------------------------------------

export function NavContent({ data, currentUser, slots, onItemClick }: NavContentProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    navigate('/sign-in')
    if (onItemClick) onItemClick()
  }

  const isClient = currentUser?.role === 'client' || currentUser?.role === 'cliente'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        component={Link}
        to={isClient ? '/dashboard/client-home' : '/dashboard/home'}
        onClick={onItemClick}
        sx={{
          mb: 2.5,
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textDecoration: 'none',
          borderRadius: 3,
          transition: 'all 0.25s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            flexShrink: 0
          }}
        >
          <Iconify icon="solar:dumbbell-large-bold" width={24} sx={{ color: '#fff' }} />
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={900}
            sx={{
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.8
            }}
          >
            FITNESS <span style={{ color: '#22d3ee' }}>PRO</span>
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Liquid Glass v26
          </Typography>
        </Box>
      </Box>

      {slots?.topArea}

      {/* Navigation Items */}
      <Scrollbar sx={{ flexGrow: 1, px: 0.5 }}>
        <Box
          component="nav"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            py: 1
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              mb: 1,
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 800,
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {isClient ? 'Zona del Alumno' : 'Gestión & Entrenador'}
          </Typography>

          <Box
            component="ul"
            sx={{
              gap: 0.8,
              display: 'flex',
              flexDirection: 'column',
              listStyle: 'none',
              margin: 0,
              padding: 0
            }}
          >
            {data.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard/home' &&
                  item.path !== '/dashboard/client-home' &&
                  location.pathname.startsWith(item.path))

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={onItemClick}
                    sx={{
                      pl: 2,
                      py: 1.1,
                      gap: 1.8,
                      pr: 1.5,
                      borderRadius: 2.5,
                      typography: 'body2',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.65)',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.18) 0%, rgba(59, 130, 246, 0.08) 100%)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(6, 182, 212, 0.35)'
                        : '1px solid transparent',
                      boxShadow: isActive ? '0 0 16px rgba(6, 182, 212, 0.15)' : 'none',
                      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        color: '#fff',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.12) 100%)'
                          : 'rgba(255, 255, 255, 0.06)',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* User Mini Profile Dock in Sidebar */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: 1.5,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5
        }}
      >
        <Box
          component={Link}
          to="/dashboard/profile"
          onClick={onItemClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            textDecoration: 'none',
            minWidth: 0,
            flexGrow: 1
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: '2px solid rgba(34, 211, 238, 0.5)',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
            }}
          >
            {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: '#fff', fontSize: '0.85rem' }}>
              {currentUser?.name || 'Mi Usuario'}
            </Typography>
            <Chip
              label={isClient ? 'Alumno' : 'Entrenador Pro'}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.62rem',
                fontWeight: 700,
                background: isClient ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                color: isClient ? '#10b981' : '#22d3ee',
                border: `1px solid ${isClient ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`
              }}
            />
          </Box>
        </Box>

        <Tooltip title="Cerrar Sesión">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              '&:hover': { color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }
            }}
          >
            <Iconify icon="solar:logout-bold-duotone" width={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
