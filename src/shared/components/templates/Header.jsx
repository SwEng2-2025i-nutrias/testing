import { Link } from "react-router-dom"
import { Leaf, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ThemeToggle from "@/shared/components/atoms/ThemeToggle"

export default function Header({ 
  isAuthenticated = false, 
  userName = "", 
  pageTitle = "", 
  pageDescription = "",
  showAuthButtons = true,
  userType = "",
  notificationCount = 0
}) {
  const renderAuthSection = () => {
    if (showAuthButtons && !isAuthenticated) {  
      return (
        <>
          <Button variant="outline" asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Registrarse</Link>
          </Button>
        </>
      )
    } else if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-4">

          {/* messages icon maybe could be enabled later */}
          {/* {userType === "farmer" && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/mensajes">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes ({notificationCount})
              </Link>
            </Button>
          )} */}
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      )
    }
    return null
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgroConecta</span>
          </Link>
          {pageTitle && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-700">{pageTitle}</span>
              <span className="text-gray-400">|</span>
              <div>
                {userName && (
                  <h1 className="text-lg font-bold text-gray-900">¡Bienvenido, {userName}!</h1>
                )}
                {pageDescription && (
                  <p className="text-sm text-gray-600">{pageDescription}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {renderAuthSection()}
        </div>
      </div>
    </header>
  )
}
