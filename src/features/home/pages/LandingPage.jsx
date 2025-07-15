import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/shared/components/templates/Header"
import Footer from "@/shared/components/templates/Footer"
import HeroSection from "../components/organisms/HeroSection"
import FeaturesSection from "../components/organisms/FeaturesSection"
import FeaturedProducts from "../components/organisms/FeaturedProducts"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main>
        <HeroSection />
        <FeaturesSection />
        <FeaturedProducts />

        {/* CTA Section */}
        <section className="py-20 px-4 bg-green-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a nuestra comunidad de agricultores y compradores comprometidos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/registro?tipo=agricultor">Soy Agricultor</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600"
                asChild
              >
                <Link to="/registro?tipo=comprador">Soy Comprador</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
