// Modal de Asistente de IA con estética Apple Intelligence / Liquid Glass
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  Dumbbell,
  Apple,
  TrendingUp,
} from 'lucide-react';
import { chatService, type ChatMessage } from '../../services/chatService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingChatProps {
  open?: boolean;
  onClose?: () => void;
}

const QUICK_PROMPTS = [
  { icon: Dumbbell, text: '¿Qué rutina de empuje me recomiendas?' },
  { icon: Apple, text: '¿Cuántas calorías necesito para definir?' },
  { icon: TrendingUp, text: 'Consejos para aumentar mi peso en sentadilla' },
];

export const FloatingChat: React.FC<FloatingChatProps> = ({
  open = false,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, open]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatService.sendMessage(text, conversationHistory);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar al asistente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          height: { xs: '100%', sm: '650px' },
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(0, 122, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF',
              border: '0.5px solid rgba(0, 122, 255, 0.3)',
            }}
          >
            <Sparkles size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Asistente Fitness IA
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Impulsado por Inteligencia Artificial
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {messages.length > 0 && (
            <IconButton
              size="small"
              onClick={handleClearHistory}
              title="Borrar conversación"
              sx={{ color: 'rgba(235, 235, 245, 0.6)', '&:hover': { color: '#FF3B30' } }}
            >
              <Trash2 size={18} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'rgba(235, 235, 245, 0.8)',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
            }}
          >
            <X size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* Contenedor de Mensajes */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: '#000000',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              my: 'auto',
              textAlign: 'center',
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(0, 122, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#007AFF',
                mb: 2,
                border: '1px solid rgba(0, 122, 255, 0.25)',
              }}
            >
              <Bot size={28} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
              ¿En qué puedo ayudarte hoy?
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 3, maxWidth: 360, fontSize: '0.85rem' }}
            >
              Consulta sobre tus rutinas, cálculo de cargas, dudas de nutrición o tu plan de progreso.
            </Typography>

            <Stack spacing={1} sx={{ width: '100%', maxWidth: 420 }}>
              {QUICK_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <Box
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: '#1C1C1E',
                      border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: '#2C2C2E',
                        borderColor: 'rgba(0, 122, 255, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#007AFF', display: 'flex' }}>
                      <IconComponent size={18} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.82rem', textAlign: 'left' }}
                    >
                      {prompt.text}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ) : (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <ListItem
                  key={message.id}
                  disableGutters
                  sx={{
                    p: 0,
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  {!isUser && (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 122, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#007AFF',
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    >
                      <Bot size={16} />
                    </Box>
                  )}

                  <Box
                    sx={{
                      maxWidth: { xs: '84%', sm: '78%' },
                      p: 1.75,
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      bgcolor: isUser ? '#007AFF' : '#1C1C1E',
                      color: '#ffffff',
                      border: isUser ? 'none' : '0.5px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser
                        ? '0 4px 12px rgba(0, 122, 255, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <ListItemText
                      primary={message.content}
                      sx={{
                        m: 0,
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                          fontWeight: 400,
                        },
                      }}
                    />
                  </Box>

                  {isUser && (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    >
                      <User size={16} />
                    </Box>
                  )}
                </ListItem>
              );
            })}

            {isLoading && (
              <ListItem disableGutters sx={{ p: 0, display: 'flex', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 122, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#007AFF',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={16} />
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '18px 18px 18px 4px',
                    bgcolor: '#1C1C1E',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: '#007AFF' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.85rem' }}>
                    Pensando respuesta...
                  </Typography>
                </Box>
              </ListItem>
            )}
          </List>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mx: 2,
            mb: 1,
            borderRadius: '12px',
            bgcolor: 'rgba(255, 59, 48, 0.15)',
            color: '#FF453A',
            border: '0.5px solid rgba(255, 59, 48, 0.3)',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Input de Mensaje estilo iMessage */}
      <Box
        sx={{
          p: 2,
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#1C1C1E',
            borderRadius: '24px',
            px: 2,
            py: 0.5,
            border: '0.5px solid rgba(255, 255, 255, 0.15)',
            '&:focus-within': {
              borderColor: '#007AFF',
              boxShadow: '0 0 0 1px #007AFF',
            },
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Escribe tu mensaje a la IA..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={3}
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#ffffff',
                fontSize: '16px', // Previene auto-zoom en Safari iOS
                py: 0.75,
              },
            }}
          />

          <IconButton
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#007AFF',
              color: '#ffffff',
              flexShrink: 0,
              transition: 'transform 0.15s ease, opacity 0.15s ease',
              '&:hover': {
                bgcolor: '#0062cc',
              },
              '&:active': {
                transform: 'scale(0.92)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <Send size={18} />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default FloatingChat;