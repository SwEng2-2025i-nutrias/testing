import { Eye, Package, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductList({ productos, onEdit, onDelete, onView }) {
  if (!productos?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay productos disponibles
      </div>
    );
  }
  console.log("Renderizando ProductList con productos:", productos);
  return (
    <div className="grid gap-6">
      {productos.map((producto) => (
        <Card key={producto.id}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* product image can be enabled later */}
              {/* <img
                src={producto.image || "/placeholder.svg"}
                alt={producto.name}
                className="w-20 h-20 rounded-lg object-cover"
              /> */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{producto.name}</h3>
                  <Badge variant={producto.status === "Activo" ? "default" : "secondary"}>
                    {producto.type}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${producto.price_per_unit?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    {producto.quantity || 0} unidades
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Cosecha: {producto.harvest_date ? new Date(producto.harvest_date).toLocaleDateString() : ''}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Publicado: {producto.created_at ? new Date(producto.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onView(producto)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(producto)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(producto)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
