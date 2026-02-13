"use client";

import React, { useState, useEffect } from 'react';
import {
  Eye, TrendingUp, Clock, Users, MousePointerClick, BarChart3,
  Search, X, Filter, ChevronLeft, ChevronRight, MapPin, Bell,
  Smartphone, Monitor, Tablet, Activity, Target, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('total_views');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?type=summary');
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data || []);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort analytics
  const filteredAnalytics = analytics
    .filter(item =>
      item.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAnalytics.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAnalytics.length / entriesPerPage);

  // Calculate overview stats
  const totalViews = analytics.reduce((sum, item) => sum + item.total_views, 0);
  const totalUniqueViewers = analytics.reduce((sum, item) => sum + item.unique_viewers_count, 0);
  const avgEngagement = analytics.length > 0
    ? Math.round(analytics.reduce((sum, item) => sum + item.engagement_rate, 0) / analytics.length)
    : 0;
  const totalShares = analytics.reduce((sum, item) => sum + item.engagement_metrics.clicked_share, 0);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Property Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track views, engagement, and performance metrics</p>
        </div>
        <Link
          href="/analytics/notifications"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>Notification History</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Total Views</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalViews.toLocaleString()}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Unique Viewers</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalUniqueViewers.toLocaleString()}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Avg Engagement</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{avgEngagement}%</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Shares</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalShares.toLocaleString()}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <MousePointerClick className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
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
              <Filter className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
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
                placeholder="Search by address or property ID..."
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Property</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => {
                  if (sortBy === 'total_views') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else setSortBy('total_views');
                }}>
                  Total Views {sortBy === 'total_views' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => {
                  if (sortBy === 'unique_viewers_count') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else setSortBy('unique_viewers_count');
                }}>
                  Unique {sortBy === 'unique_viewers_count' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Avg Time</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Engagement</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Devices</th>
                <th className="px-3 py-2.5 text-right text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-2.5"><div className="h-4 w-6 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-40 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 md:px-5 py-8 md:py-10 text-center">
                    <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">No analytics data found</p>
                    <p className="text-[10px] md:text-xs text-neutral-400 mt-1">Property views will appear here once tracked</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr key={item.property_id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-400">{indexOfFirstEntry + index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="max-w-xs">
                          <p className="text-xs font-medium text-neutral-900 truncate">{item.property_address || 'Unknown'}</p>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">{item.property_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs font-semibold text-neutral-900">{item.total_views}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs font-semibold text-neutral-900">{item.unique_viewers_count}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-700">{formatDuration(item.avg_active_time)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.engagement_rate >= 70 ? 'bg-green-50 text-green-700' :
                        item.engagement_rate >= 40 ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        <Activity className="w-3 h-3" />
                        {item.engagement_rate}%
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {item.devices.desktop > 0 && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 rounded" title={`Desktop: ${item.devices.desktop}`}>
                            <Monitor className="w-3 h-3 text-neutral-600" />
                            <span className="text-[10px] text-neutral-600">{item.devices.desktop}</span>
                          </div>
                        )}
                        {item.devices.mobile > 0 && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 rounded" title={`Mobile: ${item.devices.mobile}`}>
                            <Smartphone className="w-3 h-3 text-neutral-600" />
                            <span className="text-[10px] text-neutral-600">{item.devices.mobile}</span>
                          </div>
                        )}
                        {item.devices.tablet > 0 && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 rounded" title={`Tablet: ${item.devices.tablet}`}>
                            <Tablet className="w-3 h-3 text-neutral-600" />
                            <span className="text-[10px] text-neutral-600">{item.devices.tablet}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/analytics/${item.property_id}`}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#112F58] hover:bg-neutral-100 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Details
                        </Link>
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
            Showing <span className="font-medium text-neutral-700">{filteredAnalytics.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to{' '}
            <span className="font-medium text-neutral-700">{Math.min(indexOfLastEntry, filteredAnalytics.length)}</span> of{' '}
            <span className="font-medium text-neutral-700">{filteredAnalytics.length}</span> properties
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

export default AnalyticsPage;
