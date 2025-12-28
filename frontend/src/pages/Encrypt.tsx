import { useState, useRef, useEffect } from 'react'
import { Lock, FileText, Copy, QrCode, Check, AlertCircle, Sparkles, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { encryptionApi, qrApi, type EncryptedData } from '@/lib/api'
import { checkPasswordStrength, copyToClipboard } from '@/lib/utils'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator'
import { useSoundEffects } from '@/hooks/useSoundEffects'

export default function Encrypt() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [plaintext, setPlaintext] = useState('')
  const [password, setPassword] = useState('')
  const [useEmoji, setUseEmoji] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    encrypted_data: EncryptedData
    emoji?: string
    emoji_stats?: {
      length: number
      unique_emojis: number
      emoji_count: number
    }
    qr_image?: string
    qr_url?: string
  } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const passwordStrength = checkPasswordStrength(password)
  const { playEncrypt, playSuccess, playError } = useSoundEffects()

  // Auto-scroll to results when encryption succeeds
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [result])

  const handleEncryptText = async () => {
    if (!plaintext || !password) {
      setError('Please enter text and password')
      return
    }

    setLoading(true)
    setError('')
    try {
      playEncrypt()
      const data = await encryptionApi.encryptText(plaintext, password, useEmoji)
      setResult(data)
      playSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Encryption failed')
      playError()
    } finally {
      setLoading(false)
    }
  }

  const handleEncryptFile = async () => {
    if (!file || !password) {
      setError('Please select a file and enter password')
      return
    }

    setLoading(true)
    setError('')
    try {
      playEncrypt()
      const data = await encryptionApi.encryptFile(file, password)
      setResult(data)
      playSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'File encryption failed')
      playError()
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async () => {
    if (!result?.encrypted_data) return

    setLoading(true)
    try {
      const qrData = await qrApi.createToken(result.encrypted_data, 24)
      setResult({ ...result, qr_image: qrData.qr_image, qr_url: qrData.url })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'QR generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadEncryptedData = () => {
    if (!result) return
    const dataStr = JSON.stringify(result.encrypted_data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Use original filename if available (for file encryption), otherwise use generic name
    const filename = result.encrypted_data.filename 
      ? `${result.encrypted_data.filename}.encrypted.json`
      : 'encrypted_data.json'
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-20">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-xl mb-4">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Encrypt Message
          </h1>
          <p className="text-lg text-orange-600 dark:text-orange-400">
            Secure your data with military-grade AES-256-GCM encryption
          </p>
        </motion.div>
      </section>

      {/* Mode Selector */}
      <section className="max-w-3xl mx-auto px-6 mb-8">
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('text'); setResult(null) }}
            className={`flex-1 p-6 rounded-2xl font-bold text-lg transition-all ${
              mode === 'text'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Sparkles className="w-6 h-6 inline mr-2" />
            Text Message
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('file'); setResult(null) }}
            className={`flex-1 p-6 rounded-2xl font-bold text-lg transition-all ${
              mode === 'file'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <FileText className="w-6 h-6 inline mr-2" />
            File
          </motion.button>
        </div>
      </section>

      {/* Input Form */}
      <section className="max-w-3xl mx-auto px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-800 shadow-xl"
        >
          <AnimatePresence mode="wait">
            {mode === 'text' ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    💬 Message to Encrypt
                  </label>
                  <textarea
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[150px] resize-y"
                    placeholder="Enter your secret message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔑 Encryption Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter a strong password"
                  />
                  {password && <PasswordStrengthIndicator strength={passwordStrength} />}
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="emoji"
                    checked={useEmoji}
                    onChange={(e) => setUseEmoji(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="emoji" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Convert to Emoji Format 😀 (Fun & Shareable!)
                  </label>
                </div>

                <motion.button
                  onClick={handleEncryptText}
                  disabled={loading || !plaintext || !password}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  animate={loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity } : {}}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Encrypt Message
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    📄 Select File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".txt,.pdf,.png,.jpg,.jpeg"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Allowed: TXT, PDF, PNG, JPG (Max 10MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔑 Encryption Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter a strong password"
                  />
                  {password && <PasswordStrengthIndicator strength={passwordStrength} />}
                </div>

                <motion.button
                  onClick={handleEncryptFile}
                  disabled={loading || !file || !password}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  animate={loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity } : {}}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Encrypt File
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-200"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultRef}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="max-w-3xl mx-auto px-6 relative"
          >
            {/* Celebration Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(45deg, ${['#ef4444', '#f97316', '#fbbf24'][i % 3]}, ${['#dc2626', '#ea580c', '#f59e0b'][i % 3]})`,
                  left: '50%',
                  top: '20px',
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, Math.cos(i * 30 * Math.PI / 180) * 150],
                  y: [0, Math.sin(i * 30 * Math.PI / 180) * 150],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}

            <motion.div
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
                className="flex items-center gap-3 mb-6 relative z-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg"
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    🎉 Encryption Successful!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-orange-600 dark:text-orange-400"
                  >
                    Your data is now secure with military-grade encryption
                  </motion.p>
                </div>
              </motion.div>

              {result.emoji && (
                <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 relative z-10">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">😀 Emoji Ciphertext</label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopy(result.emoji!)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl max-h-40 overflow-y-auto text-2xl leading-relaxed">
                    {result.emoji}
                  </div>
                  {result.emoji_stats && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">
                      📊 {result.emoji_stats.length} chars • {result.emoji_stats.emoji_count} emojis • {result.emoji_stats.unique_emojis} unique
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 relative z-10">
                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                  📦 Encrypted Data (JSON)
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 dark:text-gray-300">
                    {JSON.stringify(result.encrypted_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadEncryptedData}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold border border-orange-300 dark:border-orange-700 shadow-lg"
                >
                  Download JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateQR}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Generate QR Token
                </motion.button>
              </div>

              {result.qr_image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 relative z-10"
                >
                  <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Single-Use QR Token
                  </h3>
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={`data:image/png;base64,${result.qr_image}`}
                      alt="QR Code"
                      className="w-48 h-48 border-4 border-white dark:border-gray-800 shadow-xl rounded-2xl"
                    />
                    <div className="text-center w-full">
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-2 font-medium">Share this URL:</p>
                      <code className="text-xs bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 block break-all">
                        {result.qr_url}
                      </code>
                      <p className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 font-medium">⚠️ Can only be viewed once!</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
