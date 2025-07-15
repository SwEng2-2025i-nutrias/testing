import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Conectando el <span className="text-green-600">Campo Colombiano</span>{" "}
            con el Mundo
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Plataforma que facilita la negociación directa entre agricultores y
            compradores, eliminando intermediarios y garantizando precios justos
            para productos frescos y de calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link to="/registro">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/productos">Explorar Productos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
