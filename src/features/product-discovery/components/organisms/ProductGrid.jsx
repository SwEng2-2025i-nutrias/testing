import ProductCard from "../molecules/ProductCard"

export default function ProductGrid({ products }) {
  return (
    // spacing between product cards
    <div className="grid md:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
