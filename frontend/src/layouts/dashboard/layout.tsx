// Layout principal del dashboard con navegación Liquid Glass, header esmerilado y Dock móvil flotante
import type { Breakpoint } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCurrentUser } from '../../services/userService'
import { User } from '../../types/User'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'

import { Iconify } from '../../utils/iconify'
import { NotificationsPopover } from '../../utils/notifications/notifications-popover'
import { useNotifications } from '../../utils/hooks/useNotifications'

import { LayoutSection } from '../core/layout-section'
import { HeaderSection } from '../core/header-section'
import { MainSection } from '../core/main-section'

import { NavDesktop, NavMobile } from './nav'
import { getNavDataByRole } from '../nav-config-dashboard'
import { dashboardLayoutVars } from './css-vars'

import type { LayoutSectionProps } from '../core/layout-section'
import type { HeaderSectionProps } from '../core/header-section'
import type { MainSectionProps } from '../core/main-section'
import { FloatingChat } from '../../components/FloatingChat/FloatingChat'
import { FloatingMobileDock } from '../../components/Navigation/FloatingMobileDock'
import { GlobalQuickSearchModal } from '../../components/Search/GlobalQuickSearchModal'

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint
  slotProps?: {
    header?: HeaderSectionProps
    main?: MainSectionProps
  }
}

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg'
}: DashboardLayoutProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    loadUser()
  }, [])

  // Atajo de teclado global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadUser = async () => {
    try {
      const u = await getCurrentUser()
      setCurrentUser(u)
    } catch (e) {
      console.log('Error loading current user in layout:', e)
    }
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    navigate('/sign-in')
    handleUserMenuClose()
  }

  const currentNavData = getNavDataByRole(currentUser?.role)
  const isClient = currentUser?.role === 'client' || currentUser?.role === 'cliente'

  const layoutSectionSlots = {
    headerSection: (
      <HeaderSection
        layoutQuery={layoutQuery}
        slots={{
          leftArea: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                onClick={() => setNavOpen(true)}
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  width: { xs: 38, sm: 42 },
                  height: { xs: 38, sm: 42 },
                  color: 'text.primary',
                  borderRadius: 2.5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Iconify
                  icon="solar:hamburger-menu-bold-duotone"
                  width={22}
                  sx={{ color: '#22d3ee' }}
                />
              </IconButton>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(isClient ? '/dashboard/client-home' : '/dashboard/home')}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 14px rgba(6, 182, 212, 0.5)'
                  }}
                >
                  <Iconify icon="solar:dumbbell-large-bold" width={20} sx={{ color: '#fff' }} />
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '0.95rem', sm: '1.15rem' },
                    color: 'text.primary',
                    letterSpacing: -0.5
                  }}
                >
                  FITNESS <span style={{ color: '#22d3ee' }}>APP</span>
                </Box>
              </Box>
            </Box>
          ),
          centerArea: (
            <Box
              onClick={() => setSearchOpen(true)}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                px: 2.2,
                py: 0.85,
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'text.secondary',
                cursor: 'pointer',
                minWidth: 280,
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.09)',
                  borderColor: 'rgba(6, 182, 212, 0.45)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                }
              }}
            >
              <Iconify icon="solar:magnifer-bold" width={18} sx={{ color: '#22d3ee' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem', flexGrow: 1, color: 'inherit' }}>
                Buscar alumnos, rutinas, dietas...
              </Typography>
              <Chip
                label="⌘K"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 1.5
                }}
              />
            </Box>
          ),
          rightArea: (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.8, sm: 1.5 }
              }}
            >
              {/* Botón de Búsqueda Rápida Móvil */}
              <IconButton
                onClick={() => setSearchOpen(true)}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  width: 38,
                  height: 38,
                  color: 'text.primary',
                  borderRadius: 2.5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Iconify icon="solar:magnifer-bold" width={20} sx={{ color: '#22d3ee' }} />
              </IconButton>

              <IconButton
                onClick={handleNotificationsOpen}
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  color: 'text.primary',
                  borderRadius: 2.5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Iconify
                    icon="solar:bell-bold-duotone"
                    width={isMobile ? 20 : 24}
                    sx={{ color: unreadCount > 0 ? '#f43f5e' : 'inherit' }}
                  />
                </Badge>
              </IconButton>

              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  p: 0.4,
                  borderRadius: '50%',
                  border: '2px solid rgba(6, 182, 212, 0.4)',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}
                >
                  {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: {
                    width: 220,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                    p: 1
                  }
                }}
              >
                <Box sx={{ px: 1.5, py: 1, mb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: '#fff' }}>
                    {currentUser?.name || 'Mi Usuario'}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    {currentUser?.email}
                  </Typography>
                </Box>
                <MenuItem
                  onClick={() => {
                    navigate('/dashboard/profile')
                    handleUserMenuClose()
                  }}
                  sx={{ borderRadius: 2, '&:hover': { background: 'rgba(255, 255, 255, 0.06)' } }}
                >
                  <ListItemIcon>
                    <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: '#22d3ee' }} />
                  </ListItemIcon>
                  <ListItemText sx={{ color: '#fff' }}>Mi Perfil</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, color: '#f43f5e', '&:hover': { background: 'rgba(244, 63, 94, 0.1)' } }}
                >
                  <ListItemIcon>
                    <Iconify icon="solar:logout-bold-duotone" width={20} sx={{ color: '#f43f5e' }} />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>

              <NotificationsPopover
                anchorEl={notificationsAnchorEl}
                onClose={handleNotificationsClose}
              />
            </Box>
          )
        }}
        {...slotProps?.header}
      />
    ),
    sidebarSection: (
      <>
        <NavDesktop data={currentNavData} currentUser={currentUser} layoutQuery={layoutQuery} />
        <NavMobile
          data={currentNavData}
          currentUser={currentUser}
          open={navOpen}
          onClose={() => setNavOpen(false)}
        />
      </>
    )
  }

  const layoutSectionCssVars = {
    ...dashboardLayoutVars(theme),
    ...cssVars
  }

  return (
    <LayoutSection
      sx={[
        {
          minHeight: '100vh',
          ...(navOpen && {
            overflow: 'hidden'
          })
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      cssVars={layoutSectionCssVars}
      {...layoutSectionSlots}
    >
      <MainSection
        sx={{
          pl: {
            [layoutQuery]: 'calc(var(--layout-nav-vertical-width) + 16px)'
          },
          pt: 'calc(var(--layout-header-desktop-height) + 16px)',
          pb: { xs: 13, lg: 3 }, // Espacio reservado para el Floating Glass Dock en móvil
          pr: 2
        }}
        {...slotProps?.main}
      >
        {children}
      </MainSection>

      {/* Dock Flotante Móvil Liquid Glass */}
      <FloatingMobileDock userRole={currentUser?.role} />

      {/* Modal de Búsqueda Rápida Global Cmd+K */}
      <GlobalQuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating Chat */}
      <FloatingChat />
    </LayoutSection>
  )
}

export default DashboardLayout
