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
  const [chatOpen, setChatOpen] = useState(false)
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
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:dumbbell-large-bold" width={18} sx={{ color: '#000000' }} />
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: '#ffffff',
                    letterSpacing: -0.5
                  }}
                >
                  FITNESS <span style={{ color: '#007aff' }}>PRO</span>
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
                gap: 1.2,
                px: 2,
                py: 0.75,
                borderRadius: '12px',
                background: 'rgba(120, 120, 128, 0.16)',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(235, 235, 245, 0.6)',
                cursor: 'pointer',
                minWidth: 260,
                transition: 'all 0.15s ease',
                '&:hover': {
                  background: 'rgba(120, 120, 128, 0.24)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                }
              }}
            >
              <Iconify icon="solar:magnifer-bold" width={16} sx={{ color: 'rgba(235, 235, 245, 0.6)' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem', flexGrow: 1, color: 'inherit' }}>
                Buscar en la app...
              </Typography>
              <Chip
                label="⌘K"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 1
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
                title="Búsqueda Rápida (Cmd+K)"
                sx={{
                  width: 36,
                  height: 36,
                  color: '#ffffff',
                  borderRadius: 2,
                  background: 'rgba(120, 120, 128, 0.16)',
                }}
              >
                <Iconify icon="solar:magnifer-bold" width={18} sx={{ color: '#ffffff' }} />
              </IconButton>

              <IconButton
                onClick={() => setChatOpen(true)}
                title="Asistente Fitness IA"
                sx={{
                  width: 36,
                  height: 36,
                  color: '#007AFF',
                  borderRadius: 2,
                  background: 'rgba(0, 122, 255, 0.15)',
                  border: '0.5px solid rgba(0, 122, 255, 0.3)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.25)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Iconify icon="solar:magic-stick-3-bold" width={18} />
              </IconButton>

              <IconButton
                onClick={handleNotificationsOpen}
                sx={{
                  width: 36,
                  height: 36,
                  color: '#ffffff',
                  borderRadius: 2,
                  background: 'rgba(120, 120, 128, 0.16)',
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Iconify
                    icon="solar:bell-bold-duotone"
                    width={20}
                    sx={{ color: unreadCount > 0 ? '#ff3b30' : 'inherit' }}
                  />
                </Badge>
              </IconButton>

              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  p: 0,
                  borderRadius: '50%',
                  transition: 'transform 0.15s ease',
                  '&:active': {
                    transform: 'scale(0.94)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: '#2c2c2e',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#ffffff'
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
      <FloatingMobileDock userRole={currentUser?.role} onOpenChat={() => setChatOpen(true)} />

      {/* Modal de Búsqueda Rápida Global Cmd+K */}
      <GlobalQuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Modal de Asistente de IA Apple Intelligence */}
      <FloatingChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </LayoutSection>
  )
}

export default DashboardLayout
