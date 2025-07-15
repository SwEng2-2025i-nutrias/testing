import axios from "axios";
import { PORTS } from "../../../shared/utils/Ports";
import { useAuthStore } from "../../authentication/store/AuthStore";

const BASE_URL = PORTS.PRODUCTS.BASE_URL;

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const transformProduct = (product) => ({
  id: product.product_id,            // use product_id from backend
  name: product.name,               // Keeping original name instead of translating
  price_per_unit: product.price_per_unit,
  quantity: product.quantity,       // Keeping as number instead of string with units
  type: product.type,              // Keeping original type instead of translating
  description: product.description,
  harvest_date: product.harvest_date,
  created_at: product.created_at,
  // Optional fields with defaults
  status: "Activo",                // For future implementation
  image: product.image || "/placeholder.svg?height=80&width=80",
  visits: 0                        // For future implementation
});
export const productService = {
  getProducts: async () => {
    try {
      const config = getAuthHeader();
      const response = await axios.get(`${BASE_URL}/products/me`, config);
      // El endpoint /me devuelve un objeto con estructura diferente
      const productsData = response.data.products || response.data;
      const products = productsData.map(transformProduct);
      // console.log("Productos actuales:", products);
      return { 
        success: true, 
        products
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener productos",
      };
    }
  },
  createProduct: async (productData) => {
    try {
      const config = getAuthHeader();
      const response = await axios.post(
        `${BASE_URL}/products`, 
        productData,
        config
      );
      // console.log('Producto creado (backend):', response.data);
      return { 
        success: true, 
        product: transformProduct(response.data)
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "No autorizado. Por favor, inicie sesión nuevamente.",
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear producto",
      };
    }
  },
  updateProduct: async (id, productData) => {
    try {
      const config = getAuthHeader();
      const response = await axios.put(
        `${BASE_URL}/products/${id}`,
        productData,
        config
      );
      return {
        success: true,
        product: transformProduct(response.data)
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "No autorizado. Por favor, inicie sesión nuevamente.",
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar producto",
      };
    }
  },
  deleteProduct: async (id) => {
    try {
      const config = getAuthHeader();
      await axios.delete(`${BASE_URL}/products/${id}`, config);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "No autorizado. Por favor, inicie sesión nuevamente.",
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar producto",
      };
    }
  }
};
