import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import zxcvbn from 'zxcvbn'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface PasswordStrength {
  score: number // 0-4
  feedback: {
    warning: string
    suggestions: string[]
  }
  crackTime: string
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  color: string
}

export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      feedback: { warning: '', suggestions: [] },
      crackTime: '',
      strength: 'Very Weak',
      color: 'text-red-600',
    }
  }

  const result = zxcvbn(password)
  
  const strengthLabels: Record<number, PasswordStrength['strength']> = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Strong',
    4: 'Very Strong',
  }

  const colors: Record<number, string> = {
    0: 'text-red-600',
    1: 'text-orange-600',
    2: 'text-yellow-600',
    3: 'text-green-600',
    4: 'text-emerald-600',
  }

  return {
    score: result.score,
    feedback: result.feedback,
    crackTime: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
    strength: strengthLabels[result.score],
    color: colors[result.score],
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function downloadFile(data: string, filename: string, mimeType = 'application/octet-stream') {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
