import { Link } from 'react-router-dom'
import { Lock, Unlock, Shield, Zap, ArrowRight, Sparkles, Star } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '../store/themeStore'
import AIAssistant from '../components/AIAssistant'

export default function Home() {
  const { isDark } = useThemeStore()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div ref={containerRef} className="relative bg-white dark:bg-gray-950 transition-colors duration-500">
      {/* AI Assistant */}
      <AIAssistant />

      {/* Animated Background - Parallax */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Gradient Mesh */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30"
          style={{ y: backgroundY }}
        />
        
        {/* Cursor Glow */}
        <div 
          className="absolute w-[600px] h-[600px] bg-orange-500/30 dark:bg-orange-500/20 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x - 300}px`,
            top: `${mousePosition.y - 300}px`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTk3LDI1MywwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 dark:opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section - Ultra Clean */}
        <motion.section
          style={{ opacity }}
          className="min-h-screen flex flex-col items-center justify-center text-center relative px-4 md:px-6"
        >
          {/* Floating Orbs */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-2xl hidden sm:block"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
            className="relative mb-8 md:mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl md:blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative p-4 md:p-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl md:rounded-3xl shadow-2xl">
              <Shield className="w-16 h-16 md:w-24 md:h-24 text-white" />
            </div>
          </motion.div>

          {/* Title with Typing Effect */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-4 md:mb-6 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent"
          >
            SecureCom<span className="text-orange-500">+</span>
          </motion.h1>

          {/* Typing Animation */}
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4 md:mb-6 h-8 md:h-12">
            <TypeAnimation
              sequence={[
                'Military-Grade Encryption',
                2000,
                'AI-Powered Security',
                2000,
                'Next-Gen Protection',
                2000,
                'Quantum-Resistant',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8 md:mb-12 px-4"
          >
            Experience the future of encryption with AES-256-GCM, emoji encoding, and AI-powered security
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md sm:max-w-none px-4 justify-center items-center"
          >
            <Link to="/encrypt" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group w-full px-6 sm:px-10 py-4 md:py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-base md:text-lg shadow-2xl flex items-center justify-center gap-3 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Lock className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
                <span className="relative z-10">Start Encrypting</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/decrypt" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 sm:px-10 py-4 md:py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 rounded-2xl font-bold text-base md:text-lg shadow-xl flex items-center justify-center gap-3"
              >
                <Unlock className="w-5 h-5 md:w-6 md:h-6" />
                <span>Decrypt</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Indicator - Fire Chevrons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1"
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="-mt-3"
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features - Minimal Cards */}
        <section className="py-16 md:py-32 max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 md:mb-4">Powerful Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">Everything you need for secure communication</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: Lock, title: "AES-256-GCM", desc: "Military-grade encryption", color: "from-red-500 to-orange-500" },
            { icon: Zap, title: "Lightning Fast", desc: "Instant encryption", color: "from-orange-500 to-yellow-500" },
            { icon: Shield, title: "Quantum-Safe", desc: "Future-proof security", color: "from-yellow-500 to-amber-500" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative p-4 md:p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl md:rounded-3xl transition-opacity`}></div>
                
                <div className={`inline-block p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-3 md:mb-4`}>
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{feature.desc}</p>
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </section>

        {/* How It Works - Scrolling Section */}
        <section className="py-16 md:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 md:mb-4">How It Works</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">Simple, fast, and secure in 3 steps</p>
            </motion.div>

            <div className="space-y-16 md:space-y-32">
              {[
                { step: "01", title: "Enter Your Message", desc: "Type your secret message or upload a file you want to encrypt", icon: Lock },
                { step: "02", title: "Choose Password", desc: "Create a strong password - we'll analyze it in real-time", icon: Shield },
                { step: "03", title: "Encrypt & Share", desc: "Get encrypted text, emoji format, or QR code to share securely", icon: Zap },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 md:gap-12`}
                >
                  <div className="flex-1 space-y-3 md:space-y-6 text-center md:text-left">
                    <div className="text-5xl sm:text-6xl md:text-8xl font-black text-orange-200 dark:text-orange-900/50">{item.step}</div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl md:rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 p-1">
                      <div className="w-full h-full rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                        <item.icon className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center"
            >
              {[
                { number: "256", label: "Bit Encryption", suffix: "" },
                { number: "100", label: "Secure", suffix: "%" },
                { number: "67", label: "Emoji Options", suffix: "+" },
                { number: "∞", label: "Possibilities", suffix: "" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="p-4 md:p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-800"
                >
                  <div className="text-3xl sm:text-4xl md:text-6xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1 md:mb-2">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-xs sm:text-sm md:text-lg text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative p-8 md:p-16 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-900 dark:to-orange-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-center"
            >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0YXJzIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+')] opacity-30"></div>
            
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 md:mb-4">Ready to Secure Your Data?</h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8">Join the future of encryption today</p>
              
              <Link to="/encrypt">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-white text-orange-600 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-shadow"
                >
                  Get Started Now →
                </motion.button>
              </Link>
            </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
