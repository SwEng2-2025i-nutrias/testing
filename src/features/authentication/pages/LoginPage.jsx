"use client"

import LoginForm from "../components/organisms/LoginForm"
import AuthTemplate from "../components/templates/AuthTemplate"

export default function LoginPage() {
  return (
    <AuthTemplate
      title="Iniciar Sesión"
      subtitle="Accede a tu cuenta para continuar"
      cardTitle="Bienvenido de vuelta"
      cardDescription="Ingresa tus credenciales para acceder a tu cuenta"
    >
      <LoginForm />
    </AuthTemplate>
  )
}
