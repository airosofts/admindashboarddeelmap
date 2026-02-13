'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Shield, BarChart3, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Loader Component
const InitialLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-neutral-50">
    <div className="w-10 h-10 border-2 border-[#112F58] border-t-transparent rounded-full animate-spin"></div>
  </div>
)

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Redirect if already logged in
  useEffect(() => {
    const adminStr = localStorage.getItem('admin_user')
    if (adminStr) {
      router.push('/dashboard')
    } else {
      setIsCheckingAuth(false)
    }
  }, [router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check email and password directly in admin table
      const { data: admin, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .eq('email', formData.email)
        .eq('password', formData.password)
        .single()

      if (adminError || !admin) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Store admin data
      const adminData = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      }

      localStorage.setItem('admin_user', JSON.stringify(adminData))
      router.push('/dashboard')
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <InitialLoader />
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-slate-50 to-neutral-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#112F58] relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="dealpattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="white" opacity="0.5"/>
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.3"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dealpattern)" />
            </svg>
          </div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-16 py-12">
          <div className="w-full max-w-lg">
            <div className="mb-10">
              <Image
                src="/deelmap.png"
                alt="Deelmap Logo"
                width={320}
                height={120}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              Admin Portal
            </p>
            <p className="text-blue-200 text-lg leading-relaxed mb-12">
              Manage your platform, monitor activities, and control all aspects of your business with powerful admin tools
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Secure admin access and control' },
                { icon: BarChart3, text: 'Monitor platform analytics and insights' },
                { icon: Settings, text: 'Manage system configurations' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4 text-white bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-base">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mb-4 bg-white rounded-2xl p-4 inline-block shadow-sm">
              <Image
                src="/deelmap.png"
                alt="Deelmap Logo"
                width={200}
                height={70}
                className="mx-auto object-contain"
                priority
                unoptimized
              />
            </div>
            <p className="text-xl font-bold text-[#112F58]">Admin Portal</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Welcome back, Admin!</h2>
            <p className="text-gray-600 text-base lg:text-lg">Sign in to access the admin dashboard and manage your platform</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] outline-none transition-all text-base bg-gray-50 hover:bg-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] outline-none transition-all text-base bg-gray-50 hover:bg-white"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#112F58] border-gray-300 rounded focus:ring-[#112F58] focus:ring-2"
                  />
                  <span className="text-base text-gray-600 group-hover:text-gray-900 transition">Remember me</span>
                </label>
                <a href="#" className="text-base font-semibold text-[#112F58] hover:text-[#1a4a7a] transition">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#112F58] hover:bg-[#1a4a7a] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Contact Support Link */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-base text-gray-600">
                Need help?{' '}
                <a
                  href="mailto:support@deelmap.com"
                  className="font-semibold text-[#112F58] hover:text-[#1a4a7a] transition"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm lg:text-base text-gray-500 mt-8">
            © {new Date().getFullYear()} Deelmap. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
