import { useState, useRef, useEffect } from 'react'
import { Unlock, AlertCircle, CheckCircle, Sparkles, FileText, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { encryptionApi, type EncryptedData } from '@/lib/api'
import { useSoundEffects } from '@/hooks/useSoundEffects'

export default function Decrypt() {
  const [mode, setMode] = useState<'json' | 'emoji' | 'file'>('json')
  const [password, setPassword] = useState('')
  const [emojiText, setEmojiText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [plaintext, setPlaintext] = useState('')
  const [decryptedFileData, setDecryptedFileData] = useState<{ filename: string, data: string, mimetype?: string } | null>(null)
  const [error, setError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const { playDecrypt, playSuccess, playError } = useSoundEffects()

  // Auto-scroll to results when decryption succeeds
  useEffect(() => {
    if ((plaintext || decryptedFileData) && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [plaintext, decryptedFileData])

  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter password')
      return
    }

    setLoading(true)
    setError('')
    setPlaintext('')
    setDecryptedFileData(null)

    try {
      if (mode === 'file') {
        if (!encryptedFile) {
          setError('Please select an encrypted file')
          return
        }
        
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const encryptedData = JSON.parse(e.target?.result as string)
            playDecrypt()
            const data = await encryptionApi.decryptFile(password, encryptedData)
            setDecryptedFileData({
              data: data.file_data,
              filename: data.metadata?.filename || 'decrypted_file',
              mimetype: data.metadata?.mimetype
            })
            playSuccess()
          } catch (err: any) {
            setError(err.response?.data?.detail || 'File decryption failed')
            playError()
          } finally {
            setLoading(false)
          }
        }
        reader.readAsText(encryptedFile)
        return
      }
      
      let encryptedData: Partial<EncryptedData> = {}
      let emoji: string | undefined

      if (mode === 'emoji') {
        if (!emojiText) {
          setError('Please enter emoji ciphertext')
          return
        }
        emoji = emojiText
      } else {
        if (!jsonText) {
          setError('Please enter encrypted JSON data')
          return
        }
        try {
          encryptedData = JSON.parse(jsonText)
        } catch {
          setError('Invalid JSON format')
          return
        }
      }

      playDecrypt()
      const data = await encryptionApi.decryptText(password, encryptedData, emoji)
      setPlaintext(data.plaintext)
      playSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Decryption failed - wrong password or corrupted data')
      playError()
    } finally {
      setLoading(false)
    }
  }

  const loadFromFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setJsonText(e.target?.result as string)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 md:py-20">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex p-3 md:p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-xl mb-4">
            <Unlock className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Decrypt Message
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Decrypt your encrypted text or files securely
          </p>
        </motion.div>
      </section>

      {/* Mode Selector */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 mb-6 md:mb-8">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('json'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`p-4 md:p-6 rounded-2xl font-bold text-sm md:text-lg transition-all ${
              mode === 'json'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">JSON</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('emoji'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`p-4 md:p-6 rounded-2xl font-bold text-sm md:text-lg transition-all ${
              mode === 'emoji'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <span className="text-lg md:text-2xl mr-1">😀</span>
            <span className="hidden sm:inline">Emoji</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('file'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`p-4 md:p-6 rounded-2xl font-bold text-sm md:text-lg transition-all ${
              mode === 'file'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 md:w-6 md:h-6 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">File</span>
          </motion.button>
        </div>
      </section>

      {/* Input Form */}
      <section className="max-w-3xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 md:p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-800 shadow-xl space-y-6"
        >
          <AnimatePresence mode="wait">
            {mode === 'json' && (
              <motion.div
                key="json"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white">
                      🔐 Encrypted Data (JSON)
                    </label>
                    <button
                      onClick={loadFromFile}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 font-medium"
                    >
                      Load from File
                    </button>
                  </div>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[200px] resize-y font-mono text-sm"
                    placeholder='{"ciphertext": "...", "salt": "...", "nonce": "...", "tag": "...", "kdf": "argon2"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔑 Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecrypt}
                  disabled={loading || !password || !jsonText}
                  animate={loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity } : {}}
                  className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">{loading ? '🔓 Decrypting...' : '🔓 Decrypt Message'}</span>
                </motion.button>
              </motion.div>
            )}

            {mode === 'emoji' && (
              <motion.div
                key="emoji"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    😀 Emoji Ciphertext
                  </label>
                  <textarea
                    value={emojiText}
                    onChange={(e) => setEmojiText(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[150px] resize-y text-2xl"
                    placeholder="Paste emoji ciphertext here... 😀🐶🐱🐭🍎🍌..."
                    style={{ lineBreak: 'anywhere', wordBreak: 'keep-all' }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Tip: Copy the entire emoji string - features animals, food, nature & more!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔑 Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecrypt}
                  disabled={loading || !password || !emojiText}
                  animate={loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity } : {}}
                  className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">{loading ? '🔓 Decrypting...' : '🔓 Decrypt Message'}</span>
                </motion.button>
              </motion.div>
            )}

            {mode === 'file' && (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    📁 Encrypted File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setEncryptedFile(e.target.files?.[0] || null)}
                    accept=".json"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select the JSON file containing encrypted file data
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔑 Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecrypt}
                  disabled={loading || !password || !encryptedFile}
                  animate={loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity } : {}}
                  className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">{loading ? '🔓 Decrypting...' : '🔓 Decrypt File'}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Text Result */}
      {plaintext && (
        <section ref={resultRef} className="max-w-3xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-3xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl md:text-2xl font-black text-orange-900 dark:text-orange-100">
                ✅ Decryption Successful
              </h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-900 dark:text-orange-100 mb-3">
                Decrypted Message
              </label>
              <div className="p-4 md:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-300 dark:border-orange-700 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">{plaintext}</pre>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* File Result */}
      {decryptedFileData && (
        <section ref={resultRef} className="max-w-3xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-3xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl md:text-2xl font-black text-orange-900 dark:text-orange-100">
                ✅ File Decrypted Successfully
              </h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-900 dark:text-orange-100 mb-2">
                Decrypted File: {decryptedFileData.filename}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Your file has been decrypted and is ready to download.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const link = document.createElement('a')
                  const mimetype = decryptedFileData.mimetype || 'application/octet-stream'
                  link.href = `data:${mimetype};base64,${decryptedFileData.data}`
                  link.download = decryptedFileData.filename
                  link.click()
                }}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Decrypted File
              </motion.button>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
