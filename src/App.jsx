import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Contacts from './pages/Contacts'
import ContactDetails from './pages/ContactDetails'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/contacts" replace />} />
          <Route 
            path="/contacts" 
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contacts/:id" 
            element={
              <ProtectedRoute>
                <ContactDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
