
import ProductFormModal from "../molecules/ProductFormModal"

export default function EditProductModal({ producto, open, onOpenChange, onSave }) {
  return (
    <ProductFormModal
      open={open}
      onOpenChange={onOpenChange}
      onSave={onSave}
      isEdit={true}
      producto={producto}
    />
  )
}
