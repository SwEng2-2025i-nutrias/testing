import axios from "axios";

import  { PORTS } from "../../../shared/utils/Ports";

const BASE_URL = PORTS.AUTH.BASE_URL; 

export async function registerUser(formData) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, formData);
    return { success: true, user: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al registrar usuario",
    };
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    // if (!response.data.token) {
    //   throw new Error('No se recibió el token de autenticación');
    // }
    return { 
      success: true, 
      res: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al iniciar sesión",
    };
  }
}
