import { Users, MapPin, Star } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

export default function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Negociación Directa",
      description:
        "Conecta directamente con agricultores sin intermediarios, garantizando precios justos para ambas partes.",
    },
    {
      icon: MapPin,
      title: "Productos Locales",
      description:
        "Encuentra productos frescos de tu región, apoyando la economía local y reduciendo la huella de carbono.",
    },
    {
      icon: Star,
      title: "Calidad Garantizada",
      description:
        "Sistema de calificaciones y reseñas que garantiza la calidad y confiabilidad de cada transacción.",
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir AgroConecta?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Revolucionamos la forma en que se comercializan los productos agrícolas
            en Colombia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="text-center border-green-100 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <feature.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-green-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
