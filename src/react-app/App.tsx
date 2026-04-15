import { useState, lazy, Suspense } from 'react'
import { LoginForm } from './components/LoginForm'

const DataViewer = lazy(() => import('./components/DataViewer').then(module => ({ default: module.DataViewer })))

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading dashboard...</div>}>
      <DataViewer onLogout={() => setIsAuthenticated(false)} />
    </Suspense>
  )
}

export default App
