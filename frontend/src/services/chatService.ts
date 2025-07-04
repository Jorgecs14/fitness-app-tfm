interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class ChatService {
  private apiKey: string

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
  }

  async sendMessage(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('La clave API de OpenAI no está configurada. Por favor añade VITE_OPENAI_API_KEY a tu archivo .env.')
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Eres un asistente de fitness amigable. Ayuda a los usuarios con sus preguntas sobre fitness, nutrición y bienestar. Mantén las respuestas concisas, amigables y enfocadas en temas de salud y fitness. Responde siempre en español.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          n: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Error al obtener respuesta de OpenAI')
      }

      const data: ChatCompletionResponse = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('ChatService error:', error)
      throw error
    }
  }
}

export const chatService = new ChatService()
export type { ChatMessage }