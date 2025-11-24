import { motion } from 'framer-motion'
import { Shield, Lock, Zap, Eye, FileText, QrCode, Award, CheckCircle } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              About SecureCom+
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Your educational toolkit for understanding modern encryption
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">
              Built for Education
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              SecureCom+ is a comprehensive encryption toolkit developed as part of the ICT Department's 
              cybersecurity curriculum at Bahrain Polytechnic.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              This project demonstrates real-world implementation of military-grade encryption standards 
              while maintaining user-friendly interfaces and educational transparency.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Award className="w-12 h-12 text-purple-600" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Academic Project</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">FutureGate Bank Initiative</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Institution</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Bahrain Polytechnic</p>
            </div>
            <div className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">ICT Department</p>
            </div>
            <div className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Project Manager</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Hasan A. Ghareeb</p>
            </div>
            <div className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Advisor</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Abdulla Alsenan</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple encryption process in 4 steps</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: FileText,
                title: "Input Data",
                desc: "Enter your message or upload a file (TXT, PDF, PNG, JPG)",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: 2,
                icon: Lock,
                title: "Create Password",
                desc: "Choose a strong password with real-time strength analysis",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: 3,
                icon: Zap,
                title: "Encrypt",
                desc: "AES-256-GCM encrypts your data with Argon2 key derivation",
                color: "from-green-500 to-emerald-500"
              },
              {
                step: 4,
                icon: QrCode,
                title: "Share Securely",
                desc: "Get encrypted text, emoji format, or one-time QR token",
                color: "from-orange-500 to-red-500"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} items-center justify-center mb-4 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-purple-600 font-bold text-purple-600">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Standards */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Security Standards</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Military-grade encryption you can trust</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "AES-256-GCM",
              standard: "NIST FIPS 197",
              desc: "Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode for authenticated encryption",
              features: [
                "256-bit key length",
                "Authenticated encryption",
                "Data integrity verification",
                "Industry standard"
              ]
            },
            {
              icon: Lock,
              title: "Argon2id",
              standard: "RFC 9106",
              desc: "Password Hashing Competition winner, resistant to side-channel and GPU attacks",
              features: [
                "Memory-hard algorithm",
                "Configurable parameters",
                "Brute-force resistant",
                "Side-channel protection"
              ]
            },
            {
              icon: Eye,
              title: "Zero Knowledge",
              standard: "Client-Side Only",
              desc: "All encryption happens in your browser - we never see your password or data",
              features: [
                "Local encryption only",
                "No server storage",
                "No data collection",
                "Complete privacy"
              ]
            }
          ].map((standard, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-800 shadow-xl"
            >
              <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                <standard.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{standard.title}</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-4">{standard.standard}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{standard.desc}</p>
              <ul className="space-y-2">
                {standard.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy & Compliance */}
      <section className="py-20 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-purple-600" />
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Privacy & Compliance</h2>
            
            <div className="space-y-6 text-left">
              <div className="p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🇧🇭 PDPL Compliant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fully compliant with Bahrain's Personal Data Protection Law (PDPL 2018). 
                  All encryption is performed client-side with zero data collection or server storage.
                </p>
              </div>

              <div className="p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔒 Educational Use Only</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This is an educational project designed to demonstrate encryption principles. 
                  While using production-grade algorithms, it's intended for learning purposes.
                </p>
              </div>

              <div className="p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">✅ Bahrain Polytechnic ICT Policy</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Developed in accordance with Bahrain Polytechnic's ICT Department standards and 
                  academic integrity guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
