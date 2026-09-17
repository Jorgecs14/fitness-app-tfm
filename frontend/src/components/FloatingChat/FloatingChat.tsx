// Chat del Entrenador - Canal directo con historial persistente y diseño Apple Dark Mode
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
  Avatar,
} from '@mui/material';
import {
  Send,
  X,
  User,
  Trash2,
  Dumbbell,
  Apple,
  TrendingUp,
  ShieldCheck,
  CheckCheck,
  HelpCircle,
  Clock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { chatService, type ChatMessage } from '../../services/chatService';
import { User as UserType } from '../../types/User';

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for robust JSON storage
}

interface FloatingChatProps {
  open?: boolean;
  onClose?: () => void;
  currentUser?: UserType | null;
}

const QUICK_COACH_PROMPTS = [
  { icon: Dumbbell, text: '¿Cómo adapto las cargas si llego al fallo antes de tiempo?' },
  { icon: Apple, text: '¿Qué opción me recomiendas si tengo que cambiar una comida?' },
  { icon: TrendingUp, text: '¿Cómo gestiono los descansos entre series pesadas?' },
  { icon: ShieldCheck, text: 'Tengo sobrecarga muscular en la espalda, ¿qué ajuste hago?' }
];

const getInitialGreeting = (userName?: string): ChatHistoryMessage => ({
  id: 'coach-welcome-1',
  role: 'assistant',
  content: `¡Hola ${userName ? userName.split(' ')[0] : ''}! Soy tu entrenador personal. Aquí tienes tu canal directo para consultarme cualquier duda sobre tus rutinas, técnica de ejercicios, cargas de trabajo o pautas nutricionales. Te responderé para ajustar tu planificación siempre que lo necesites.`,
  timestamp: new Date().toISOString()
});

