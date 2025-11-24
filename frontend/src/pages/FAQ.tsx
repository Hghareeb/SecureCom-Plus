import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, Shield, Lock, Key, HelpCircle, AlertTriangle, Zap } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: "Privacy & Security",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          q: "Do you store my data?",
          a: "No! All encryption happens locally in your browser using JavaScript. Your data never leaves your device in an unencrypted form. We don't have servers that store your messages, files, or passwords."
        },
        {
          q: "Can you decrypt my messages?",
          a: "Absolutely not. Since encryption happens client-side and we never receive your password, it's mathematically impossible for us to decrypt your data. Only someone with the correct password can decrypt it."
        },
        {
          q: "Is this secure enough for sensitive data?",
          a: "SecureCom+ uses military-grade AES-256-GCM encryption - the same standard used by governments and banks. However, this is an educational project. For highly sensitive data, use established commercial solutions with security audits."
        },
        {
          q: "What happens to QR tokens?",
          a: "QR tokens are stored temporarily in our database (encrypted message only, not the password). Once viewed, they're marked as used and expire after 24 hours. The actual decryption still happens client-side."
        }
      ]
    },
    {
      category: "Passwords & Keys",
      icon: Key,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          q: "What if I lose my password?",
          a: "Unfortunately, your data is permanently unrecoverable. This is by design - there's no 'master key' or password recovery. Always keep your passwords safe and consider using a password manager."
        },
        {
          q: "How strong should my password be?",
          a: "We recommend at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. Our real-time password strength indicator uses zxcvbn to give you feedback. Stronger passwords = better security."
        },
        {
          q: "Can I use the same password multiple times?",
          a: "Technically yes, but we don't recommend it. Each encryption uses a unique random salt, so even with the same password, the encrypted output will be different. However, password reuse is generally bad practice."
        },
        {
          q: "What is Argon2 and why do you use it?",
          a: "Argon2 is a memory-hard key derivation function that won the Password Hashing Competition. It makes brute-force attacks extremely expensive and slow, even with powerful GPUs or specialized hardware."
        }
      ]
    },
    {
      category: "Features & Usage",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          q: "What file types can I encrypt?",
          a: "Currently: TXT, PDF, PNG, JPG, JPEG. The file is converted to base64, encrypted, and the original filename/type is preserved. Maximum file size depends on your browser's memory (typically 10-50MB works well)."
        },
        {
          q: "What is emoji encoding?",
          a: "It's a fun way to represent encrypted data using emojis instead of base64 text. Each emoji represents a specific value. It's more visual but results in longer output. Great for social media sharing!"
        },
        {
          q: "How do one-time QR tokens work?",
          a: "Generate a QR code containing an encrypted message. The QR links to a unique URL that can only be viewed once. After decryption, the token is consumed and can't be used again. Perfect for secure one-time sharing."
        },
        {
          q: "Can I decrypt on mobile?",
          a: "Yes! The web app is fully responsive. You can scan QR codes with your phone's camera and decrypt messages directly in your mobile browser."
        }
      ]
    },
    {
      category: "Technical Details",
      icon: Lock,
      color: "from-orange-500 to-red-500",
      questions: [
        {
          q: "What is AES-256-GCM?",
          a: "Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode. It provides both encryption AND authentication, meaning it can detect if encrypted data has been tampered with. It's a NIST standard (FIPS 197)."
        },
        {
          q: "What are 'salt', 'nonce', and 'tag'?",
          a: "• Salt: Random data added to your password before hashing (prevents rainbow table attacks)\n• Nonce: Number used once - ensures same plaintext encrypts to different ciphertext each time\n• Tag: Authentication tag that verifies data integrity and authenticity"
        },
        {
          q: "Is this quantum-resistant?",
          a: "AES-256 is considered quantum-resistant for symmetric encryption. However, if quantum computers become practical, key exchange methods may need updating. For now, 256-bit AES is future-proof."
        },
        {
          q: "What libraries do you use?",
          a: "Backend: PyCryptodome (Python), Argon2-cffi | Frontend: Built-in Web Crypto API where possible, with TypeScript for type safety. All open-source and audited libraries."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: AlertTriangle,
      color: "from-red-500 to-pink-500",
      questions: [
        {
          q: "Why does decryption fail with the correct password?",
          a: "Common causes:\n• Copy-paste error (missing characters)\n• Different password used for encryption\n• Encrypted data was modified/corrupted\n• Wrong decryption mode (text vs file)\nTry copying again carefully, check for extra spaces."
        },
        {
          q: "Why is my emoji decryption rejected?",
          a: "Our system detects tampering. If you:\n• Added/removed emojis\n• Changed the order\n• Used emojis not in our charset\nThe decryption will fail. This is a security feature to prevent data manipulation."
        },
        {
          q: "QR token says 'already viewed' - why?",
          a: "QR tokens are single-use only. Once the link is opened and the message is decrypted, it's consumed. If you need to share again, generate a new QR token."
        },
        {
          q: "Browser shows 'out of memory' error?",
          a: "Large files can consume significant memory during encryption. Try:\n• Smaller file size (under 10MB)\n• Close other browser tabs\n• Use a desktop browser instead of mobile\n• Compress the file first"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HelpCircle className="w-16 h-16 mx-auto mb-6 text-purple-600" />
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about SecureCom+
          </p>
        </motion.div>
      </section>

      {/* FAQ Categories */}
      <section className="max-w-5xl mx-auto px-6">
        {faqs.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-12"
          >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {category.category}
              </h2>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex
                const isOpen = openIndex === globalIndex

                return (
                  <motion.div
                    key={faqIndex}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800 overflow-hidden shadow-lg"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <span className="text-lg font-bold text-gray-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-6 h-6 text-purple-600 flex-shrink-0" />
                      </motion.div>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? 'auto' : 0,
                        opacity: isOpen ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {faq.a}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Still Have Questions? */}
      <section className="max-w-4xl mx-auto px-6 mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl text-center text-white shadow-2xl"
        >
          <h3 className="text-3xl font-black mb-4">Still have questions?</h3>
          <p className="text-xl mb-8 opacity-90">
            This is an educational project - experiment and learn!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl">
              <p className="text-sm font-semibold">Try the encryption demo</p>
            </div>
            <div className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl">
              <p className="text-sm font-semibold">Check the Help page</p>
            </div>
            <div className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl">
              <p className="text-sm font-semibold">Review the documentation</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
