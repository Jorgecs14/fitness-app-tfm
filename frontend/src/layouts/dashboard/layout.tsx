// Layout principal del dashboard con navegación, header y gestión de notificaciones
import type { Breakpoint } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCurrentUser } from '../../services/userService'
import { User } from '../../types/User'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'

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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    loadUser()
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
    navigate('/sign-in')
    handleUserMenuClose()
  }

  const currentNavData = getNavDataByRole(currentUser?.role)

  const layoutSectionSlots = {
    headerSection: (
      <HeaderSection
        layoutQuery={layoutQuery}
        slots={{
          leftArea: (
            <>
              <IconButton
                onClick={() => setNavOpen(true)}
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Iconify
                  icon='solar:hamburger-menu-bold-duotone'
                  width={isMobile ? 24 : 28}
                />
              </IconButton>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 0.5, sm: 1 },
                  cursor: 'pointer'
                }}
                onClick={() => navigate(currentUser?.role === 'client' ? '/dashboard/client-home' : '/dashboard/home')}
              >
                <Box
                  component='img'
                  src='/logo2.png'
                  alt='Logo'
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    objectFit: 'contain'
                  }}
                />
                <Box
                  component='span'
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                    letterSpacing: -0.5
                  }}
                >
                  FITNESS APP
                </Box>
              </Box>
            </>
          ),
          rightArea: (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 }
              }}
            >
              <IconButton
                onClick={handleNotificationsOpen}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color='error'>
                  <Iconify
                    icon='solar:bell-bold-duotone'
                    width={isMobile ? 24 : 28}
                  />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Iconify
                  icon='solar:user-circle-bold-duotone'
                  width={isMobile ? 24 : 28}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: { width: 200 }
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate('/dashboard/profile')
                    handleUserMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <Iconify icon='solar:user-bold-duotone' width={24} />
                  </ListItemIcon>
                  <ListItemText>Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Iconify icon='solar:logout-bold-duotone' width={24} />
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
        <NavDesktop data={currentNavData} layoutQuery={layoutQuery} />
        <NavMobile
          data={currentNavData}
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
          pb: 2,
          pr: 2
        }}
        {...slotProps?.main}
      >
        {children}
      </MainSection>
      <FloatingChat />
    </LayoutSection>
  )
}
