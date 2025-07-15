import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/shared/components/atoms/FileUpload"

export default function FarmerProfileFields({ descripcionPracticas, onDescripcionChange }) {
  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
      <h3 className="font-medium text-green-800">Información de Agricultor</h3>

      <div className="space-y-2">
        <Label htmlFor="foto">Foto de Perfil</Label>
        <FileUpload label="Haz clic para subir una foto o arrastra aquí" accept="image/*" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcionPracticas">Descripción de tus Prácticas Agrícolas</Label>
        <Textarea
          id="descripcionPracticas"
          placeholder="Describe tus métodos de cultivo, certificaciones, experiencia, etc."
          rows={4}
          value={descripcionPracticas}
          onChange={(e) => onDescripcionChange(e.target.value)}
        />
      </div>
    </div>
  )
}
