// Componente de sección header con detección de scroll y contenedor responsive
import type { AppBarProps } from '@mui/material/AppBar'
import type { Breakpoint } from '@mui/material/styles'

import { useState, useEffect } from 'react'

import AppBar from '@mui/material/AppBar'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'

import { layoutClasses } from './classes'

function mergeClasses(classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

function useScrollOffsetTop() {
  const [offsetTop, setOffsetTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setOffsetTop(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { offsetTop }
}

export type HeaderSectionProps = AppBarProps & {
  layoutQuery?: Breakpoint
  disableOffset?: boolean
  disableElevation?: boolean
  slots?: {
    leftArea?: React.ReactNode
    rightArea?: React.ReactNode
    centerArea?: React.ReactNode
  }
}

export function HeaderSection({
  sx,
  slots,
  className,
  disableOffset,
  disableElevation,
  layoutQuery = 'md',
  ...other
}: HeaderSectionProps) {
  const { offsetTop: isOffset } = useScrollOffsetTop()

  return (
    <HeaderRoot
      position='sticky'
      color='transparent'
      elevation={disableElevation ? 0 : isOffset && !disableOffset ? 1 : 0}
      className={mergeClasses([layoutClasses.header, className])}
      sx={sx}
      {...other}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
        <HeaderContent>
          {slots?.leftArea}
          {slots?.centerArea}
          {slots?.rightArea}
        </HeaderContent>
      </Container>
    </HeaderRoot>
  )
}

// ----------------------------------------------------------------------

const HeaderRoot = styled(AppBar)(({ theme }) => ({
  zIndex: 'var(--layout-header-zIndex)',
  minHeight: 'var(--layout-header-mobile-height)',
  backdropFilter: `blur(28px) saturate(210%)`,
  WebkitBackdropFilter: `blur(28px) saturate(210%)`,
  backgroundColor: 'rgba(15, 23, 42, 0.82)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: 'none',
  color: '#f8fafc',
  width: '100%',
  left: 0,
  right: 0,
  paddingTop: 'env(safe-area-inset-top, 0px)',
  [theme.breakpoints.up('lg')]: {
    minHeight: 'var(--layout-header-desktop-height)'
  }
}))

const HeaderContent = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 'var(--layout-header-mobile-height)',
  width: '100%',
  [theme.breakpoints.up('lg')]: {
    minHeight: 'var(--layout-header-desktop-height)'
  }
}))
