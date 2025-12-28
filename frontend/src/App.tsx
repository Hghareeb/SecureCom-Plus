import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Encrypt from './pages/Encrypt'
import Decrypt from './pages/Decrypt'
import QRView from './pages/QRView'
import About from './pages/About'
import FAQHelp from './pages/FAQHelp'
import AIAssistant from './pages/AIAssistant'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/encrypt" element={<Encrypt />} />
          <Route path="/decrypt" element={<Decrypt />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq-help" element={<FAQHelp />} />
          <Route path="/qr/:token" element={<QRView />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
