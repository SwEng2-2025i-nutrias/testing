"use client"

import { useState } from "react"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Header from "@/shared/components/templates/Header"
import Footer from "@/shared/components/templates/Footer"
import ProductGrid from "../components/organisms/ProductGrid"
import ProductFilters from "../components/organisms/ProductFilters"

const productos = [
  {
    id: 1,
    nombre: "Café Orgánico Premium",
    agricultor: "María González",
    ubicacion: "Huila, Colombia",
    precio: 15000,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    cosecha: "Diciembre 2024",
    categoria: "Café",
    certificacion: "Orgánico",
    disponible: 500,
  },
  {
    id: 2,
    nombre: "Aguacate Hass",
    agricultor: "Carlos Rodríguez",
    ubicacion: "Antioquia, Colombia",
    precio: 3500,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    cosecha: "Enero 2025",
    categoria: "Frutas",
    certificacion: "Convencional",
    disponible: 200,
  },
  {
    id: 3,
    nombre: "Plátano Hartón",
    agricultor: "Ana Martínez",
    ubicacion: "Quindío, Colombia",
    precio: 2200,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    cosecha: "Todo el año",
    categoria: "Frutas",
    certificacion: "Convencional",
    disponible: 1000,
  },
  {
    id: 4,
    nombre: "Tomate Chonto",
    agricultor: "Luis Herrera",
    ubicacion: "Boyacá, Colombia",
    precio: 2800,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.6,
    cosecha: "Febrero 2025",
    categoria: "Verduras",
    certificacion: "Orgánico",
    disponible: 300,
  },
  {
    id: 5,
    nombre: "Cacao Fino",
    agricultor: "Pedro Sánchez",
    ubicacion: "Santander, Colombia",
    precio: 8500,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    cosecha: "Marzo 2025",
    categoria: "Cacao",
    certificacion: "Fair Trade",
    disponible: 150,
  },
  {
    id: 6,
    nombre: "Yuca Amarilla",
    agricultor: "Carmen Díaz",
    ubicacion: "Córdoba, Colombia",
    precio: 1800,
    unidad: "kg",
    imagen: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    cosecha: "Enero 2025",
    categoria: "Tubérculos",
    certificacion: "Convencional",
    disponible: 800,
  },
]

const categorias = ["Todas", "Frutas", "Verduras", "Café", "Cacao", "Tubérculos", "Granos", "Hierbas"]
const departamentos = ["Todos", "Antioquia", "Boyacá", "Córdoba", "Huila", "Quindío", "Santander"]
const certificaciones = ["Todas", "Orgánico", "Fair Trade", "Convencional"]

export default function SearchProductsPage() {
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas")
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("Todos")
  const [certificacionSeleccionada, setCertificacionSeleccionada] = useState("Todas")
  const [rangoPrecios, setRangoPrecios] = useState([0, 20000])
  const [soloOrganicos, setSoloOrganicos] = useState(false)
  const [ordenarPor, setOrdenarPor] = useState("relevancia")

  const filters = {
    categoriaSeleccionada,
    departamentoSeleccionado,
    certificacionSeleccionada,
    rangoPrecios,
    soloOrganicos,
  }

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "categoriaSeleccionada":
        setCategoriaSeleccionada(value)
        break
      case "departamentoSeleccionado":
        setDepartamentoSeleccionado(value)
        break
      case "certificacionSeleccionada":
        setCertificacionSeleccionada(value)
        break
      case "rangoPrecios":
        setRangoPrecios(value)
        break
      case "soloOrganicos":
        setSoloOrganicos(value)
        break
    }
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.agricultor.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada
    const coincideDepartamento =
      departamentoSeleccionado === "Todos" || producto.ubicacion.includes(departamentoSeleccionado)
    const coincideCertificacion =
      certificacionSeleccionada === "Todas" || producto.certificacion === certificacionSeleccionada
    const coincidePrecio = producto.precio >= rangoPrecios[0] && producto.precio <= rangoPrecios[1]
    const coincideOrganico = !soloOrganicos || producto.certificacion === "Orgánico"

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideDepartamento &&
      coincideCertificacion &&
      coincidePrecio &&
      coincideOrganico
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Título y descripción */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Productos Agrícolas Frescos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre productos directamente de los agricultores colombianos. Calidad garantizada y precios justos.
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos, agricultores..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Más Relevantes</SelectItem>
                  <SelectItem value="precio-menor">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="precio-mayor">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="rating">Mejor Calificados</SelectItem>
                  <SelectItem value="recientes">Más Recientes</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtros móviles */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros de Búsqueda</SheetTitle>
                    <SheetDescription>Refina tu búsqueda para encontrar exactamente lo que necesitas</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductFilters
                      categorias={categorias}
                      departamentos={departamentos}
                      certificaciones={certificaciones}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filtros laterales - Desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductFilters
                  categorias={categorias}
                  departamentos={departamentos}
                  certificaciones={certificaciones}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Lista de productos */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{productosFiltrados.length} productos encontrados</p>
            </div>

            {productosFiltrados.length > 0 ? (
              <ProductGrid products={productosFiltrados} />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-4">Intenta ajustar tus filtros o términos de búsqueda</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusqueda("")
                    setCategoriaSeleccionada("Todas")
                    setDepartamentoSeleccionado("Todos")
                    setCertificacionSeleccionada("Todas")
                    setRangoPrecios([0, 20000])
                    setSoloOrganicos(false)
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}

            {/* Paginación */}
            {productosFiltrados.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" disabled>
                    Anterior
                  </Button>
                  <Button variant="default" className="bg-green-600">
                    1
                  </Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Siguiente</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
