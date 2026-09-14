// Provider del tema Material-UI con configuración nativa Apple iOS Human Interface Guidelines
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
        main: '#007aff', // Apple System Blue
        light: '#47a3ff',
        dark: '#005ecb',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#5856d6', // Apple System Indigo
        light: '#7d7aff',
        dark: '#3634a3',
        contrastText: '#ffffff'
      },
      error: {
        main: '#ff3b30', // Apple System Red
        light: '#ff6961',
        dark: '#d70015'
      },
      warning: {
        main: '#ff9500', // Apple System Orange
        light: '#ffb340',
        dark: '#c97200'
      },
      success: {
        main: '#34c759', // Apple System Green
        light: '#5cd67c',
        dark: '#248a3d'
      },
      info: {
        main: '#007aff',
        light: '#5ac8fa',
        dark: '#005ecb'
      },
      background: {
        default: '#000000', // Apple OLED Pure Dark
        paper: '#1c1c1e'   // Apple System Grouped Background
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(235, 235, 245, 0.6)'
      },
      divider: 'rgba(255, 255, 255, 0.1)'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '1rem', letterSpacing: '-0.01em' },
      body2: { fontSize: '0.9rem', color: 'rgba(235, 235, 245, 0.6)' },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '-0.01em' }
    },
    shape: {
      borderRadius: 14
    },
    components: {
      // 1. Form Inputs - CRITICAL: 16px font to prevent iOS Safari auto-zoom
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: 'rgba(120, 120, 128, 0.18)',
            color: '#ffffff',
            fontSize: '16px',
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.08)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#007aff',
              borderWidth: '1.5px'
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff3b30'
            }
          },
          input: {
            fontSize: '16px !important', // iOS Safari requirement
            padding: '13px 16px',
            color: '#ffffff',
            '&::placeholder': {
              color: 'rgba(235, 235, 245, 0.35)',
              opacity: 1
            }
          }
        }
      },

      // 2. Input Labels
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'rgba(235, 235, 245, 0.6)',
            fontSize: '15px',
            '&.Mui-focused': {
              color: '#007aff'
            },
            '&.Mui-error': {
              color: '#ff3b30'
            }
          }
        }
      },

      // 3. Select & Dropdowns
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: 'rgba(235, 235, 245, 0.6)'
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            backgroundColor: '#1c1c1e',
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
            padding: '4px'
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: '15px',
            fontWeight: 500,
            padding: '8px 12px',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 122, 255, 0.18)',
              color: '#007aff',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0, 122, 255, 0.24)'
              }
            }
          }
        }
      },

      // 4. Modals & Dialogs (Apple Sheet style)
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundColor: '#1c1c1e',
            border: '0.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
            color: '#ffffff'
          }
        }
      },

      // 5. Apple Buttons
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '15px',
            minHeight: '44px',
            padding: '10px 18px',
            transition: 'transform 0.12s ease, opacity 0.12s ease',
            '&:active': {
              transform: 'scale(0.97)',
              opacity: 0.88
            }
          },
          containedPrimary: {
            backgroundColor: '#007aff',
            color: '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#0062cc',
              boxShadow: 'none'
            }
          },
          outlined: {
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            backgroundColor: 'transparent',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)'
            }
          }
        }
      },

      // 6. Cards & Papers (Apple Inset Grouped style)
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: '#1c1c1e',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'none',
            color: '#ffffff',
            backgroundImage: 'none'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            backgroundColor: '#1c1c1e',
            backgroundImage: 'none',
            border: '0.5px solid rgba(255, 255, 255, 0.08)'
          }
        }
      },

      // 7. Chips & Badges
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            border: 'none'
          }
        }
      },

      // 8. Sliders
      MuiSlider: {
        styleOverrides: {
          root: {
            color: '#007aff',
            height: 6
          },
          thumb: {
            height: 22,
            width: 22,
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          },
          track: {
            height: 6,
            borderRadius: 3
          },
          rail: {
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }
        }
      },

      // 9. Checkboxes & Switches (Apple iOS Style)
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: 'rgba(255, 255, 255, 0.4)',
            '&.Mui-checked': {
              color: '#007aff'
            }
          }
        }
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 51,
            height: 31,
            padding: 0
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: '#ffffff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#34c759',
                opacity: 1
              }
            }
          },
          thumb: {
            width: 27,
            height: 27,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          },
          track: {
            borderRadius: 31 / 2,
            backgroundColor: 'rgba(120, 120, 128, 0.32)',
            opacity: 1
          }
        }
      },

      // 10. Tables
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            padding: '12px 16px',
            fontSize: '14px'
          },
          head: {
            color: 'rgba(235, 235, 245, 0.6)',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            backgroundColor: '#1c1c1e'
          }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.04) !important'
            }
          }
        }
      },

      // 11. Tabs
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#007aff',
            height: 2.5
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            color: 'rgba(235, 235, 245, 0.6)',
            '&.Mui-selected': {
              color: '#007aff',
              fontWeight: 700
            }
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
