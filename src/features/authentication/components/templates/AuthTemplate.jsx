import { Link } from "react-router-dom"
import { Leaf } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ThemeToggle from "@/shared/components/atoms/ThemeToggle"

export default function AuthTemplate({ 
  title, 
  subtitle, 
  cardTitle, 
  cardDescription, 
  children 
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4">
      <div className={`w-full ${cardTitle ? 'max-w-2xl' : 'max-w-md'}`}>
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgroConecta</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="bg-card text-card-foreground">
          {(cardTitle || cardDescription) && (
            <CardHeader>
              {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
              {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
            </CardHeader>
          )}
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
