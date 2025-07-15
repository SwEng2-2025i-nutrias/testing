import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const tiposProductos = [
  "Frutas", "Verduras", "Hortalizas", "Granos", "Café", "Cacao",
  "Tubérculos", "Cereales", "Legumbres", "Hierbas aromáticas"
]

export default function ProductInterestSelector({ selectedProducts, onProductChange }) {
  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-medium text-blue-800">Información de Comprador</h3>
      <div className="space-y-3">
        <Label className="text-base">Tipos de Productos de Interés</Label>
        <div className="grid grid-cols-2 gap-3">
          {tiposProductos.map((producto) => (
            <div key={producto} className="flex items-center space-x-2">
              <Checkbox
                id={producto}
                checked={selectedProducts.includes(producto)}
                onCheckedChange={(checked) => onProductChange(producto, checked)}
              />
              <Label htmlFor={producto} className="text-sm cursor-pointer">
                {producto}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
