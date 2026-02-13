"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Eye, Clock, Users, MousePointerClick, ArrowLeft, Calendar,
  Monitor, Smartphone, Tablet, CheckCircle, XCircle, MapPin,
  Mail, User, Globe, Activity, BarChart2, TrendingUp, FileText
} from 'lucide-react';
import Link from 'next/link';

const PropertyDetailAnalytics = () => {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId;

  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAnalytics();
    }
  }, [propertyId]);

  const fetchPropertyAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?type=property-detail&propertyId=${propertyId}`);
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data || []);
        calculateSummary(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching property analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const uniqueEmails = new Set(data.filter(d => d.user_email).map(d => d.user_email));
    const totalViews = data.length;
    const totalDuration = data.reduce((sum, d) => sum + (d.duration_seconds || 0), 0);
    const totalActiveTime = data.reduce((sum, d) => sum + (d.active_time_seconds || 0), 0);

    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    data.forEach(d => {
      if (d.device_type) devices[d.device_type] = (devices[d.device_type] || 0) + 1;
    });

    const engagement = {
      scrolled_to_bottom: data.filter(d => d.scrolled_to_bottom).length,
      viewed_description: data.filter(d => d.viewed_description).length,
      viewed_repairs: data.filter(d => d.viewed_repairs).length,
      viewed_photos: data.filter(d => d.viewed_photos).length,
      clicked_more_photos: data.filter(d => d.clicked_more_photos).length,
      clicked_share: data.filter(d => d.clicked_share).length,
      zoomed_map: data.filter(d => d.zoomed_map).length,
      full_view_achieved: data.filter(d => d.full_view_achieved).length
    };

    setSummary({
      propertyAddress: data[0]?.property_address || 'Unknown',
      totalViews,
      uniqueViewers: uniqueEmails.size,
      avgDuration: totalViews > 0 ? Math.round(totalDuration / totalViews) : 0,
      avgActiveTime: totalViews > 0 ? Math.round(totalActiveTime / totalViews) : 0,
      devices,
      engagement,
      engagementRate: totalViews > 0 ? Math.round((engagement.full_view_achieved / totalViews) * 100) : 0
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

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

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-3.5 h-3.5" />;
      case 'mobile': return <Smartphone className="w-3.5 h-3.5" />;
      case 'tablet': return <Tablet className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112F58]"></div>
      </div>
    );
  }

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
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Property Analytics</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs text-gray-500">{summary.propertyAddress}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Total Views</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{summary.totalViews}</p>
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
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{summary.uniqueViewers}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Avg Active Time</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{formatDuration(summary.avgActiveTime)}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Engagement Rate</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{summary.engagementRate}%</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Breakdown & Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#112F58]" />
            <h3 className="text-sm font-semibold text-gray-900">Engagement Breakdown</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Full View Achieved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-900">{summary.engagement.full_view_achieved}</span>
                <span className="text-[10px] text-gray-400">/ {summary.totalViews}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Viewed Description</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{summary.engagement.viewed_description}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Viewed Photos</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{summary.engagement.viewed_photos}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Clicked Share</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{summary.engagement.clicked_share}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Clicked More Photos</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{summary.engagement.clicked_more_photos}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">Scrolled to Bottom</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{summary.engagement.scrolled_to_bottom}</span>
            </div>
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-[#112F58]" />
            <h3 className="text-sm font-semibold text-gray-900">Device Breakdown</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs text-gray-600">Desktop</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{summary.devices.desktop}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${summary.totalViews > 0 ? (summary.devices.desktop / summary.totalViews) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs text-gray-600">Mobile</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{summary.devices.mobile}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${summary.totalViews > 0 ? (summary.devices.mobile / summary.totalViews) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Tablet className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs text-gray-600">Tablet</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{summary.devices.tablet}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${summary.totalViews > 0 ? (summary.devices.tablet / summary.totalViews) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Viewer Sessions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Detailed view of individual user sessions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Viewer</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Device</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Duration</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Engagement</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {analytics.map((session, index) => (
                <tr key={index} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        {session.user_email ? (
                          <Mail className="w-4 h-4 text-neutral-600" />
                        ) : (
                          <User className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-900">
                          {session.user_first_name && session.user_last_name
                            ? `${session.user_first_name} ${session.user_last_name}`
                            : session.user_email || 'Anonymous'}
                        </p>
                        {session.user_email && (
                          <p className="text-[10px] text-neutral-500">{session.user_email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 rounded w-fit">
                      {getDeviceIcon(session.device_type)}
                      <span className="text-xs text-neutral-700 capitalize">{session.device_type || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs text-neutral-700">{formatDuration(session.active_time_seconds)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {session.full_view_achieved ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <div className="flex gap-1">
                        {session.viewed_description && <span className="text-xs px-1 py-0.5 bg-blue-50 text-blue-700 rounded">Desc</span>}
                        {session.viewed_photos && <span className="text-xs px-1 py-0.5 bg-purple-50 text-purple-700 rounded">Photos</span>}
                        {session.clicked_share && <span className="text-xs px-1 py-0.5 bg-green-50 text-green-700 rounded">Share</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs text-neutral-600">{formatDate(session.created_at)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailAnalytics;
