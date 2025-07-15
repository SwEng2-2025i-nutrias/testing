import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function FileUpload({ label, ...props }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600">{label || "Haz clic para subir un archivo o arrastra aquí"}</p>
      <Input type="file" className="hidden" {...props} />
    </div>
  )
}
