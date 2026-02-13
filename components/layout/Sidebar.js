'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  ChevronRight,
  LogOut,
  MapPin,
  Users,
  Database,
  UserCircle,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Settings,
  BarChart3
} from 'lucide-react'

export default function Sidebar({ isOpen, setIsOpen, activeItem, setActiveItem }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('hotel_user')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building2,
      path: '/properties',
      badge: null
    },
    {
      id: 'scraped-properties',
      label: 'Scraped Properties',
      icon: Database,
      path: '/scraped-properties',
      badge: null
    },
    {
      id: 'seller-registrations',
      label: 'Seller Registration',
      icon: Users,
      path: '/seller-registrations',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      badge: null
    },
    {
      id: 'analytics-settings',
      label: 'Analytics Settings',
      icon: Settings,
      path: '/settings/analytics',
      badge: null
    }
  ]

  // Auto-set active item based on current pathname
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.path === pathname) {
        setActiveItem(item.id)
      }
    })
  }, [pathname])

  const handleItemClick = (item) => {
    setActiveItem(item.id)
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-white border-r border-gray-200 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col shadow-sm`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">DeelMap</h1>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-red text-white text-[10px] font-semibold rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 group"
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="text-sm font-medium">My Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="text-sm font-medium">Logging Out</span>
          </button>
        </div>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
