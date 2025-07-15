import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProductFilters({
  categorias,
  departamentos,
  certificaciones,
  filters,
  onFilterChange,
}) {
  const {
    categoriaSeleccionada,
    departamentoSeleccionado,
    certificacionSeleccionada,
    rangoPrecios,
    soloOrganicos,
  } = filters

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">Categoría</Label>
        <Select
          value={categoriaSeleccionada}
          onValueChange={(value) => onFilterChange("categoriaSeleccionada", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Departamento</Label>
        <Select
          value={departamentoSeleccionado}
          onValueChange={(value) => onFilterChange("departamentoSeleccionado", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((departamento) => (
              <SelectItem key={departamento} value={departamento}>
                {departamento}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Certificación</Label>
        <Select
          value={certificacionSeleccionada}
          onValueChange={(value) => onFilterChange("certificacionSeleccionada", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {certificaciones.map((certificacion) => (
              <SelectItem key={certificacion} value={certificacion}>
                {certificacion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">
          Rango de Precios: ${rangoPrecios[0].toLocaleString()} - $
          {rangoPrecios[1].toLocaleString()}
        </Label>
        <Slider
          value={rangoPrecios}
          onValueChange={(value) => onFilterChange("rangoPrecios", value)}
          max={20000}
          min={0}
          step={500}
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="organicos"
          checked={soloOrganicos}
          onCheckedChange={(checked) => onFilterChange("soloOrganicos", checked)}
        />
        <Label htmlFor="organicos">Solo productos orgánicos</Label>
      </div>
    </div>
  )
}
