import ProductInput from "../atoms/ProductInput"

export default function ProductPricing({ 
  producto, 
  onChange,
  errors = {}
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProductInput 
        id="price_per_unit"
        label="Precio por Unidad (COP)"
        type="number"
        placeholder="Ej: 25000"
        defaultValue={producto?.price_per_unit}
        onChange={(e) => onChange("price_per_unit", e.target.value)}
        error={errors.price_per_unit}
      />
      
      <ProductInput
        id="quantity"
        label="Cantidad Disponible"
        type="number"
        placeholder="Ej: 100"
        defaultValue={producto?.quantity}
        onChange={(e) => onChange("quantity", e.target.value)}
        error={errors.quantity}
      />

      <div className="col-span-2">
        <ProductInput
          id="harvest_date"
          label="Fecha de Cosecha"
          type="date"
          defaultValue={producto?.harvest_date}
          onChange={(e) => onChange("harvest_date", e.target.value)}
          error={errors.harvest_date}
        />
      </div>
    </div>
  )
}
