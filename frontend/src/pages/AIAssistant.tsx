import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Copy, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: any
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your SecureCom+ AI guide. I can help you understand encryption, answer security questions, and guide you to the right tools.\n\nAsk me anything about cryptography, or tell me what you need help with!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      // Debug: Log the response data
      console.log('AI Response Data:', data)
      if (data.data) {
        console.log('Has data.data:', data.data)
        console.log('Has QR code?:', data.data.qr_code)
      }
      
      // Add AI response
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.response,
        data: data.data
      }])

    } catch (error) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please make sure the AI service is configured correctly.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              AI Encryption Assistant
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Just tell me what you want to encrypt - I'll handle the rest! 🤖
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-red-600 to-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Show QR Code first if available */}
                    {message.data && message.data.qr_code && (
                      <div className="mt-4 border-t border-white/20 pt-3">
                        <p className="text-sm font-bold mb-3">📱 Your QR Code:</p>
                        <div className="bg-white rounded-lg p-4 flex flex-col items-center gap-3">
                          <img 
                            src={`data:image/png;base64,${message.data.qr_code.image}`}
                            alt="QR Code"
                            className="w-48 h-48"
                          />
                          <a
                            href={message.data.qr_code.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-3 py-1 rounded break-all"
                          >
                            {message.data.qr_code.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <p className="text-xs text-gray-600">
                            ⏰ Expires: {new Date(message.data.qr_code.expires_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Show decryption result if available */}
                    {message.data && message.data.plaintext && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl space-y-3">
                        <div>
                          <p className="text-xs font-bold mb-2">🔓 Decrypted (Plaintext):</p>
                          <div className="bg-black/20 px-3 py-2 rounded text-sm break-words whitespace-pre-wrap">
                            {message.data.plaintext}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Show encryption result if available */}
                    {message.data && message.data.encrypted && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl space-y-3">
                        <div>
                          <p className="text-xs font-bold mb-2">🔑 Password:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-black/20 px-3 py-1 rounded flex-1">
                              {message.data.password}
                            </code>
                            <button
                              onClick={() => copyToClipboard(message.data.password)}
                              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {message.data.method === 'emoji' ? (
                          <div>
                            <p className="text-xs font-bold mb-2">😀 Encrypted (Emoji):</p>
                            <div className="bg-black/20 px-3 py-2 rounded text-2xl break-all">
                              {message.data.encrypted.emoji}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold mb-2">🔒 Encrypted (JSON):</p>
                            <div className="bg-black/20 px-3 py-2 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
                              {JSON.stringify(message.data.encrypted, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-red-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-orange-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-yellow-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask me anything about encryption, security, or how to use SecureCom+..."
                className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[60px] max-h-[150px]"
                rows={2}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "How do I encrypt a message?",
              "Is AES-256 encryption secure?",
              "What's the difference between encryption and hashing?"
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setInput(example)}
                className="text-xs px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:border-red-500 transition-colors text-gray-700 dark:text-gray-300"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
