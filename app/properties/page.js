"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Eye, Search, X, Building2, Filter, ChevronLeft, ChevronRight, MapPin, DollarSign, Archive, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/properties/DeleteConfirmModal';
import PropertyViewModal from '@/components/properties/PropertyViewModal';

const PropertiesManagement = () => {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPropertyStatus, setFilterPropertyStatus] = useState('');
  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'trash'

  useEffect(() => {
    // Check for admin user first, then fall back to hotel_user
    const adminStr = localStorage.getItem('admin_user');
    const userStr = localStorage.getItem('hotel_user');

    if (adminStr) {
      const user = JSON.parse(adminStr);
      setUserId(user.id);
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    // Admin doesn't need userId to fetch properties
    const isAdmin = localStorage.getItem('admin_user') !== null;
    if (userId || isAdmin) {
      fetchProperties();
    }
  }, [userId, viewMode]);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      // Check if user is admin
      const isAdmin = localStorage.getItem('admin_user') !== null;

      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (
            id,
            image_url,
            sort_order
          ),
          seller_applications:seller_id (
            contact_person_name,
            email,
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      // Only filter by seller_id if not admin
      if (!isAdmin && userId) {
        query = query.eq('seller_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setProperties([]);
        return;
      }

      console.log('Fetched properties:', data?.length || 0, 'properties');
      console.log('Sample property:', data?.[0]);

      // Filter by view mode (archived vs active)
      const filteredData = viewMode === 'trash'
        ? data?.filter(p => p.status === 'archived') || []
        : data?.filter(p => p.status !== 'archived') || [];

      console.log('Filtered properties:', filteredData.length, 'properties');
      setProperties(filteredData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on search term and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.id?.toString().includes(searchTerm) ||
      property.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || property.status === filterStatus;
    const matchesPropertyStatus = !filterPropertyStatus || property.property_status === filterPropertyStatus;

    return matchesSearch && matchesStatus && matchesPropertyStatus;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredProperties.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredProperties.length / entriesPerPage);

  // Handle view
  const handleViewClick = (property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  // Handle archive/restore
  const handleArchiveClick = (property) => {
    setSelectedProperty(property);
    setShowArchiveModal(true);
  };

  const handleArchiveConfirm = async () => {
    try {
      const isAdmin = localStorage.getItem('admin_user') !== null;

      let query = supabase
        .from('properties')
        .update({ status: 'archived' })
        .eq('id', selectedProperty.id);

      // Only add seller_id check if not admin
      if (!isAdmin && userId) {
        query = query.eq('seller_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      setShowArchiveModal(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error archiving property:', error);
      alert('Failed to archive property: ' + error.message);
    }
  };

  const handleRestore = async (property) => {
    try {
      const isAdmin = localStorage.getItem('admin_user') !== null;

      let query = supabase
        .from('properties')
        .update({ status: 'draft' })
        .eq('id', property.id);

      // Only add seller_id check if not admin
      if (!isAdmin && userId) {
        query = query.eq('seller_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== property.id));
    } catch (error) {
      console.error('Error restoring property:', error);
      alert('Failed to restore property: ' + error.message);
    }
  };

  // Handle delete
  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const isAdmin = localStorage.getItem('admin_user') !== null;

      // Delete property images first
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', selectedProperty.id);

      if (imagesError) throw imagesError;

      // Then delete property
      let query = supabase
        .from('properties')
        .delete()
        .eq('id', selectedProperty.id);

      // Only add seller_id check if not admin
      if (!isAdmin && userId) {
        query = query.eq('seller_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      setShowDeleteModal(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'draft':
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'archived':
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getPropertyStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sold':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'under_contract':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPropertyStatus('');
    setSearchTerm('');
  };

  const getFeaturedImage = (property) => {
    // Get image with lowest sort_order (first image)
    const sortedImages = property.property_images?.sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages?.[0]?.image_url || null;
  };

  // Calculate stats
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const draftProperties = properties.filter(p => p.status === 'draft').length;
  const availableProperties = properties.filter(p => p.property_status === 'available').length;

  return (
    <div className="space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Properties</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your wholesale property deals</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'active' ? 'trash' : 'active')}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              {viewMode === 'active' ? <Archive size={16} /> : <RotateCcw size={16} />}
              <span>{viewMode === 'active' ? 'Trash' : 'Active'}</span>
            </button>
            <button
              onClick={() => router.push('/properties/new')}
              className="flex items-center justify-center gap-2 bg-brand-red hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Plus size={16} />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Compact Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Total Properties</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{totalProperties}</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Active</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{activeProperties}</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Draft</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{draftProperties}</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Available</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{availableProperties}</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
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
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  placeholder="Search by title or location..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <option value="">Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterPropertyStatus}
                onChange={(e) => setFilterPropertyStatus(e.target.value)}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
              >
                <option value="">Property Status</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="under_contract">Under Contract</option>
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
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Property</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Seller Name</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Company</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Property Status</th>
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
                      <td className="px-3 py-2.5"><div className="h-4 w-24 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-24 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 md:px-5 py-8 md:py-10 text-center">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-neutral-500 text-xs md:text-sm font-medium">
                        {viewMode === 'active' ? 'No properties found' : 'No properties in trash'}
                      </p>
                      <p className="text-[10px] md:text-xs text-neutral-400 mt-1">
                        {viewMode === 'active' ? 'Try adjusting your search or add a new property' : 'Deleted properties will appear here'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((property, index) => (
                    <tr key={property.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-neutral-400">{indexOfFirstEntry + index + 1}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {getFeaturedImage(property) && (
                            <img
                              src={getFeaturedImage(property)}
                              alt={property.slug}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-xs font-medium text-neutral-900 line-clamp-1">{property.slug?.replace(/-/g, ' ').replace(/\d+$/, '').trim() || 'N/A'}</p>
                            <p className="text-[10px] text-neutral-400">ID: {property.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-neutral-700">{property.seller_applications?.contact_person_name || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-neutral-700">{property.seller_applications?.business_name || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs text-neutral-700 line-clamp-1">{property.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-neutral-900">
                          ${parseFloat(property.price || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-neutral-700">{property.property_type || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(property.status)}`}>
                          {property.status?.charAt(0).toUpperCase() + property.status?.slice(1) || 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getPropertyStatusColor(property.property_status)}`}>
                          {property.property_status?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Available'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5">
                          {viewMode === 'trash' ? (
                            <>
                              <button
                                onClick={() => handleRestore(property)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(property)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-red-500 transition-colors"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleViewClick(property)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                                title="View"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => router.push(`/properties/edit/${property.id}`)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleArchiveClick(property)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </>
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
              Showing <span className="font-medium text-neutral-700">{filteredProperties.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to{' '}
              <span className="font-medium text-neutral-700">{Math.min(indexOfLastEntry, filteredProperties.length)}</span> of{' '}
              <span className="font-medium text-neutral-700">{filteredProperties.length}</span> entries
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

        {/* Modals */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProperty(null);
          }}
          onConfirm={handleDeleteConfirm}
          itemName={selectedProperty?.title || 'this property'}
          isPermanent={true}
        />

        <DeleteConfirmModal
          isOpen={showArchiveModal}
          onClose={() => {
            setShowArchiveModal(false);
            setSelectedProperty(null);
          }}
          onConfirm={handleArchiveConfirm}
          itemName={selectedProperty?.slug || 'this property'}
          isPermanent={false}
        />

        {showViewModal && selectedProperty && (
          <PropertyViewModal
            property={selectedProperty}
            onClose={() => {
              setShowViewModal(false);
              setSelectedProperty(null);
            }}
          />
        )}
    </div>
  );
};

export default PropertiesManagement;
