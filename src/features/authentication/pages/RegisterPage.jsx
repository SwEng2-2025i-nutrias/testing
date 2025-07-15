// "use client"

import RegisterForm from "../components/organisms/RegisterForm"
import AuthTemplate from "../components/templates/AuthTemplate"

export default function RegisterPage() {
  return (
    <AuthTemplate
      title="Crear Cuenta"
      subtitle="Únete a nuestra comunidad agrícola"
      cardTitle="Información Personal"
      cardDescription="Completa todos los campos para crear tu cuenta"
    >
      <RegisterForm />
    </AuthTemplate>
  )
}
