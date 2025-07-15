import { Link } from "react-router-dom"
import { Leaf } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-6 w-6 text-green-400" />
              <span className="text-xl font-bold">AgroConecta</span>
            </div>
            <p className="text-gray-400">
              Conectando el campo colombiano con oportunidades de negocio justas y
              sostenibles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Productos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/productos/frutas" className="hover:text-white">
                  Frutas
                </Link>
              </li>
              <li>
                <Link to="/productos/verduras" className="hover:text-white">
                  Verduras
                </Link>
              </li>
              <li>
                <Link to="/productos/granos" className="hover:text-white">
                  Granos
                </Link>
              </li>
              <li>
                <Link to="/productos/cafe" className="hover:text-white">
                  Café
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/ayuda" className="hover:text-white">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="hover:text-white">
                  Términos
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-white">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Síguenos</h3>
            <p className="text-gray-400 mb-4">
              Mantente al día con las últimas noticias del agro colombiano.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 AgroConecta. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