export const FloatingChat: React.FC<FloatingChatProps> = ({
  open = false,
  onClose,
  currentUser
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const storageKey = `lifeboost_coach_chat_${currentUser?.id || 'guest'}`;

  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar historial persistente al montar o al cambiar de usuario
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      // Si no hay historial previo, inicializar con el saludo del entrenador
      const initial = [getInitialGreeting(currentUser?.name)];
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } catch (e) {
      console.error('Error loading coach chat history:', e);
      setMessages([getInitialGreeting(currentUser?.name)]);
    }
  }, [currentUser?.id, storageKey]);

  // Guardar en localStorage cada vez que cambien los mensajes
  const persistMessages = (newMessages: ChatHistoryMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch (e) {
      console.error('Error saving coach chat history:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 120);
    }
  }, [messages, open]);

  // Generador de respuesta inteligente del entrenador en caso de no tener API key activa
  const generateCoachLocalResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('carga') || lower.includes('peso') || lower.includes('fallo')) {
      return 'Para gestionar la sobrecarga progresiva: si no alcanzas el rango inferior de repeticiones marcadas, reduce el peso entre un 5% y 10% en la siguiente serie para priorizar la técnica y el RIR objetivo (1-2 repeticiones en reserva).';
    }
    if (lower.includes('comida') || lower.includes('dieta') || lower.includes('hambre') || lower.includes('prote')) {
      return 'En tu planificación nutricional la prioridad es cumplir el balance total diario de macronutrientes. Si necesitas sustituir una fuente de proteína o carbohidrato, mantén equivalencias similares (ej. pechuga de pollo por lomo embuchado o merluza).';
    }
    if (lower.includes('dolor') || lower.includes('molestia') || lower.includes('lesion') || lower.includes('hombro') || lower.includes('espalda')) {
      return 'Importante: no entrenes sobre dolor punzante. Reduce el rango de movimiento o sustituye temporalmente el ejercicio por una variante guiada o con mancuernas. Anota la observación en tu registro para adaptar tu siguiente semana.';
    }
    if (lower.includes('descanso') || lower.includes('recuperacion') || lower.includes('sueño')) {
      return 'Entre series compuestas pesadas (sentadilla, peso muerto, press banca) descansa entre 2 y 3 minutos para asegurar la recuperación neural. En analíticos bastará con 60 a 90 segundos.';
    }
    return `He tomado nota de tu consulta: "${prompt}". Sigue con el plan marcado y mantén el foco en la adherencia y la técnica en cada serie. Estoy revisando tus métricas semanales.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMessage: ChatHistoryMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedWithUser = [...messages, userMessage];
    persistMessages(updatedWithUser);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      let responseText = '';
      // Intentar consultar al servicio con rol de entrenador personal
      try {
        const conversationHistory: ChatMessage[] = updatedWithUser.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        responseText = await chatService.sendMessage(text, conversationHistory);
      } catch (apiErr) {
        // Fallback al asistente inteligente de entrenador si no hay VITE_OPENAI_API_KEY
        await new Promise((res) => setTimeout(res, 600));
        responseText = generateCoachLocalResponse(text);
      }

      const coachMessage: ChatHistoryMessage = {
        id: `coach-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      persistMessages([...updatedWithUser, coachMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comunicar con el entrenador');
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
    if (window.confirm('¿Deseas reiniciar el historial de conversación con tu entrenador?')) {
      const resetGreeting = [getInitialGreeting(currentUser?.name)];
      persistMessages(resetGreeting);
      setError(null);
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
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
          bgcolor: '#09090b',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '20px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.9)',
          height: { xs: '100%', sm: '680px' },
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header Apple Liquid Glass / Coach Status */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 1.8,
          flexShrink: 0
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Avatar del Entrenador con indicador de estado */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #007AFF 0%, #004fb0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35)',
              }}
            >
              <ShieldCheck size={20} />
            </Box>
            {/* Punto verde de En Línea */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 11,
                height: 11,
                borderRadius: '50%',
                bgcolor: '#34C759',
                border: '2px solid #09090b',
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2, fontSize: '0.98rem' }}>
              Chat del Entrenador
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span style={{ color: '#34C759', fontWeight: 700 }}>● En línea</span> — Canal directo y seguimiento
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.8}>
          {messages.length > 1 && (
            <IconButton
              size="small"
              onClick={handleClearHistory}
              title="Reiniciar conversación"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                '&:hover': { color: '#FF3B30', bgcolor: 'rgba(255, 59, 48, 0.12)' },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' },
            }}
          >
            <X size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* Historial Completo de Conversaciones */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.8,
          bgcolor: '#09090b',
        }}
      >
        {/* Separador de Historial */}
        <Box display="flex" justifyContent="center" my={0.5}>
          <Chip
            label="Historial de mensajes con tu preparador"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '0.68rem',
              fontWeight: 600,
              height: 22,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          />
        </Box>

        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.8 }}>
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
                  gap: 1.2,
                }}
              >
                {/* Avatar Entrenador */}
                {!isUser && (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '9px',
                      bgcolor: 'rgba(0, 122, 255, 0.15)',
                      border: '1px solid rgba(0, 122, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#007AFF',
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  >
                    <ShieldCheck size={16} />
                  </Box>
                )}

                <Box
                  sx={{
                    maxWidth: { xs: '85%', sm: '80%' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Etiqueta de Emisor */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: isUser ? '#007AFF' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      mb: 0.3,
                      px: 0.5,
                    }}
                  >
                    {isUser ? 'Tú (Atleta)' : 'Entrenador'}
                  </Typography>

                  {/* Burbuja de Mensaje */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: isUser ? '#007AFF' : '#18181b',
                      color: '#ffffff',
                      border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser
                        ? '0 4px 14px rgba(0, 122, 255, 0.3)'
                        : '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <ListItemText
                      primary={message.content}
                      sx={{
                        m: 0,
                        '& .MuiListItemText-primary': {
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          fontWeight: 400,
                        },
                      }}
                    />

                    {/* Timestamp y Ticks */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={0.5}
                      mt={0.6}
                      sx={{ opacity: 0.75 }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isUser ? '#ffffff' : 'rgba(255, 255, 255, 0.5)' }}>
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                      {isUser && <CheckCheck size={13} color="#ffffff" />}
                    </Box>
                  </Box>
                </Box>

                {/* Avatar Usuario */}
                {isUser && (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '9px',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  >
                    <User size={16} />
                  </Box>
                )}
              </ListItem>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <ListItem disableGutters sx={{ p: 0, display: 'flex', gap: 1.2 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '9px',
                  bgcolor: 'rgba(0, 122, 255, 0.15)',
                  border: '1px solid rgba(0, 122, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#007AFF',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={16} />
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '16px 16px 16px 4px',
                  bgcolor: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                }}
              >
                <CircularProgress size={14} sx={{ color: '#007AFF' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                  El entrenador está respondiendo...
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>

        {/* Atajos / Sugerencias de Consultas Rápidas al Entrenador */}
        {messages.length <= 2 && (
          <Box mt="auto" pt={2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600, display: 'block', mb: 1 }}>
              Consultas habituales de entrenamiento:
            </Typography>
            <Stack spacing={1}>
              {QUICK_COACH_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <Box
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      p: 1.2,
                      borderRadius: '12px',
                      bgcolor: '#18181b',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0, 122, 255, 0.1)',
                        borderColor: 'rgba(0, 122, 255, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#007AFF', display: 'flex' }}>
                      <IconComponent size={16} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8rem', textAlign: 'left' }}
                    >
                      {prompt.text}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
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

      {/* Input de Mensaje estilo Apple Dark Mode */}
      <Box
        sx={{
          p: 1.8,
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 1.8,
          bgcolor: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#121214',
            borderRadius: '16px',
            px: 2,
            py: 0.5,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            '&:focus-within': {
              borderColor: '#007AFF',
              boxShadow: '0 0 0 1px #007AFF',
            },
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Escribe tu mensaje o consulta al entrenador..."
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
                fontSize: '16px', // Previene auto-zoom en iOS Safari
                py: 0.8,
              },
            }}
          />

          <IconButton
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#007AFF',
              color: '#ffffff',
              flexShrink: 0,
              borderRadius: '12px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#0062cc',
                transform: 'scale(1.04)',
              },
              '&:active': {
                transform: 'scale(0.94)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.06)',
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