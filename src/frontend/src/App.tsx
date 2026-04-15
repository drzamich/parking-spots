import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import { DataViewer } from './components/DataViewer'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return <DataViewer onLogout={() => setIsAuthenticated(false)} />
}

export default App
