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
            height: { xs: 'calc(100% - 48px)', sm: 500 },
            maxWidth: 380,
            maxHeight: 600,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            zIndex: 1200,    
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Asistente Fitness
            </Typography>
            <Box>
              
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'white' }}
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
                sx={{ color: 'white', ml: 0.5 }}
              >
                <Iconify icon='solar:close-square-bold-duotone' width={20} />
              </IconButton>
            </Box>
          </Box>

          <Divider />

          
          <Box
            sx={{
              flex: 1,              
              overflowY: 'auto',    
              p: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  ¡Hola! Soy tu asistente de fitness. Pregúntame cualquier cosa sobre entrenamientos, nutrición o bienestar!
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
                      maxWidth: '75%',   
                      p: 1.5,
                      borderRadius: 2,
                      
                      bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      boxShadow: 1
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Pensando...
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
              sx={{ mx: 2, mb: 1 }}
            >
              {error}
            </Alert>
          )}

          <Divider />

          
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}  // Desactiva si está cargando o vacío
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabledBackground'
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