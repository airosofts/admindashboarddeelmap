'use client'

import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  UserPlus,
  Building2,
  CheckCircle,
  Filter,
  Search,
  Send,
  ChevronDown
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotificationsPage() {
  const [activeView, setActiveView] = useState('all') // 'all' or 'compose'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, unread, property, user, alert
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Compose form state
  const [recipientType, setRecipientType] = useState('all_sellers')
  const [specificEmail, setSpecificEmail] = useState('')
  const [notificationType, setNotificationType] = useState('info')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  // Mock notifications data (in real app, this would come from API/database)
  const allNotifications = [
    {
      id: 1,
      type: 'property',
      title: 'New Property Submission',
      message: 'Grand Plaza Hotel submitted a new property for review. The property is located in Downtown Manhattan with 50 rooms.',
      time: '2024-01-28 10:30 AM',
      timeAgo: '5 minutes ago',
      read: false,
      icon: Building2,
      color: 'bg-blue-500',
      sender: 'System'
    },
    {
      id: 2,
      type: 'user',
      title: 'New Seller Registration',
      message: 'John Doe registered as a new seller. Please review their application and verify their business documents.',
      time: '2024-01-28 09:15 AM',
      timeAgo: '1 hour ago',
      read: false,
      icon: UserPlus,
      color: 'bg-green-500',
      sender: 'User Management'
    },
    {
      id: 3,
      type: 'approval',
      title: 'Property Approved',
      message: 'Luxury Apartments has been approved and published to the platform. The seller has been notified.',
      time: '2024-01-28 08:45 AM',
      timeAgo: '2 hours ago',
      read: true,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      sender: 'Approval System'
    },
    {
      id: 4,
      type: 'alert',
      title: 'System Alert',
      message: 'Server maintenance scheduled for tonight at 2 AM. Expected downtime: 30 minutes. Please inform sellers.',
      time: '2024-01-28 07:30 AM',
      timeAgo: '3 hours ago',
      read: true,
      icon: AlertCircle,
      color: 'bg-orange-500',
      sender: 'System Admin'
    },
    {
      id: 5,
      type: 'info',
      title: 'Platform Update',
      message: 'New features added to the seller dashboard including bulk upload and advanced analytics.',
      time: '2024-01-27 02:00 PM',
      timeAgo: '1 day ago',
      read: true,
      icon: Info,
      color: 'bg-purple-500',
      sender: 'Development Team'
    },
    {
      id: 6,
      type: 'property',
      title: 'Property Modified',
      message: 'Seaside Resort updated their property listing with new images and pricing.',
      time: '2024-01-27 11:20 AM',
      timeAgo: '1 day ago',
      read: true,
      icon: Building2,
      color: 'bg-blue-500',
      sender: 'System'
    },
    {
      id: 7,
      type: 'user',
      title: 'User Blocked',
      message: 'User account "fake_seller@example.com" has been blocked due to suspicious activity.',
      time: '2024-01-27 09:00 AM',
      timeAgo: '1 day ago',
      read: true,
      icon: AlertCircle,
      color: 'bg-red-500',
      sender: 'Security System'
    },
    {
      id: 8,
      type: 'property',
      title: 'Property Deleted',
      message: 'Ocean View Apartments has been permanently deleted from the system.',
      time: '2024-01-26 04:15 PM',
      timeAgo: '2 days ago',
      read: true,
      icon: Trash2,
      color: 'bg-neutral-500',
      sender: 'System'
    }
  ]

  // Filter notifications
  const filteredNotifications = allNotifications.filter(notification => {
    // Filter by search query
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by type
    const matchesFilter = filterType === 'all' ||
                         filterType === 'unread' && !notification.read ||
                         notification.type === filterType

    return matchesSearch && matchesFilter
  })

  const unreadCount = allNotifications.filter(n => !n.read).length

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleSelectNotification = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id))
    } else {
      setSelectedNotifications([...selectedNotifications, id])
    }
  }

  const handleMarkAsRead = () => {
    console.log('Mark selected as read:', selectedNotifications)
    setSelectedNotifications([])
  }

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read')
  }

  const handleDeleteSelected = () => {
    console.log('Delete selected:', selectedNotifications)
    setSelectedNotifications([])
  }

  const handleSendNotification = () => {
    console.log('Send notification')
    // Add your send logic here
  }

  const menuOptions = [
    { value: 'all', label: 'All Notifications', count: allNotifications.length },
    { value: 'compose', label: 'Compose Notification', count: null }
  ]

  const currentOption = menuOptions.find(opt => opt.value === activeView)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative inline-block">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 hover:text-[#112F58] transition-colors"
            >
              <span>{currentOption.label}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 z-20 overflow-hidden">
                  {menuOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setActiveView(option.value)
                        setShowDropdown(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                        activeView === option.value ? 'bg-[#E8EDF3]' : ''
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        activeView === option.value ? 'text-[#112F58]' : 'text-neutral-700'
                      }`}>
                        {option.label}
                      </span>
                      {option.count !== null && (
                        <span className="text-xs font-semibold text-neutral-500">
                          {option.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            {activeView === 'all'
              ? 'View and manage all your notifications'
              : 'Send notifications to sellers and buyers'}
          </p>
        </div>
      </div>

      {/* Stats Cards - Only show for 'all' view */}
      {activeView === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-neutral-500">Total</p>
                <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">
                  {allNotifications.length}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-neutral-500">Unread</p>
                <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">
                  {unreadCount}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-neutral-500">Properties</p>
                <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">
                  {allNotifications.filter(n => n.type === 'property').length}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-neutral-500">Users</p>
                <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">
                  {allNotifications.filter(n => n.type === 'user').length}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications View */}
      {activeView === 'all' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Toolbar */}
          <div className="px-3 md:px-4 py-3 md:py-4 border-b border-neutral-200 space-y-3">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-transparent"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-transparent bg-white"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="property">Properties</option>
                  <option value="user">Users</option>
                  <option value="alert">Alerts</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            {selectedNotifications.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#112F58] hover:bg-[#0d243f] text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as Read</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Select All</span>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#112F58] hover:bg-[#0d243f] text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark All as Read</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-neutral-100">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16">
                <Bell className="w-12 h-12 md:w-16 md:h-16 text-neutral-300 mb-3" />
                <p className="text-sm md:text-base text-neutral-500 font-medium">No notifications found</p>
                <p className="text-xs md:text-sm text-neutral-400 mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const Icon = notification.icon
                const isSelected = selectedNotifications.includes(notification.id)

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-3 md:px-4 py-3 md:py-4 hover:bg-neutral-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 w-4 h-4 rounded border-neutral-300 text-[#112F58] focus:ring-[#112F58] cursor-pointer"
                      />

                      {/* Icon */}
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${notification.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs md:text-sm font-semibold text-neutral-900">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <span className="text-[10px] md:text-xs text-neutral-400 whitespace-nowrap">
                            {notification.timeAgo}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-neutral-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs text-neutral-400">
                          <span>{notification.time}</span>
                          <span>•</span>
                          <span>From: {notification.sender}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > 0 && (
            <div className="px-3 md:px-4 py-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
              <span>Showing {filteredNotifications.length} notifications</span>
            </div>
          )}
        </div>
      )}

      {/* Compose Notification View */}
      {activeView === 'compose' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden p-4 md:p-6">
          <div className="max-w-4xl space-y-5">
            {/* Recipient Section */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Send To
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { label: 'All Sellers', value: 'all_sellers' },
                  { label: 'All Buyers', value: 'all_buyers' },
                  { label: 'All Users', value: 'all_users' },
                  { label: 'Specific User', value: 'specific' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 p-3 border-2 border-neutral-200 rounded-lg hover:border-[#112F58] hover:bg-[#E8EDF3] cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name="recipient"
                      value={option.value}
                      checked={recipientType === option.value}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="w-4 h-4 text-[#112F58] focus:ring-[#112F58] focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-neutral-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Specific User Dropdown (conditional) */}
            {recipientType === 'specific' && (
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Select User
                </label>
                <select
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors bg-white cursor-pointer"
                >
                  <option value="">Select a user from database...</option>
                  <option value="john.doe@example.com">John Doe - john.doe@example.com</option>
                  <option value="jane.smith@example.com">Jane Smith - jane.smith@example.com</option>
                  <option value="seller1@hotel.com">Grand Plaza Hotel - seller1@hotel.com</option>
                  <option value="seller2@resort.com">Seaside Resort - seller2@resort.com</option>
                  <option value="buyer1@example.com">Michael Johnson - buyer1@example.com</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1.5">
                  Select a user from the database to send a notification
                </p>
              </div>
            )}

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Notification Type
              </label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors bg-white cursor-pointer"
              >
                <option value="info">Information</option>
                <option value="alert">Alert</option>
                <option value="announcement">Announcement</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear and descriptive title..."
                className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Message Content
              </label>
              <textarea
                rows="7"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your notification message here..."
                className="w-full px-4 py-3 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors resize-none"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Write a clear and concise message. This will be sent to the selected recipients.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Low', value: 'low', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
                  { label: 'Normal', value: 'normal', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'High', value: 'high', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'Urgent', value: 'urgent', color: 'bg-red-50 text-red-700 border-red-200' }
                ].map((priorityOption) => (
                  <label
                    key={priorityOption.value}
                    className="flex items-center gap-2 p-3 border-2 border-neutral-200 rounded-lg hover:border-[#112F58] cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priorityOption.value}
                      checked={priority === priorityOption.value}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-4 h-4 text-[#112F58] focus:ring-[#112F58] focus:ring-offset-0"
                    />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${priorityOption.color}`}>
                      {priorityOption.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule (Optional) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-4 bg-[#E8EDF3] border-2 border-neutral-200 rounded-lg">
                <input
                  type="checkbox"
                  id="schedule"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#112F58] focus:ring-[#112F58] focus:ring-offset-0"
                />
                <label htmlFor="schedule" className="text-sm font-medium text-neutral-700 cursor-pointer">
                  Schedule for later
                </label>
              </div>

              {/* Schedule Date & Time Fields */}
              {scheduleEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Schedule Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleSendNotification}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#112F58] hover:bg-[#0d243f] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Notification</span>
              </button>
              <button className="sm:w-auto px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold transition-colors">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
