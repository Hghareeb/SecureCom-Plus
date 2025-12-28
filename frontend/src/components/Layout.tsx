import { Link, useLocation } from 'react-router-dom'
import { Shield, Sparkles, Menu, X } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform scroll position to scale and opacity - MORE DRAMATIC
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.7])
  const headerY = useTransform(scrollY, [0, 300], [0, -150])
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const headerBlur = useTransform(scrollY, [0, 200], [0, 10])

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Futuristic Floating Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          scale: headerScale,
          y: headerY,
          opacity: headerOpacity,
          filter: useTransform(headerBlur, (v) => `blur(${v}px)`)
        }}
        className="relative z-10 px-4 md:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-800 shadow-xl px-4 md:px-6 py-3 transition-all duration-300">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-1.5 md:p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg"
                >
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    SecureCom+
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Encryption Toolkit</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-2">
                <Link to="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive('/')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Home
                  </motion.div>
                </Link>
                <Link to="/encrypt">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive('/encrypt')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Encrypt
                  </motion.div>
                </Link>
                <Link to="/decrypt">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive('/decrypt')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Decrypt
                  </motion.div>
                </Link>
                <Link to="/ai-assistant">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      isActive('/ai-assistant')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>✨ AI Assistant</span>
                  </motion.div>
                </Link>
                <Link to="/about">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive('/about')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    About
                  </motion.div>
                </Link>
                <Link to="/faq-help">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive('/faq-help')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    FAQ & Help
                  </motion.div>
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-30 md:hidden"
          >
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-800 shadow-2xl p-4">
              <nav className="flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Home
                  </div>
                </Link>
                <Link to="/encrypt" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/encrypt')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Encrypt
                  </div>
                </Link>
                <Link to="/decrypt" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/decrypt')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Decrypt
                  </div>
                </Link>
                <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/ai-assistant')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    ✨ AI Assistant
                  </div>
                </Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/about')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    About
                  </div>
                </Link>
                <Link to="/faq-help" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      isActive('/faq-help')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    FAQ & Help
                  </div>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Full Width */}
      <main>
        {children}
      </main>

      {/* Futuristic Footer */}
      <footer className="relative mt-20 py-12 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">SecureCom+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Educational Encryption Toolkit</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bahrain Polytechnic | ICT Department
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} | AES-256-GCM + Argon2
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              For educational use only • Encrypted locally • Zero data collection
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
