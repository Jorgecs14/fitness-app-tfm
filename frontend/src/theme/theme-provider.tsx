// Provider del tema Material-UI con configuración Liquid Glass iOS 26 nativa para toda la aplicación
import CssBaseline from '@mui/material/CssBaseline'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider
} from '@mui/material/styles'

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#06b6d4',
        light: '#22d3ee',
        dark: '#0891b2',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff'
      },
      error: {
        main: '#f43f5e',
        light: '#fb7185',
        dark: '#e11d48'
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706'
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669'
      },
      info: {
        main: '#22d3ee',
        light: '#67e8f9',
        dark: '#0e7490'
      },
      background: {
        default: '#090d16',
        paper: 'rgba(15, 23, 42, 0.78)'
      },
      text: {
        primary: '#f8fafc',
        secondary: 'rgba(255, 255, 255, 0.68)'
      },
      divider: 'rgba(255, 255, 255, 0.08)'
    },
    typography: {
      fontFamily:
        '"DM Sans Variable", "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 900, letterSpacing: '-0.03em' },
      h2: { fontWeight: 900, letterSpacing: '-0.025em' },
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 800, letterSpacing: '-0.015em' },
      h5: { fontWeight: 800, letterSpacing: '-0.01em' },
      h6: { fontWeight: 800 },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 700 },
      body1: { fontSize: '0.95rem' },
      body2: { fontSize: '0.875rem' },
      button: { fontWeight: 700, textTransform: 'none' }
    },
    shape: {
      borderRadius: 16
    },
    components: {
      // 1. Inputs de formulario globales (OutlinedInput) - Liquid Glass con halo cian
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.45)',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.2)'
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid #22d3ee',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.38)'
            },
            '&.Mui-error': {
              backgroundColor: 'rgba(244, 63, 94, 0.06)',
              border: '1px solid #f43f5e',
              boxShadow: '0 0 16px rgba(244, 63, 94, 0.25)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          input: {
            color: '#f8fafc',
            padding: '12px 16px',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.45)',
              opacity: 1
            }
          }
        }
      },

      // 2. Labels de formulario
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'rgba(255, 255, 255, 0.65)',
            fontWeight: 500,
            fontSize: '0.9rem',
            '&.Mui-focused': {
              color: '#22d3ee',
              fontWeight: 700
            },
            '&.Mui-error': {
              color: '#f43f5e'
            }
          }
        }
      },

      // 3. Menús y Desplegables (Select & MenuItem)
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: '#22d3ee',
            transition: 'transform 0.25s ease'
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 25px rgba(6, 182, 212, 0.15)',
            padding: '6px'
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 4px',
            color: '#f8fafc',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(6, 182, 212, 0.18)',
              color: '#22d3ee',
              transform: 'translateX(3px)'
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(6, 182, 212, 0.25)',
              color: '#22d3ee',
              fontWeight: 800,
              '&:hover': {
                backgroundColor: 'rgba(6, 182, 212, 0.32)'
              }
            }
          }
        }
      },

      // 4. Modales y Diálogos
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.90) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65), 0 0 35px rgba(6, 182, 212, 0.2)',
            color: '#f8fafc'
          }
        }
      },

      // 5. Botones Liquid Glass
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:active': {
              transform: 'scale(0.97)'
            }
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(6, 182, 212, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              boxShadow: '0 12px 28px rgba(6, 182, 212, 0.55)',
              transform: 'translateY(-1.5px)'
            }
          },
          outlined: {
            borderColor: 'rgba(255, 255, 255, 0.18)',
            color: '#f8fafc',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            '&:hover': {
              borderColor: 'rgba(34, 211, 238, 0.5)',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.2)'
            }
          }
        }
      },

      // 6. Cards y Papers
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.80) 0%, rgba(30, 41, 59, 0.72) 100%)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            color: '#f8fafc',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              borderColor: 'rgba(34, 211, 238, 0.4)',
              boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(6, 182, 212, 0.18)',
              transform: 'translateY(-2px)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            color: '#f8fafc',
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(28px) saturate(210%)',
            WebkitBackdropFilter: 'blur(28px) saturate(210%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            backgroundImage: 'none'
          }
        }
      },

      // 7. Chips & Badges
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.78rem'
          }
        }
      },

      // 8. Sliders táctiles con halo neón
      MuiSlider: {
        styleOverrides: {
          root: {
            color: '#22d3ee',
            height: 8
          },
          thumb: {
            height: 22,
            width: 22,
            backgroundColor: '#ffffff',
            border: '3px solid #06b6d4',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.7)',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.9)'
            }
          },
          track: {
            height: 8,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #06b6d4, #3b82f6)'
          },
          rail: {
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.12)'
          }
        }
      },

      // 9. Tooltips
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            borderRadius: 10,
            fontSize: '0.8rem',
            color: '#ffffff'
          }
        }
      },

      // 10. Checkboxes & Switches
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: 'rgba(255, 255, 255, 0.4)',
            '&.Mui-checked': {
              color: '#22d3ee'
            }
          }
        }
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 44,
            height: 26,
            padding: 0
          },
          switchBase: {
            padding: 3,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#ffffff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#06b6d4',
                opacity: 1
              }
            }
          },
          thumb: {
            width: 20,
            height: 20
          },
          track: {
            borderRadius: 13,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 1
          }
        }
      },

      // 11. Tablas Liquid Glass
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc'
          },
          head: {
            color: '#22d3ee',
            fontWeight: 800,
            backgroundColor: 'rgba(255, 255, 255, 0.04)'
          }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(6, 182, 212, 0.08) !important'
            }
          }
        }
      },

      // 12. Tabs Liquid Glass
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#22d3ee',
            height: 3,
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 0 12px #22d3ee'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.65)',
            transition: 'all 0.25s ease',
            '&:hover': {
              color: '#22d3ee'
            },
            '&.Mui-selected': {
              color: '#22d3ee',
              fontWeight: 800
            }
          }
        }
      },

      // 13. Listas y ListItemButton
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(6, 182, 212, 0.14)',
              color: '#22d3ee'
            }
          }
        }
      },

      // 14. Accordion
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px !important',
            color: '#f8fafc',
            margin: '8px 0 !important',
            '&::before': { display: 'none' }
          }
        }
      }
    }
  })

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export default ThemeProvider
