import { RouterProvider } from 'react-router-dom'
import './App.css'
import router from './router/Router'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PlayerProvider>
          <RouterProvider router={router} />
        </PlayerProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
