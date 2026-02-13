"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, Filter, ChevronLeft, ChevronRight, Users as UsersIcon, Mail, Phone, Calendar, Shield, ShieldOff, Eye, CheckCircle, XCircle } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAuthProvider, setFilterAuthProvider] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' && user.active && !user.blocked) ||
      (filterStatus === 'blocked' && user.blocked) ||
      (filterStatus === 'inactive' && !user.active);

    const matchesAuthProvider = !filterAuthProvider || user.auth_provider === filterAuthProvider;

    return matchesSearch && matchesStatus && matchesAuthProvider;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  // Handle block/unblock user
  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    try {
      setUpdatingUser(userId);
      const newBlockedStatus = !currentBlockedStatus;

      const { error } = await supabase
        .from('users')
        .update({
          blocked: newBlockedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, blocked: newBlockedStatus, updated_at: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (userId, currentActiveStatus) => {
    try {
      setUpdatingUser(userId);
      const newActiveStatus = !currentActiveStatus;

      const { error } = await supabase
        .from('users')
        .update({
          active: newActiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, active: newActiveStatus, updated_at: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  const getStatusBadge = (user) => {
    if (user.blocked) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">Blocked</span>;
    }
    if (!user.active) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-700 border border-gray-200">Inactive</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">Active</span>;
  };

  const getAuthProviderColor = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'google':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'facebook':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'email':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterAuthProvider('');
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active && !u.blocked).length;
  const blockedUsers = users.filter(u => u.blocked).length;
  const verifiedUsers = users.filter(u => u.verified).length;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900">Users Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Monitor and manage platform users</p>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-neutral-500">Total Users</p>
              <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">{totalUsers}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
              <UsersIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-neutral-500">Active</p>
              <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">{activeUsers}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-neutral-500">Blocked</p>
              <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">{blockedUsers}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
              <ShieldOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#E8EDF3] rounded-xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-neutral-500">Verified</p>
              <p className="text-base md:text-lg font-semibold text-neutral-900 mt-0.5">{verifiedUsers}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#112F58] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Controls */}
        <div className="px-3 md:px-4 py-2.5 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
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

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterAuthProvider}
              onChange={(e) => setFilterAuthProvider(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">All Providers</option>
              <option value="email">Email</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
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
          <table className="w-full min-w-[900px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Auth Provider</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Verified</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Joined</th>
                <th className="px-3 py-2.5 text-right text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-2.5"><div className="h-4 w-6 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-32 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-40 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-24 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-12 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-3 md:px-5 py-8 md:py-10 text-center">
                    <UsersIcon className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">No users found</p>
                    <p className="text-[10px] md:text-xs text-neutral-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((user, index) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-400">{indexOfFirstEntry + index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="text-xs font-medium text-neutral-900">
                          {user.first_name || user.last_name
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'N/A'}
                        </p>
                        <p className="text-[10px] text-neutral-400">ID: {user.id.split('-')[0]}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-700">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-neutral-700">{user.phone || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getAuthProviderColor(user.auth_provider)}`}>
                        {user.auth_provider?.charAt(0).toUpperCase() + user.auth_provider?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {user.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-neutral-300" />
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-700">{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(user.id, user.active)}
                          disabled={updatingUser === user.id}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                            user.active
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          } disabled:opacity-50`}
                          title={user.active ? 'Deactivate' : 'Activate'}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.id, user.blocked)}
                          disabled={updatingUser === user.id}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                            user.blocked
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          } disabled:opacity-50`}
                          title={user.blocked ? 'Unblock' : 'Block'}
                        >
                          {user.blocked ? 'Unblock' : 'Block'}
                        </button>
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
            Showing <span className="font-medium text-neutral-700">{filteredUsers.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to{' '}
            <span className="font-medium text-neutral-700">{Math.min(indexOfLastEntry, filteredUsers.length)}</span> of{' '}
            <span className="font-medium text-neutral-700">{filteredUsers.length}</span> entries
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
    </div>
  );
};

export default UsersManagement;
