import { Upload } from "lucide-react"

export default function ProductImage({ onChange }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Arrastra imágenes aquí o haz clic para seleccionar</p>
      <p className="text-xs text-gray-500 mt-1">Máximo 5 imágenes, formato JPG o PNG</p>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={onChange}
      />
    </div>
  )
}
