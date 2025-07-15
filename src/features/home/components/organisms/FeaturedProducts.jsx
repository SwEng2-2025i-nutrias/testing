import ProductGrid from "@/features/product-discovery/components/organisms/ProductGrid"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const featuredProducts = [
	{
		id: 1,
		name: "Café Orgánico Premium",
		farmer: "María González",
		location: "Huila, Colombia",
		price: 15000,
		unit: "kg",
		image: "/placeholder.svg?height=200&width=300",
		rating: 4.8,
		harvest: "Diciembre 2024",
	},
	// ...other featured products
]

export default function FeaturedProducts() {
	return (
		<section className="py-20 px-4 bg-green-50">
			<div className="container mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Productos Destacados
					</h2>
					<p className="text-xl text-gray-600">
						Descubre los mejores productos de nuestros agricultores
					</p>
				</div>

				<ProductGrid products={featuredProducts} />

				<div className="text-center mt-12">
					<Button variant="outline" size="lg" asChild>
						<Link to="/productos">Ver más productos</Link>
					</Button>
				</div>
			</div>
		</section>
	)
}
