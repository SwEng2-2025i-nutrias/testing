import { ThemeProvider } from './shared/context/theme-provider'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import LoginPage from './features/authentication/pages/LoginPage'
import '@/styles/globals.css'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">AgroConecta</h1>
          <p className="text-muted-foreground">Bienvenido a nuestra plataforma</p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Registrarse</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/home">Landing</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/Products">Products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/farmer/products">mis productos</Link>
            </Button>
          </div>
        </div>
      </div>
      
    </ThemeProvider>
  )
}

export default App
