import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { QrCode, AlertCircle, CheckCircle, Unlock } from 'lucide-react'
import { motion } from 'framer-motion'
import { qrApi, type EncryptedData } from '@/lib/api'

export default function QRView() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [encryptedMessage, setEncryptedMessage] = useState<EncryptedData | null>(null)
  const [password, setPassword] = useState('')
  const [plaintext, setPlaintext] = useState('')
  const [viewedAt, setViewedAt] = useState<Date | null>(null)

  useEffect(() => {
    loadToken()
  }, [token])

  const loadToken = async () => {
    if (!token) return

    setLoading(true)
    try {
      // Use status endpoint - doesn't consume the token yet
      const data = await qrApi.getTokenStatus(token)
      setEncryptedMessage(data.encrypted_message)
      // Don't set viewedAt yet since we haven't marked it as viewed
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load token')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = async () => {
    if (!encryptedMessage || !password) return

    try {
      const response = await fetch('http://localhost:8000/api/encryption/text/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...encryptedMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Decryption failed')
      }

      const data = await response.json()
      setPlaintext(data.plaintext)
      
      // Mark token as viewed now that it's been successfully decrypted
      if (token) {
        try {
          await qrApi.viewToken(token)
          setViewedAt(new Date())
        } catch {
          // Ignore errors - message already decrypted successfully
        }
      }
    } catch {
      setError('Decryption failed - wrong password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading secure message...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-red-900 dark:text-red-100">Token Error</h1>
              <p className="text-sm text-red-700 dark:text-red-300">Cannot access message</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 mb-4">
            <p className="text-gray-900 dark:text-white font-medium">{error}</p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            💡 The token may have already been viewed or has expired.
          </p>
        </motion.div>
      </div>
    )
  }

  if (!plaintext && encryptedMessage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl"
            >
              <QrCode className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Secure Message</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enter password to decrypt</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl mb-6"
          >
            <p className="font-bold text-orange-900 dark:text-orange-100 mb-1">⚠️ One-Time View</p>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              This is a secure one-time message. Once you decrypt it, the link will be consumed and cannot be used again.
            </p>
          </motion.div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                🔑 Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter the password shared with you"
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                autoFocus
              />
            </div>

            <motion.button
              onClick={handleDecrypt}
              disabled={!password}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              <Unlock className="w-5 h-5" />
              <span>Decrypt Message</span>
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200"
            >
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-8 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-3xl shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Message Decrypted</h1>
            <p className="text-sm text-orange-700 dark:text-orange-300">Successfully unlocked secure message</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-3 block">
            📄 Decrypted Message
          </label>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-300 dark:border-orange-700 max-h-80 overflow-y-auto"
          >
            <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">{plaintext}</pre>
          </motion.div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            🔒 This message was encrypted with AES-256-GCM. {viewedAt && `Decrypted at ${viewedAt.toLocaleString()}.`} The link has been consumed and cannot be used again.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
