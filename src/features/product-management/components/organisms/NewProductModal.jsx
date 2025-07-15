
import ProductFormModal from "../molecules/ProductFormModal"

export default function NewProductModal({ open, onOpenChange, onSave }) {
  return (
    <ProductFormModal
      open={open}
      onOpenChange={onOpenChange}
      onSave={onSave}
      isEdit={false}
    />
  )
}
