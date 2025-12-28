import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Shield, Lock, Key, HelpCircle, AlertTriangle, Zap, BookOpen, FileText, MessageCircle, X, ChevronUp, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function FAQHelp() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', text: string }>>([
    { role: 'ai', text: 'Hi! I\'m your AI encryption assistant. Ask me anything about SecureCom+ features!' }
  ])
  const [input, setInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input
    if (!messageToSend.trim() || loading) return
    
    const newMessages = [...messages, { role: 'user' as const, text: messageToSend }]
    setMessages(newMessages)
    if (!customMessage) setInput('')
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          conversation_history: messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      setMessages([...newMessages, { role: 'ai', text: data.response }])
    } catch (error) {
      setMessages([...newMessages, { 
        role: 'ai', 
        text: 'Sorry, I encountered an error connecting to the AI service. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickTopics = [
    {
      icon: Shield,
      title: "Privacy & Security",
      question: "Is my data secure?",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Key,
      title: "Passwords",
      question: "What if I lose my password?",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: Lock,
      title: "Encryption",
      question: "How does AES-256 work?",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Zap,
      title: "Features",
      question: "What can I encrypt?",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: AlertTriangle,
      title: "Troubleshooting",
      question: "Why won't it decrypt?",
      color: "from-red-600 to-orange-600"
    },
    {
      icon: FileText,
      title: "File Encryption",
      question: "How to encrypt files?",
      color: "from-orange-600 to-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-20">
      {/* Hero - Minimal */}
      <section className="max-w-6xl mx-auto px-6 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-orange-600" />
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            FAQ & Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ask our AI assistant anything about encryption
          </p>
        </motion.div>
      </section>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-20 right-0 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">AI Assistant</h3>
                  <div className="flex items-center gap-2 text-xs opacity-90">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  <motion.button
                    onClick={() => handleSend()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold text-sm"
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {chatOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Quick Topic Cards */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-8">
          Quick Topics
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickTopics.map((topic, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChatOpen(true)
                setTimeout(() => handleSend(topic.question), 300)
              }}
              className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all text-left"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${topic.color} mb-4`}>
                <topic.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topic.question}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl text-white shadow-2xl text-center"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-black mb-3">Need More Help?</h3>
          <p className="text-lg opacity-90 mb-6">
            Check out our comprehensive guides and documentation
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                About & Security
              </motion.button>
            </Link>
            <Link to="/encrypt">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:shadow-xl transition-shadow"
              >
                Try Encryption
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
