import { useState, lazy, Suspense, useEffect } from 'react'
import { LoginForm } from './components/LoginForm'

const DataViewer = lazy(() => import('./components/DataViewer').then(module => ({ default: module.DataViewer })))

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        Loading...
      </div>
    );
  }

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
