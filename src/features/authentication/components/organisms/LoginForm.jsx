import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import AuthInput from "../atoms/AuthInput"
import SocialLoginButtons from "../molecules/SocialLoginButtons"
import { useAuth } from "../../hooks/useAuth"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, error, isLoading, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    const result = await login({
      email: data.email,
      password: data.password,
    })

    if (!result.success) {
      // El error ya está manejado en useAuth
      return;
    }
  }


  const passwordToggleIcon = showPassword ? (
    <button
      type="button"
      onClick={() => setShowPassword(false)}
      className="hover:text-gray-600"
    >
      <EyeOff className="h-4 w-4" />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setShowPassword(true)}
      className="hover:text-gray-600"
    >
      <Eye className="h-4 w-4" />
    </button>
  )

  return (    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <AuthInput
        {...register("email", {
          required: "El correo electrónico es obligatorio",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "El correo electrónico no es válido",
          },
        })}
        id="email"
        type="email"
        label="Correo Electrónico"
        placeholder="tu@email.com"
        icon={Mail}
        error={errors.email?.message}
      />

      <AuthInput
        {...register("password", {
          required: "La contraseña es obligatoria",
        })}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Contraseña"
        placeholder="Tu contraseña"
        icon={Lock}
        rightIcon={passwordToggleIcon}
        error={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            {...register("rememberMe")}
          />
          <Label htmlFor="remember" className="text-sm cursor-pointer">
            Recordarme
          </Label>
        </div>
        <Link to="/recuperar-password" className="text-sm text-green-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700" 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>

      <SocialLoginButtons />

      <div className="text-center">
        <span className="text-gray-600">¿No tienes cuenta? </span>
        <Link to="/register" className="text-green-600 hover:underline font-medium">
          Regístrate aquí
        </Link>
      </div>
    </form>
  )
}
