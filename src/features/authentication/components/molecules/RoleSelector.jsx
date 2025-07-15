import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RoleSelector({ value, onChange, error }) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">¿Cuál es tu rol?</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-green-50 transition-colors">
          <RadioGroupItem value="agricultor" id="agricultor" />
          <Label htmlFor="agricultor" className="flex-1 cursor-pointer">
            <div className="font-medium">Soy Agricultor</div>
            <div className="text-sm text-gray-500">Quiero vender mis productos</div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-green-50 transition-colors">
          <RadioGroupItem value="comprador" id="comprador" />
          <Label htmlFor="comprador" className="flex-1 cursor-pointer">
            <div className="font-medium">Soy Comprador</div>
            <div className="text-sm text-gray-500">Quiero comprar productos agrícolas</div>
          </Label>
        </div>
      </RadioGroup>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
