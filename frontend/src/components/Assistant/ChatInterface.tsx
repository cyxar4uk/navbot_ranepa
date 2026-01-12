import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvent } from '../../context/EventContext'
import api from '../../services/api'
import telegram from '../../services/telegram'
import type { AssistantMessage } from '../../types'
import { Send, Bot, User } from 'lucide-react'

export default function ChatInterface() {
  const { event } = useEvent()
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('item')
  
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Привет! Я AI-ассистент мероприятия "${event?.title || 'Академии'}". Задайте мне любой вопрос о программе, спикерах или навигации по Академии.`,
      timestamp: new Date(),
    }])
  }, [event])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || !event || loading) return

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    telegram.hapticImpact('light')

    try {
      const response = await api.chat({
        event_id: event.id,
        message: userMessage.content,
        context: itemId ? { item_id: itemId } : undefined,
      })

      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже или обратитесь к организаторам.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      telegram.hapticNotification('error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold">AI-Ассистент</h1>
            <p className="text-primary-200 text-sm">Отвечаю на ваши вопросы</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white rounded-tr-sm'
                  : 'bg-gray-100 tg-text rounded-tl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 safe-area-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 tg-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl tg-button flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
