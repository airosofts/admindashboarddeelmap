'use client'

import { useState } from 'react'
import { Bell, X, Check, AlertCircle, Info, UserPlus, Building2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotificationCenter() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Mock notifications data (in real app, this would come from API/database)
  const notifications = [
    {
      id: 1,
      type: 'property',
      title: 'New Property Submission',
      message: 'Grand Plaza Hotel submitted a new property for review',
      time: '5 minutes ago',
      read: false,
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'user',
      title: 'New Seller Registration',
      message: 'John Doe registered as a new seller',
      time: '1 hour ago',
      read: false,
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'approval',
      title: 'Property Approved',
      message: 'Luxury Apartments has been approved and published',
      time: '2 hours ago',
      read: true,
      icon: CheckCircle,
      color: 'bg-emerald-500'
    },
    {
      id: 4,
      type: 'alert',
      title: 'System Alert',
      message: 'Server maintenance scheduled for tonight at 2 AM',
      time: '3 hours ago',
      read: true,
      icon: AlertCircle,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      type: 'info',
      title: 'Platform Update',
      message: 'New features added to the seller dashboard',
      time: '1 day ago',
      read: true,
      icon: Info,
      color: 'bg-purple-500'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = () => {
    // In real app, call API to mark all as read
    console.log('Mark all as read')
  }

  const handleNotificationClick = (notification) => {
    // Mark as read and navigate based on type
    console.log('Notification clicked:', notification)
    setIsOpen(false)

    // Navigate based on notification type
    if (notification.type === 'property') {
      router.push('/properties')
    } else if (notification.type === 'user') {
      router.push('/seller-registrations')
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-[#E8EDF3]">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#112F58] hover:text-[#0d243f] font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-neutral-300 mb-3" />
                  <p className="text-sm text-neutral-500">No notifications</p>
                  <p className="text-xs text-neutral-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {notifications.map((notification) => {
                    const Icon = notification.icon
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-lg ${notification.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/notifications')
                }}
                className="w-full py-2 text-xs font-medium text-[#112F58] hover:text-[#0d243f] transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}
