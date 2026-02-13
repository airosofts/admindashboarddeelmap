"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, ArrowLeft, Search, X, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, MapPin, User, Phone, Calendar, MessageSquare, Hash
} from 'lucide-react';

const NotificationsHistoryPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?type=notifications');
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch =
      notif.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.sms_to?.includes(searchTerm);

    const matchesStatus = !filterStatus || notif.sms_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredNotifications.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredNotifications.length / entriesPerPage);

  // Calculate stats
  const totalSent = notifications.filter(n => n.sms_status === 'sent').length;
  const totalFailed = notifications.filter(n => n.sms_status === 'failed').length;
  const uniqueProperties = new Set(notifications.map(n => n.property_id)).size;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-semibold">
          <CheckCircle className="w-3 h-3" />
          Sent
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-semibold">
        <XCircle className="w-3 h-3" />
        Failed
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/analytics')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Notification History</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track all analytics-triggered SMS notifications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Total Sent</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{notifications.length}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Successful</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalSent}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Failed</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalFailed}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Properties</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{uniqueProperties}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Controls */}
        <div className="px-3 md:px-4 py-2.5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
              >
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>

            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
                placeholder="Search by address, seller, or phone..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('');
              }}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg px-2 py-1.5 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Property</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Seller</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Views</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Message</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-2.5"><div className="h-4 w-6 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-40 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-32 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-48 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-24 bg-neutral-100 rounded"></div></td>
                  </tr>
                ))
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 md:px-5 py-8 md:py-10 text-center">
                    <Bell className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">No notifications found</p>
                    <p className="text-[10px] md:text-xs text-neutral-400 mt-1">Notifications will appear here when sent</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((notif, index) => (
                  <tr key={notif.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-400">{indexOfFirstEntry + index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <p className="text-xs font-medium text-neutral-900 line-clamp-1">{notif.address}</p>
                          <p className="text-[10px] text-neutral-400">{notif.city}, {notif.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-neutral-900">{notif.seller_name || 'Unknown'}</p>
                          <div className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-neutral-400" />
                            <p className="text-[10px] text-neutral-500">{notif.sms_to}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded w-fit">
                        <Hash className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">{notif.views_count}</span>
                        <span className="text-[10px] text-blue-600">/ {notif.notification_threshold}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 max-w-md">
                        <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-neutral-700 line-clamp-2">{notif.message_sent}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {getStatusBadge(notif.sms_status)}
                      {notif.sms_error && (
                        <p className="text-[10px] text-red-600 mt-1" title={notif.sms_error}>Error</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-600">{formatDate(notif.sent_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - Pagination */}
        <div className="px-3 md:px-4 py-2 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-neutral-500">
            Showing <span className="font-medium text-neutral-700">{filteredNotifications.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to{' '}
            <span className="font-medium text-neutral-700">{Math.min(indexOfLastEntry, filteredNotifications.length)}</span> of{' '}
            <span className="font-medium text-neutral-700">{filteredNotifications.length}</span> notifications
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[28px] h-7 px-2 text-xs font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#112F58] text-white'
                        : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsHistoryPage;
