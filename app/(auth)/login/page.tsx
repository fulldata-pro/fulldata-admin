'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { setAdmin } from '@/store/slices/authSlice'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      dispatch(setAdmin(data.admin))
      toast.success('Bienvenido al panel de administración')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/logo-header.svg"
              alt="Fulldata Admin"
              width={180}
              height={48}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-2xl font-bold text-secondary">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ki-duotone ki-sms text-xl text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="usuario@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ki-duotone ki-lock-2 text-xl text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`ki-duotone ${showPassword ? 'ki-eye-slash' : 'ki-eye'} text-xl text-gray-400 hover:text-gray-600`}
                  >
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <i className="ki-duotone ki-arrow-right text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Gradient background */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-secondary via-secondary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="glass-effect rounded-2xl p-8 max-w-md text-center bg-white/10">
            <i className="ki-duotone ki-shield-tick text-6xl mb-4">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <h2 className="text-2xl font-bold mb-4">CRM Administrativo</h2>
            <p className="text-white/80 leading-relaxed">
              Gestiona clientes, facturación, servicios y configuraciones de la plataforma Fulldata
              desde un único lugar.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-8 text-white/60">
            <div className="text-center">
              <i className="ki-duotone ki-people text-3xl mb-2">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
              <p className="text-sm">Clientes</p>
            </div>
            <div className="text-center">
              <i className="ki-duotone ki-bill text-3xl mb-2">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
                <span className="path6"></span>
              </i>
              <p className="text-sm">Facturación</p>
            </div>
            <div className="text-center">
              <i className="ki-duotone ki-setting-2 text-3xl mb-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <p className="text-sm">Servicios</p>
            </div>
            <div className="text-center">
              <i className="ki-duotone ki-chart-line-up text-3xl mb-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <p className="text-sm">Estadísticas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
