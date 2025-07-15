import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import ProductBasicInfo from "./ProductBasicInfo"
import ProductPricing from "./ProductPricing"
import ProductImage from "../atoms/ProductImage"

export default function ProductFormModal({ 
  open, 
  onOpenChange, 
  onSave, 
  isEdit = false, 
  producto = null,
  title = isEdit ? "Editar Producto" : "Publicar Nuevo Producto",
  description = isEdit 
    ? "Modifica la información de tu producto"
    : "Completa la información de tu producto para publicarlo en la plataforma"
}) {  
  const [formData, setFormData] = useState(producto || {
    name: producto?.nombre || '',
    type: producto?.tipo || '',
    price_per_unit: producto?.precio || '',
    quantity: producto?.cantidad?.split(' ')[0] || '', // Extraemos solo el número
    description: producto?.descripcion || '',
    harvest_date: producto?.fechaCosecha || ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const validationErrors = {}
    if (!formData.name) validationErrors.name = "El nombre es requerido"
    if (!formData.type) validationErrors.type = "La categoría es requerida"
    if (!formData.price_per_unit) validationErrors.price_per_unit = "El precio es requerido"
    if (!formData.quantity) validationErrors.quantity = "La cantidad es requerida"
    if (!formData.harvest_date) validationErrors.harvest_date = "La fecha de cosecha es requerida"

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const success = await onSave(formData)
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <ProductBasicInfo 
            producto={producto} 
            onChange={handleChange}
            errors={errors}
          />

          <ProductPricing 
            producto={producto} 
            onChange={handleChange}
            errors={errors}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description" 
              placeholder="Describe tu producto, su calidad, proceso de cultivo, etc." 
              defaultValue={producto?.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>Imágenes del Producto</Label>
              <ProductImage 
                onChange={(e) => handleChange("imagenes", Array.from(e.target.files))}
              />
              {errors.imagenes && (
                <p className="text-xs text-red-500">{errors.imagenes}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting 
              ? "Guardando..." 
              : isEdit 
                ? "Guardar Cambios" 
                : "Publicar Producto"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
