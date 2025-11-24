import { motion } from 'framer-motion'
import { BookOpen, Zap, Lock, Unlock, QrCode, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Help() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-purple-600" />
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Help & Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Quick start guides, glossary, and troubleshooting
          </p>
        </motion.div>
      </section>

      {/* Quick Start */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12 text-center">
          Quick Start Guide
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Encrypt Guide */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Encrypting Data</h3>
            </div>

            <ol className="space-y-4">
              {[
                { icon: FileText, text: "Go to the Encrypt page", highlight: "/encrypt" },
                { icon: null, text: "Choose encryption type: Text or File" },
                { icon: null, text: "Enter your message or upload a file" },
                { icon: null, text: "Create a strong password (12+ characters)" },
                { icon: CheckCircle, text: "Click 'Encrypt' and copy the result" },
                { icon: null, text: "Optional: Generate QR code for one-time sharing" }
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span>
                    {step.text}
                    {step.highlight && (
                      <Link to={step.highlight} className="text-purple-600 dark:text-purple-400 font-semibold ml-1">
                        {step.highlight}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Decrypt Guide */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                <Unlock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Decrypting Data</h3>
            </div>

            <ol className="space-y-4">
              {[
                { text: "Go to the Decrypt page", highlight: "/decrypt" },
                { text: "Choose decryption type: Text or File" },
                { text: "Paste the encrypted data (JSON or emojis)" },
                { text: "Enter the password used for encryption" },
                { text: "Click 'Decrypt' to reveal the message" },
                { text: "For files: Download button will appear" }
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span>
                    {step.text}
                    {step.highlight && (
                      <Link to={step.highlight} className="text-blue-600 dark:text-blue-400 font-semibold ml-1">
                        {step.highlight}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </section>

      {/* Glossary */}
      <section className="max-w-6xl mx-auto px-6 mb-20 bg-gray-50 dark:bg-gray-900/50 py-16 rounded-3xl">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12 text-center">
          Encryption Glossary
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              term: "AES-256-GCM",
              definition: "Advanced Encryption Standard using 256-bit keys in Galois/Counter Mode. Provides both encryption and authentication.",
              icon: Lock
            },
            {
              term: "Argon2id",
              definition: "Memory-hard password hashing function that's resistant to both side-channel and GPU attacks. Used for key derivation.",
              icon: Lock
            },
            {
              term: "Salt",
              definition: "Random data added to your password before hashing. Ensures identical passwords produce different encryption keys.",
              icon: Zap
            },
            {
              term: "Nonce",
              definition: "Number used Once. A random value that ensures the same data encrypted multiple times produces different ciphertext.",
              icon: Zap
            },
            {
              term: "Tag",
              definition: "Authentication tag that verifies data hasn't been tampered with. Provides data integrity and authenticity.",
              icon: CheckCircle
            },
            {
              term: "KDF",
              definition: "Key Derivation Function. Converts your password into a cryptographic key suitable for encryption (we use Argon2).",
              icon: Lock
            },
            {
              term: "Ciphertext",
              definition: "Your encrypted data. Looks like random characters and can only be converted back to plaintext with the correct password.",
              icon: FileText
            },
            {
              term: "Base64",
              definition: "Encoding scheme that represents binary data as ASCII text. Makes encrypted data safe to copy/paste and transmit.",
              icon: FileText
            },
            {
              term: "Client-Side Encryption",
              definition: "Encryption happens in your browser, not on a server. We never see your password or unencrypted data.",
              icon: CheckCircle
            },
            {
              term: "One-Time Token",
              definition: "QR code link that can only be used once. After decryption, the token is consumed and becomes invalid.",
              icon: QrCode
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.term}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.definition}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12 text-center">
          Common Issues & Solutions
        </h2>

        <div className="space-y-6">
          {[
            {
              issue: "Decryption fails with correct password",
              icon: AlertCircle,
              color: "red",
              solutions: [
                "Check for extra spaces when copy-pasting",
                "Ensure you copied the complete encrypted data",
                "Verify you're using the same encryption mode (text vs file)",
                "Make sure the encrypted data wasn't modified",
                "Try copying the data again from the source"
              ]
            },
            {
              issue: "Emoji decryption rejected",
              icon: AlertCircle,
              color: "orange",
              solutions: [
                "Don't add or remove any emojis",
                "Don't change the emoji order",
                "Only use emojis from the encrypted output",
                "This is a security feature to detect tampering",
                "Copy the entire emoji string carefully"
              ]
            },
            {
              issue: "QR token already viewed",
              icon: QrCode,
              color: "purple",
              solutions: [
                "QR tokens are single-use only by design",
                "Once decrypted, the token is consumed",
                "Generate a new QR code if you need to share again",
                "Don't refresh the page after decrypting",
                "Save the decrypted message before closing"
              ]
            },
            {
              issue: "File encryption/decryption slow",
              icon: Zap,
              color: "blue",
              solutions: [
                "Large files take more time to process",
                "Encryption happens in your browser using JavaScript",
                "Consider compressing large files first",
                "Close other browser tabs to free memory",
                "Use desktop browser for better performance"
              ]
            },
            {
              issue: "Password strength indicator shows 'weak'",
              icon: Lock,
              color: "green",
              solutions: [
                "Use at least 12 characters",
                "Mix uppercase, lowercase, numbers, and symbols",
                "Avoid common words and patterns",
                "Don't use personal information",
                "Consider using a passphrase (multiple words)"
              ]
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-${item.color}-500 rounded-xl flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.issue}</h3>
                  <ul className="space-y-2">
                    {item.solutions.map((solution, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tips & Best Practices */}
      <section className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl text-white shadow-2xl"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-6" />
          <h3 className="text-3xl font-black text-center mb-8">Best Practices</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Always use strong, unique passwords",
              "Store passwords in a password manager",
              "Never share passwords over insecure channels",
              "Keep encrypted backups of important data",
              "Test decryption before deleting originals",
              "Use QR tokens for sensitive one-time sharing",
              "Verify data integrity after encryption",
              "Remember: lost passwords = lost data"
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-xl p-4">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
