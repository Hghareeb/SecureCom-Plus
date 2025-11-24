import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { QrCode, AlertCircle, CheckCircle, Lock } from 'lucide-react'
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
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading token...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Token Error</h1>
          </div>
          <div className="alert-error">
            <p>{error}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            The token may have already been viewed or has expired.
          </p>
        </div>
      </div>
    )
  }

  if (!plaintext && encryptedMessage) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Secure Message</h1>
              <p className="text-sm text-gray-600">Enter password to decrypt</p>
            </div>
          </div>

          <div className="alert-info mb-6">
            <p className="font-semibold mb-1">⚠️ One-Time View</p>
            <p className="text-sm">
              This is a secure one-time message. Once you decrypt it, the link will be consumed and cannot be used again.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter the password shared with you"
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                autoFocus
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={!password}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Decrypt Message</span>
            </button>
          </div>

          {error && (
            <div className="alert-error mt-4">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-900">Message Decrypted</h1>
            <p className="text-sm text-green-700">Successfully unlocked secure message</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-green-800 mb-2 block">
            Decrypted Message
          </label>
          <div className="p-4 bg-white rounded-lg border border-green-300 max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-gray-900">{plaintext}</pre>
          </div>
        </div>

        <div className="alert-info">
          <p className="text-sm">
            🔒 This message was encrypted with AES-256-GCM. {viewedAt && `Decrypted at ${viewedAt.toLocaleString()}.`} The link has been consumed and cannot be used again.
          </p>
        </div>
      </div>
    </div>
  )
}
