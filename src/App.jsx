import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Contacts from './pages/Contacts'
import ContactDetails from './pages/ContactDetails'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/contacts" replace />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetails />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
