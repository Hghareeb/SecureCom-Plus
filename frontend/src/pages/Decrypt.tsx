import { useState } from 'react'
import { Unlock, AlertCircle, CheckCircle } from 'lucide-react'
import { encryptionApi, type EncryptedData } from '@/lib/api'

export default function Decrypt() {
  const [mode, setMode] = useState<'json' | 'emoji' | 'file'>('json')
  const [password, setPassword] = useState('')
  const [emojiText, setEmojiText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [plaintext, setPlaintext] = useState('')
  const [decryptedFileData, setDecryptedFileData] = useState<{data: string, filename: string} | null>(null)
  const [error, setError] = useState('')

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
        // File decryption
        if (!encryptedFile) {
          setError('Please select an encrypted file')
          return
        }
        
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const encryptedData = JSON.parse(e.target?.result as string)
            const data = await encryptionApi.decryptFile(password, encryptedData)
            setDecryptedFileData({
              data: data.file_data,
              filename: data.metadata?.filename || 'decrypted_file'
            })
          } catch (err: any) {
            setError(err.response?.data?.detail || 'File decryption failed')
          } finally {
            setLoading(false)
          }
        }
        reader.readAsText(encryptedFile)
        return
      }
      
      // Text decryption
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

      const data = await encryptionApi.decryptText(password, encryptedData, emoji)
      setPlaintext(data.plaintext)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Decryption failed - wrong password or corrupted data')
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Unlock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Decrypt Message</h1>
            <p className="text-sm text-gray-600">Decrypt your encrypted text or files</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => { setMode('json'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'json'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            JSON Format
          </button>
          <button
            onClick={() => { setMode('emoji'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'emoji'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            😀 Emoji Format
          </button>
          <button
            onClick={() => { setMode('file'); setPlaintext(''); setDecryptedFileData(null); setError('') }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'file'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📁 File
          </button>
        </div>

        {/* JSON Mode */}
        {mode === 'json' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Encrypted Data (JSON)
                </label>
                <button
                  onClick={loadFromFile}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Load from File
                </button>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="input-field min-h-[200px] font-mono text-sm resize-y"
                placeholder='{"ciphertext": "...", "salt": "...", "nonce": "...", "tag": "...", "kdf": "argon2"}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={loading || !password || !jsonText}
              className="btn-primary w-full"
            >
              {loading ? 'Decrypting...' : 'Decrypt Message'}
            </button>
          </div>
        )}

        {/* Emoji Mode */}
        {mode === 'emoji' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoji Ciphertext
              </label>
              <textarea
                value={emojiText}
                onChange={(e) => setEmojiText(e.target.value)}
                className="input-field min-h-[120px] resize-y text-lg"
                placeholder="Paste emoji ciphertext here... 😀🐶🐱🐭🍎🍌..."
                style={{ lineBreak: 'anywhere', wordBreak: 'keep-all' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Copy the entire emoji string - features animals, food, nature & more!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={loading || !password || !emojiText}
              className="btn-primary w-full"
            >
              {loading ? 'Decrypting...' : 'Decrypt Message'}
            </button>
          </div>
        )}

        {/* File Mode */}
        {mode === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encrypted File
              </label>
              <input
                type="file"
                onChange={(e) => setEncryptedFile(e.target.files?.[0] || null)}
                accept=".json"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select the JSON file containing encrypted file data
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={loading || !password || !encryptedFile}
              className="btn-primary w-full"
            >
              {loading ? 'Decrypting...' : 'Decrypt File'}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert-error mt-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result */}
      {plaintext && (
        <div className="card animate-slide-up bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-green-900">✅ Decryption Successful</h2>
          </div>

          <div className="mb-2">
            <label className="text-sm font-medium text-green-800 mb-2 block">
              Decrypted Message
            </label>
            <div className="p-4 bg-white rounded-lg border border-green-300 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-900">{plaintext}</pre>
            </div>
          </div>
        </div>
      )}

      {/* File Result */}
      {decryptedFileData && (
        <div className="card animate-slide-up bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-green-900">✅ File Decrypted Successfully</h2>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-green-800 mb-2 block">
              Decrypted File: {decryptedFileData.filename}
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Your file has been decrypted and is ready to download.
            </p>
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = `data:application/octet-stream;base64,${decryptedFileData.data}`
                link.download = decryptedFileData.filename
                link.click()
              }}
              className="btn-primary"
            >
              📥 Download Decrypted File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
