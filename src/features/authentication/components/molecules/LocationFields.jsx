import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const departamentos = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", 
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
  "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
  "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
  "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
]

export default function LocationFields({ departamento, municipio, onDepartamentoChange, onMunicipioChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-green-600" />
        <Label className="text-base font-medium">Ubicación</Label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento</Label>
          <Select value={departamento} onValueChange={onDepartamentoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu departamento" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="municipio">Municipio</Label>
          <Input
            id="municipio"
            placeholder="Tu municipio"
            value={municipio}
            onChange={(e) => onMunicipioChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
