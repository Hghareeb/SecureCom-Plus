import { motion } from 'framer-motion'
import { useState } from 'react'
import { Shield, Lock, Key, HelpCircle, AlertTriangle, Zap, BookOpen, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FAQHelp() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', text: string }>>([
    { role: 'ai', text: 'Hi! I\'m your encryption assistant. Ask me anything about SecureCom+!' }
  ])
  const [input, setInput] = useState('')

  const handleSend = (customMessage?: string) => {
    const messageToSend = customMessage || input
    if (!messageToSend.trim()) return
    
    setMessages([...messages, { role: 'user', text: messageToSend }])
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'SecureCom+ uses AES-256-GCM encryption - the same standard used by military and banks.',
        'You can encrypt text, files, and even convert to emoji format for fun sharing!',
        'QR tokens are single-use only - perfect for sharing sensitive info securely.',
        'Password strength is analyzed in real-time using the zxcvbn algorithm.',
        'All encryption happens in your browser - we never see your data or password.',
        'Lost passwords cannot be recovered - this is by design for security.',
        'Files are encrypted with metadata preserved - filename and type are stored securely.',
        'Emoji encoding uses a special charset - tampering detection prevents modifications.',
      ]
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: responses[Math.floor(Math.random() * responses.length)] 
      }])
    }, 800)
    
    if (!customMessage) setInput('')
  }

  const quickTopics = [
    {
      icon: Shield,
      title: "Privacy & Security",
      question: "Is my data secure?",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Key,
      title: "Passwords",
      question: "What if I lose my password?",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Lock,
      title: "Encryption",
      question: "How does AES-256 work?",
      color: "from-green-500 to-emerald-500"
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
      color: "from-red-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "File Encryption",
      question: "How to encrypt files?",
      color: "from-indigo-500 to-purple-500"
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
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            FAQ & Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ask our AI assistant anything about encryption
          </p>
        </motion.div>
      </section>

      {/* AI Chat Interface - Embedded */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-800 shadow-2xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black">AI Assistant</h3>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Always here to help</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/20">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about encryption, features, troubleshooting..."
                className="flex-1 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <motion.button
                onClick={() => handleSend()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg"
              >
                Send
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

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
              onClick={() => handleSend(topic.question)}
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
          className="p-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl text-white shadow-2xl text-center"
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
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl transition-shadow"
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
