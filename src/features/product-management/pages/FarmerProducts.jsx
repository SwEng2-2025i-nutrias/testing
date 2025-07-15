"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/shared/components/templates/Header"
import ProductList from "../components/organisms/ProductList"
import NewProductModal from "../components/organisms/NewProductModal"
import EditProductModal from "../components/organisms/EditProductModal"
import DeleteProductModal from "../components/organisms/DeleteProductModal"
import { useProducts } from "../hooks/useProducts"
// import { useAuthStore } from 
export default function FarmerProductsPage() {
  const [activeTab, setActiveTab] = useState("productos")
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false)
  const [modalEditarProducto, setModalEditarProducto] = useState(false)
  const [modalEliminarProducto, setModalEliminarProducto] = useState(false)

  const {
    products,
    isLoading,
    error,
    selectedProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    clearSelectedProduct,
    clearError
  } = useProducts();

  const handleEditProduct = (producto) => {
    setSelectedProduct(producto);
    setModalEditarProducto(true);
  };

  const handleDeleteProduct = (producto) => {
    setSelectedProduct(producto);
    setModalEliminarProducto(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      const success = await deleteProduct(selectedProduct.id);
      if (success) {
        setModalEliminarProducto(false);
        clearSelectedProduct();
      }
    }
  };

  const handleSaveEdit = async (productData) => {
    if (selectedProduct) {
      const success = await updateProduct(selectedProduct.id, productData);
      if (success) {
        setModalEditarProducto(false);
        clearSelectedProduct();
      }
    }
  };

  const handleCreateProduct = async (productData) => {
    const success = await addProduct(productData);
    if (success) {
      setModalNuevoProducto(false);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isAuthenticated={true}
        userName="Juan Díaz"
        pageTitle="Panel de Agricultor"
        pageDescription="Gestiona tus productos y conecta con compradores"
        showAuthButtons={false}
        userType="farmer"
        notificationCount={3}
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="productos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Productos</h2>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={() => setModalNuevoProducto(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            <ProductList
              productos={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales */}
      {modalNuevoProducto && (
        <NewProductModal
          open={modalNuevoProducto}
          onOpenChange={setModalNuevoProducto}
          onSave={handleCreateProduct}
        />
      )}
      
      {selectedProduct && (
        <>
          <EditProductModal
            open={modalEditarProducto}
            onOpenChange={(open) => {
              setModalEditarProducto(open);
              if (!open) clearSelectedProduct();
            }}
            onSave={handleSaveEdit}
            producto={selectedProduct}
          />

          <DeleteProductModal
            open={modalEliminarProducto}
            onOpenChange={(open) => {
              setModalEliminarProducto(open);
              if (!open) clearSelectedProduct();
            }}
            onDelete={handleConfirmDelete}
            producto={selectedProduct}
          />
        </>
      )}
    </div>
  )
}