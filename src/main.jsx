import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './shared/context/theme-provider'
import App from './App.jsx'
import LoginPage from './features/authentication/pages/LoginPage.jsx'
import RegisterPage from './features/authentication/pages/RegisterPage.jsx'
import LandingPage from './features/home/pages/LandingPage.jsx'
import SearchProductsPage from './features/product-discovery/pages/SearchProducts.jsx'
import ProductDetailPage from './features/product-discovery/pages/ProductDetailPage.jsx'
import FarmerProductsPage from './features/product-management/pages/FarmerProducts.jsx'
import '@/styles/globals.css'

const router = createBrowserRouter([
  {
    path: '/home',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/products',
    element: <SearchProductsPage />,
  },
  {
    path: '/products/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/farmer/products',
    element: <FarmerProductsPage />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
