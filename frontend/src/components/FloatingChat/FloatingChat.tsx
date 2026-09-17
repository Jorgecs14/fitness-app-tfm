// Chat del Entrenador - Canal directo entre Atleta y su Entrenador Asignado (Sin IA / Respuestas Reales)
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
  Alert,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
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
  MessageSquare
} from 'lucide-react';
import { User as UserType } from '../../types/User';

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  senderName?: string;
  content: string;
  timestamp: string; // ISO string
}

interface FloatingChatProps {
  open?: boolean;
  onClose?: () => void;
  currentUser?: UserType | null;
}

const QUICK_COACH_PROMPTS = [
  { icon: Dumbbell, text: 'Tengo dudas sobre cómo adaptar las cargas de la sesión de hoy.' },
  { icon: Apple, text: 'No me gusta la comida asignada para hoy, ¿qué alternativa me recomiendas?' },
  { icon: TrendingUp, text: 'He completado el entrenamiento con buenas sensaciones y he subido pesos.' },
  { icon: ShieldCheck, text: 'Tengo una ligera molestia articular, ¿sustituyo algún ejercicio?' }
];

const getInitialGreeting = (userName?: string, coachName?: string): ChatHistoryMessage => ({
  id: 'coach-welcome-1',
  role: 'assistant',
  senderName: coachName || 'Entrenador Personal',
  content: `¡Hola ${userName ? userName.split(' ')[0] : ''}! Soy tu entrenador personal. Aquí tienes tu canal directo para consultarme cualquier duda sobre tus rutinas, técnica de ejercicios, cargas de trabajo o pautas nutricionales. Te responderé personalmente para revisar y ajustar tu planificación siempre que lo necesites.`,
  timestamp: new Date().toISOString()
});

export const FloatingChat: React.FC<FloatingChatProps> = ({
  open = false,
  onClose,
  currentUser
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const userId = currentUser?.id || 'guest';
  const clientStorageKey = `lifeboost_coach_chat_client_${userId}`;
  const masterStorageKey = `lifeboost_coach_chat_master_${userId}`;

  // Nombre del entrenador asignado y nombre del usuario cliente
  const coachDisplayName = (currentUser as any)?.trainer?.name
    ? `${(currentUser as any).trainer.name} ${(currentUser as any).trainer.surname || ''}`.trim()
    : 'Entrenador Asignado';

  const clientDisplayName = currentUser?.name
    ? `${currentUser.name} ${currentUser.surname || ''}`.trim()
    : 'Atleta';

  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar historial de conversación
  useEffect(() => {
    try {
      const savedClient = localStorage.getItem(clientStorageKey);
      if (savedClient) {
        const parsed = JSON.parse(savedClient);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      
      // Si no existe vista de cliente, verificar si existe en el registro maestro
      const savedMaster = localStorage.getItem(masterStorageKey);
      if (savedMaster) {
        const parsedMaster = JSON.parse(savedMaster);
        if (Array.isArray(parsedMaster) && parsedMaster.length > 0) {
          setMessages(parsedMaster);
          localStorage.setItem(clientStorageKey, JSON.stringify(parsedMaster));
          return;
        }
      }

      // Inicializar con mensaje inicial del profesional
      const initial = [getInitialGreeting(currentUser?.name, coachDisplayName)];
      setMessages(initial);
      localStorage.setItem(clientStorageKey, JSON.stringify(initial));
      localStorage.setItem(masterStorageKey, JSON.stringify(initial));
    } catch (e) {
      console.error('Error loading coach chat history:', e);
      setMessages([getInitialGreeting(currentUser?.name, coachDisplayName)]);
    }
  }, [userId, clientStorageKey, masterStorageKey, coachDisplayName, currentUser?.name]);

  // Persistir mensajes en almacenamiento de cliente y en el registro maestro del entrenador
  const persistMessages = (newMessages: ChatHistoryMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(clientStorageKey, JSON.stringify(newMessages));
      
      // El registro maestro del entrenador siempre conserva todos los mensajes
      const currentMaster = localStorage.getItem(masterStorageKey);
      let masterList: ChatHistoryMessage[] = [];
      if (currentMaster) {
        try {
          masterList = JSON.parse(currentMaster);
        } catch {
          masterList = [];
        }
      }
      // Combinar y deduplicar por ID
      const combinedMap = new Map<string, ChatHistoryMessage>();
      masterList.forEach((m) => combinedMap.set(m.id, m));
      newMessages.forEach((m) => combinedMap.set(m.id, m));
      const updatedMaster = Array.from(combinedMap.values());
      localStorage.setItem(masterStorageKey, JSON.stringify(updatedMaster));
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

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMessage: ChatHistoryMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      senderName: clientDisplayName,
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    persistMessages(updated);
    setInputMessage('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Si el cliente borra el chat, solo se limpia su vista local, sin perder datos en la copia del entrenador
  const handleClearClientView = () => {
    if (window.confirm('¿Deseas limpiar tu vista del chat? Tu entrenador conservará todo el registro de tus mensajes en su panel.')) {
      const resetGreeting = [getInitialGreeting(currentUser?.name, coachDisplayName)];
      setMessages(resetGreeting);
      try {
        localStorage.setItem(clientStorageKey, JSON.stringify(resetGreeting));
      } catch (e) {
        console.error('Error clearing client view:', e);
      }
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
          {/* Avatar del Entrenador */}
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
            {/* Indicador de estado */}
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
              Chat con {coachDisplayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span style={{ color: '#34C759', fontWeight: 700 }}>● Conectado</span> — Canal directo con tu preparador
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.8}>
          {messages.length > 1 && (
            <IconButton
              size="small"
              onClick={handleClearClientView}
              title="Limpiar mi vista del chat"
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
            label={`Historial de mensajes con ${coachDisplayName}`}
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
            const senderTitle = isUser
              ? `Tú (${clientDisplayName})`
              : `${coachDisplayName} (Entrenador)`;

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
                  {/* Etiqueta de Emisor con Nombre Real */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: isUser ? '#007AFF' : 'rgba(255, 255, 255, 0.55)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      mb: 0.3,
                      px: 0.5,
                    }}
                  >
                    {senderTitle}
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
        </List>

        {/* Atajos / Sugerencias de Consultas Rápidas al Entrenador */}
        {messages.length <= 2 && (
          <Box mt="auto" pt={2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600, display: 'block', mb: 1 }}>
              Mensajes frecuentes para tu entrenador:
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
            placeholder={`Escribe tu mensaje a ${coachDisplayName}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
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
            disabled={!inputMessage.trim()}
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