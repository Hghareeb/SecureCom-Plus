import useSound from 'use-sound'

// Sound URLs - using free sound effects from reliable CDNs
const SOUND_URLS = {
  // Short UI sounds from freesound.org / mixkit (royalty-free)
  encrypt: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // lock/click
  decrypt: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // unlock
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // success notification
  error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // error/alert
}

export function useSoundEffects() {
  const [playEncrypt] = useSound(SOUND_URLS.encrypt, { volume: 0.5 })
  const [playDecrypt] = useSound(SOUND_URLS.decrypt, { volume: 0.5 })
  const [playSuccess] = useSound(SOUND_URLS.success, { volume: 0.4 })
  const [playError] = useSound(SOUND_URLS.error, { volume: 0.5 })

  return {
    playEncrypt,
    playDecrypt,
    playSuccess,
    playError,
  }
}
