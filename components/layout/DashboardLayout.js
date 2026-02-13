// components/DashboardLayout.js - 2030 Premium SaaS UI

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import NotificationCenter from '@/components/layout/NotificationCenter'
import { Menu, Hotel } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Initialize hotel info with cached data
  const [hotelInfo, setHotelInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('hotel_settings')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          return { name: parsed.name || 'Hotel Manager', logo: parsed.logo || null }
        } catch {
          return { name: 'Hotel Manager', logo: null }
        }
      }
    }
    return { name: 'Hotel Manager', logo: null }
  })

  // Check authentication only once on mount (skip for login page)
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/login') {
      setLoading(false)
      return
    }

    // Check for admin user first, then fall back to hotel_user
    const adminStr = localStorage.getItem('admin_user')
    const userStr = localStorage.getItem('hotel_user')

    if (!adminStr && !userStr) {
      router.push('/login')
      return
    }

    const parsedUser = adminStr ? JSON.parse(adminStr) : JSON.parse(userStr)
    setUser(parsedUser)
    setLoading(false)

    // Only fetch hotel settings for non-admin users
    if (!adminStr && parsedUser.id) {
      fetchHotelSettings(parsedUser.id)
    }
  }, [router, pathname])

  // Fetch hotel settings
  const fetchHotelSettings = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('name, logo')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Silently fail - settings are optional
        return
      }

      if (data) {
        const newHotelInfo = {
          name: data.name || 'Hotel Manager',
          logo: data.logo
        }
        setHotelInfo(newHotelInfo)
        // Cache the settings for instant load on refresh
        localStorage.setItem('hotel_settings', JSON.stringify(newHotelInfo))
      }
    } catch (error) {
      // Silently fail - settings are optional
    }
  }

  // Update active item when pathname changes
  useEffect(() => {
    const pathSegments = pathname.split('/')
    const currentItem = pathSegments.length > 1 && pathSegments[1] ? pathSegments[1] : 'dashboard'
    setActiveItem(currentItem)
  }, [pathname])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // For login page, render children without layout
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Loading state for authenticated pages
  if (!user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-900 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {hotelInfo.logo ? (
              <img
                src={hotelInfo.logo}
                alt={hotelInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Hotel className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900 truncate">{hotelInfo.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <NotificationCenter />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Desktop Header - Only visible on lg+ screens */}
      <header className="hidden lg:block fixed top-0 left-60 right-0 z-30 h-16 bg-white border-b border-gray-200">
        <div className="h-full px-8 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hover:text-gray-700 cursor-pointer transition-colors">Dashboards</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Default</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-emerald-700">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-500">Seller Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      {/* Main Content Wrapper - adjusted for new sidebar width (w-60) and desktop header */}
      <div className="lg:pl-60 pt-16">
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
