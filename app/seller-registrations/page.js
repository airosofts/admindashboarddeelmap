"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, Filter, ChevronLeft, ChevronRight, Users, Clock, CheckCircle, XCircle, Eye, Building2, Mail, Phone, Globe, Key, Send } from 'lucide-react';
import SellerViewModal from '@/components/seller-registrations/SellerViewModal';

const SellerRegistrations = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Auto-approve toggle state
  const [autoApprove, setAutoApprove] = useState(false);
  const [loadingAutoApprove, setLoadingAutoApprove] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingApproval, setSendingApproval] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchAutoApproveSettings();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAutoApproveSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('auto_approve_sellers')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching auto-approve settings:', error);
        return;
      }

      if (data) {
        setAutoApprove(data.auto_approve_sellers || false);
      }
    } catch (error) {
      console.error('Error fetching auto-approve settings:', error);
    }
  };

  const handleAutoApproveToggle = async (enabled) => {
    try {
      setLoadingAutoApprove(true);

      // Get admin user ID
      const adminStr = localStorage.getItem('admin_user');
      if (!adminStr) {
        alert('Admin user not found');
        return;
      }
      const admin = JSON.parse(adminStr);

      // Check if settings exist
      const { data: existing, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', admin.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({ auto_approve_sellers: enabled })
          .eq('user_id', admin.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('settings')
          .insert({
            user_id: admin.id,
            auto_approve_sellers: enabled
          });

        if (error) throw error;
      }

      setAutoApprove(enabled);
      alert(`Auto-approve ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating auto-approve settings:', error);
      alert('Failed to update auto-approve settings: ' + error.message);
    } finally {
      setLoadingAutoApprove(false);
    }
  };

  // Filter applications based on search term and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm);

    const matchesStatus = !filterStatus || app.status === filterStatus;
    const matchesBusinessType = !filterBusinessType || app.business_type === filterBusinessType;

    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredApplications.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredApplications.length / entriesPerPage);

  // Handle view
  const handleViewClick = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  // Handle status change
  const handleStatusChange = async (applicationId, newStatus) => {
    const application = applications.find(app => app.id === applicationId);

    // If changing to approved, show password modal
    if (newStatus === 'approved' && application && application.status !== 'approved') {
      setPendingApproval({ applicationId, application });
      setShowPasswordModal(true);
      return;
    }

    try {
      setUpdatingStatus(applicationId);
      const { error } = await supabase
        .from('seller_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus, reviewed_at: new Date().toISOString() }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleApprovalWithPassword = async () => {
    if (!password) {
      alert('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setSendingApproval(true);

      const { applicationId, application } = pendingApproval;

      // Update application status and password in database
      const { error: updateError } = await supabase
        .from('seller_applications')
        .update({
          status: 'approved',
          password: password,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Send approval email with credentials
      const response = await fetch('/api/seller-applications/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          email: application.email,
          businessName: application.business_name,
          contactPersonName: application.contact_person_name,
          password: password
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send approval email');
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: 'approved', password: password, reviewed_at: new Date().toISOString() }
            : app
        )
      );

      alert('Application approved and email sent successfully!');

      // Reset modal state
      setShowPasswordModal(false);
      setPendingApproval(null);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application: ' + error.message);
    } finally {
      setSendingApproval(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'on_hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'requires_info':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterBusinessType('');
    setSearchTerm('');
  };

  // Calculate stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const approvedApplications = applications.filter(a => a.status === 'approved').length;
  const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header with Auto-Approve Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Seller Registrations</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage seller application requests</p>
        </div>

        {/* Auto-Approve Toggle */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-red" />
            <span className="text-sm font-semibold text-gray-900">Auto-Approve</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => handleAutoApproveToggle(e.target.checked)}
              disabled={loadingAutoApprove}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-red rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
          </label>
        </div>
      </div>

      {/* Compact Stats Cards - Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Total Applications</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalApplications}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Pending</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{pendingApplications}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Approved</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{approvedApplications}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Rejected</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{rejectedApplications}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Controls - Responsive */}
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
                placeholder="Search by name, email, phone..."
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

          {/* Filters Row - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
              <option value="requires_info">Requires Info</option>
            </select>
            <select
              value={filterBusinessType}
              onChange={(e) => setFilterBusinessType(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">Business Type</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
            <button
              onClick={clearFilters}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg px-2 py-1.5 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Business</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Deals/Month</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Applied</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-right text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-2.5"><div className="h-4 w-6 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-32 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-24 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 md:px-5 py-8 md:py-10 text-center">
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">No applications found</p>
                    <p className="text-[10px] md:text-xs text-neutral-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((application, index) => (
                  <tr key={application.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-400">{indexOfFirstEntry + index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-neutral-900 line-clamp-1">{application.business_name}</p>
                          <p className="text-[10px] text-neutral-400">{application.contact_person_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs text-neutral-700 line-clamp-1">{application.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs text-neutral-500">{application.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-neutral-700 capitalize">{application.business_type}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-900">{application.deals_per_month}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-neutral-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <select
                        value={application.status || 'pending'}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        disabled={updatingStatus === application.id}
                        className={`text-[10px] font-medium px-2 py-1 rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#112F58] ${getStatusColor(application.status)} ${updatingStatus === application.id ? 'opacity-50' : ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="on_hold">On Hold</option>
                        <option value="requires_info">Requires Info</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => handleViewClick(application)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {application.website && (
                          <a
                            href={application.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                            title="Visit Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
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
            Showing <span className="font-medium text-neutral-700">{filteredApplications.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to{' '}
            <span className="font-medium text-neutral-700">{Math.min(indexOfLastEntry, filteredApplications.length)}</span> of{' '}
            <span className="font-medium text-neutral-700">{filteredApplications.length}</span> entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous"
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
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && pendingApproval && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => {
            if (!sendingApproval) {
              setShowPasswordModal(false);
              setPendingApproval(null);
              setPassword('');
              setConfirmPassword('');
            }
          }} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#112F58] flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Set Login Password</h3>
                  <p className="text-xs text-neutral-500">Create credentials for {pendingApproval.application.business_name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                    className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors"
                    disabled={sendingApproval}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#112F58] transition-colors"
                    disabled={sendingApproval}
                  />
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> An email with login credentials will be sent to <strong>{pendingApproval.application.email}</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPendingApproval(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={sendingApproval}
                    className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprovalWithPassword}
                    disabled={sendingApproval || !password || !confirmPassword}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#112F58] hover:bg-[#0d243f] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingApproval ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Approve & Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedApplication && (
        <SellerViewModal
          application={selectedApplication}
          onClose={() => {
            setShowViewModal(false);
            setSelectedApplication(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default SellerRegistrations;
