import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

export const useProducts = () => {
  const { 
    products, 
    isLoading, 
    error,
    selectedProduct,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    clearSelectedProduct,
    clearError
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    // Only on mount
    // eslint-disable-next-line
  }, []);

  return {
    // Estado
    products,
    isLoading,
    error,
    selectedProduct,
    
    // Acciones
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    clearSelectedProduct,
    clearError,
    
    // Utilidades
    refreshProducts: fetchProducts
  };
};
