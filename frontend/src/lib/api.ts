import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface EncryptedData {
  filename?: string
  mimetype?: string
  size?: number
  ciphertext: string
  salt: string
  nonce: string
  tag: string
  kdf: string
}

export interface EncryptTextResponse {
  success: boolean
  encrypted_data: EncryptedData
  emoji?: string
  emoji_stats?: {
    length: number
    unique_emojis: number
    emoji_count: number
  }
}

export interface DecryptTextResponse {
  success: boolean
  plaintext: string
}

export interface FileMetadata {
  filename: string
  size: number
  mimetype: string
}

export interface EncryptFileResponse {
  success: boolean
  encrypted_data: EncryptedData
  metadata: FileMetadata
}

export interface QRTokenResponse {
  success: boolean
  token: string
  url: string
  qr_image: string
  expires_at: string
}

// API functions
export const encryptionApi = {
  encryptText: async (plaintext: string, password: string, useEmoji = false) => {
    const response = await api.post<EncryptTextResponse>('/api/encryption/text/encrypt', {
      plaintext,
      password,
      use_emoji: useEmoji,
    })
    return response.data
  },

  decryptText: async (password: string, encryptedData: Partial<EncryptedData>, emoji?: string) => {
    const response = await api.post<DecryptTextResponse>('/api/encryption/text/decrypt', {
      password,
      emoji,
      ...encryptedData,
    })
    return response.data
  },

  encryptFile: async (file: File, password: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const response = await api.post<EncryptFileResponse>('/api/encryption/file/encrypt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  decryptFile: async (password: string, encryptedData: EncryptedData) => {
    const response = await api.post('/api/encryption/file/decrypt', {
      password,
      encrypted_data: encryptedData,
    })
    return response.data
  },
}

export const qrApi = {
  createToken: async (encryptedMessage: EncryptedData, expiryHours = 24) => {
    const response = await api.post<QRTokenResponse>('/api/qr/create', {
      encrypted_message: encryptedMessage,
      expiry_hours: expiryHours,
    })
    return response.data
  },

  viewToken: async (token: string) => {
    const response = await api.get(`/api/qr/view/${token}`)
    return response.data
  },

  getTokenStatus: async (token: string) => {
    const response = await api.get(`/api/qr/status/${token}`)
    return response.data
  },
}

export const healthApi = {
  check: async () => {
    const response = await api.get('/api/health')
    return response.data
  },
}
