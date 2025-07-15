import { create } from 'zustand';
import { productService } from '../services/productService';

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,

  // Acciones
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await productService.getProducts();
      if (response.success) {
        set({ products: response.products, isLoading: false, error: null });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProduct: async (productData) => {
    // 1. Add temp product
    const tempId = `temp-${Date.now()}`;
    const tempProduct = {
      ...productData,
      id: tempId,
      status: "Activo",
      image: "/placeholder.svg?height=80&width=80",
      visits: 0,
      created_at: new Date().toISOString(),
      // Alias y campos originales para compatibilidad total
      nombre: productData.name || '',
      name: productData.name || '',
      tipo: productData.type || '',
      type: productData.type || '',
      precio: Number(productData.price_per_unit) || 0,
      price_per_unit: Number(productData.price_per_unit) || 0,
      quantity: Number(productData.quantity) || 0,
      descripcion: productData.description || '',
      description: productData.description || '',
      fechaCosecha: productData.harvest_date || '',
      harvest_date: productData.harvest_date || ''
    };
    set(state => ({
      products: [...state.products, tempProduct],
      error: null
    }));
    try {
      const response = await productService.createProduct(productData);
      if (response.success && response.product && response.product.id) {
        // Solo reemplaza si el producto real tiene id válido
        set(state => ({
          products: state.products.map(p =>
            p.id === tempId ? response.product : p
          ),
          error: null
        }));
      }
      // Si no hay producto real válido, deja el temporal
      return true;
    } catch (error) {
      set(state => ({
        products: state.products.filter(p => p.id !== tempId),
        error: error.message
      }));
      return false;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await productService.updateProduct(id, productData);
      if (response.success && response.product) {
        set(state => ({
          products: state.products.map(p =>
            p.id === id ? response.product : p
          ),
          error: null
        }));
        return true;
      } else {
        set({ error: response.message });
        return false;
      }
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },
  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        set(state => ({
          products: state.products.filter(p => p.id !== id),
          isLoading: false,
          error: null
        }));
        return true;
      } else {
        set({ error: response.message, isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  clearSelectedProduct: () => set({ selectedProduct: null })
}));
