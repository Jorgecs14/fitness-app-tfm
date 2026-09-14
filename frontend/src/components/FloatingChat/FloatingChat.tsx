import React, { useState, useRef, useEffect } from 'react'
import {
  Fab,
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  Zoom
} from '@mui/material'
import { Iconify } from '../../utils/iconify'
import { chatService, type ChatMessage } from '../../services/chatService'


interface Message {
  id: string                    
  role: 'user' | 'assistant'    
  content: string               
  timestamp: Date              
}

export const FloatingChat: React.FC = () => {

  const [isOpen, setIsOpen] = useState(false)              
  const [messages, setMessages] = useState<Message[]>([])   
  const [inputMessage, setInputMessage] = useState('')      
  const [isLoading, setIsLoading] = useState(false)         
  const [error, setError] = useState<string | null>(null)   
  const messagesEndRef = useRef<HTMLDivElement>(null)       

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

 
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  
  const handleSendMessage = async () => {
   
    if (!inputMessage.trim()) return

   
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

  
      const response = await chatService.sendMessage(inputMessage, conversationHistory)

      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

     
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      
      setError(error instanceof Error ? error.message : 'Error al enviar mensaje')
    } finally {
      
      setIsLoading(false)
    }
  }

 
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>

      <Zoom in={!isOpen}>
        <Fab
          color="primary"
          aria-label="abrir chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
             
              background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)'
            }
          }}
        >
          <Iconify icon='solar:chat-round-dots-bold-duotone' width={24} />
        </Fab>
      </Zoom>

      
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100% - 48px)', sm: 380 },
            height: { xs: 'calc(100% - 48px)', sm: 520 },
            maxWidth: 380,
            maxHeight: 600,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            zIndex: 1200,    
            borderRadius: 3.5,
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(28px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                }}
              >
                <Iconify icon="solar:chat-round-dots-bold" width={18} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Asistente Fitness
              </Typography>
            </Stack>
            <Box>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
              >
                <Iconify icon='solar:minimize-square-minimalistic-bold-duotone' width={20} />
              </IconButton>
              
              <IconButton
                size="small"
                onClick={() => {
                  setIsOpen(false)
                  setMessages([])      
                  setError(null)      
                }}
                sx={{ color: '#94a3b8', ml: 0.5, '&:hover': { color: '#f8fafc' } }}
              >
                <Iconify icon='solar:close-square-bold-duotone' width={20} />
              </IconButton>
            </Box>
          </Box>
          
          <Box
            sx={{
              flex: 1,              
              overflowY: 'auto',    
              p: 2,
              bgcolor: 'transparent'
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                    mb: 1.5,
                  }}
                >
                  <Iconify icon="solar:magic-stick-3-bold" width={24} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ¡Hola! Soy tu asistente de fitness. Pregúntame sobre tus rutinas, pesos, progresos o recetas nutricionales.
                </Typography>
              </Box>
            )}

            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    p: 0,
                    mb: 2,
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',   
                      p: 1.5,
                      borderRadius: 2.5,
                      background: message.role === 'user' 
                        ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      color: message.role === 'user' ? '#ffffff' : '#f8fafc',
                      border: message.role === 'user' 
                        ? 'none' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: message.role === 'user'
                        ? '0 4px 14px rgba(6, 182, 212, 0.35)'
                        : '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <ListItemText
                      primary={message.content}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                          whiteSpace: 'pre-wrap'  
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
              
              {isLoading && (
                <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                    <CircularProgress size={18} color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Analizando...
                    </Typography>
                  </Box>
                </ListItem>
              )}
            </List>
            
            <div ref={messagesEndRef} />
          </Box>
          
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}  
              sx={{ mx: 2, mb: 1, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ p: 2, bgcolor: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escribe tu mensaje..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}          
                disabled={isLoading}                 
                multiline                            
                maxRows={3}                         
              />
              
              <IconButton
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}  
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  color: 'white',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <Iconify icon='solar:arrow-right-up-bold-duotone' width={20} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  )
}