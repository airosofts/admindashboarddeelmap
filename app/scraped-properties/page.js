"use client";

import React, { useState, useEffect } from 'react';
import { supabaseScraper } from '@/lib/supabaseScraper';
import { Search, X, Filter, ChevronLeft, ChevronRight, Building2, Eye, Edit2, Trash2, MapPin, DollarSign, Home } from 'lucide-react';
import ScrapedPropertyModal from '@/components/scraped-properties/ScrapedPropertyModal';
import DeleteConfirmModal from '@/components/properties/DeleteConfirmModal';

const ScrapedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]); // Store all photos
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPropertyType, setFilterPropertyType] = useState('');
  const [filterSource, setFilterSource] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      // Fetch recent properties without counting (count is expensive)
      const { data, error } = await supabaseScraper
        .from('wholesale_deals')
        .select('id, address, city, state, zip_code, full_address, price, bedrooms, bathrooms, sqft, property_type, status, agent_name, agent_phone, agent_email, description, source_type, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Set properties with empty photo arrays for fast initial render
      const propertiesWithEmptyPhotos = data.map(property => ({
        ...property,
        property_photos: []
      }));
      setProperties(propertiesWithEmptyPhotos);

      // Stop loading immediately after properties are set
      setLoading(false);

      // Fetch ALL photos in the background (more efficient than individual fetches)
      // Since there are only ~28 photos total, fetching all at once is faster
      if (data && data.length > 0) {
        console.log('📸 Fetching all photos in background...');
        const photoStartTime = performance.now();

        try {
          const { data: allPhotosData, error: photosError } = await supabaseScraper
            .from('property_photos')
            .select('id, photo_url, is_featured, display_order, deal_id')
            .order('display_order', { ascending: true });

          const photoDuration = performance.now() - photoStartTime;
          console.log(`✅ All photos fetched in ${photoDuration.toFixed(0)}ms - ${allPhotosData?.length || 0} total photos`);

          if (!photosError && allPhotosData) {
            setAllPhotos(allPhotosData);

            // Group photos by deal_id and update properties
            const photosByDealId = {};
            allPhotosData.forEach(photo => {
              if (!photosByDealId[photo.deal_id]) {
                photosByDealId[photo.deal_id] = [];
              }
              photosByDealId[photo.deal_id].push(photo);
            });

            setProperties(prev => prev.map(property => ({
              ...property,
              property_photos: photosByDealId[property.id] || []
            })));
          }
        } catch (photoErr) {
          console.error('❌ Photo fetch error:', photoErr);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Failed to fetch properties: ' + (error.message || 'Please check your connection and try again.'));
      setLoading(false);
    }
  };

  // Filter properties based on search term and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.full_address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || property.status === filterStatus;
    const matchesPropertyType = !filterPropertyType || property.property_type === filterPropertyType;
    const matchesSource = !filterSource || property.source_type === filterSource;

    return matchesSearch && matchesStatus && matchesPropertyType && matchesSource;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredProperties.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredProperties.length / entriesPerPage);

  // Handle view/edit
  const handleViewClick = (property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  // Handle delete
  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete property photos first
      const { error: photosError } = await supabaseScraper
        .from('property_photos')
        .delete()
        .eq('deal_id', selectedProperty.id);

      if (photosError) throw photosError;

      // Then delete property
      const { error } = await supabaseScraper
        .from('wholesale_deals')
        .delete()
        .eq('id', selectedProperty.id);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      setShowDeleteModal(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property: ' + error.message);
    }
  };

  const handlePropertyUpdate = (updatedProperty) => {
    setProperties(prev =>
      prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sold':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'off-market':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPropertyType('');
    setFilterSource('');
    setSearchTerm('');
  };

  const getFeaturedImage = (property) => {
    const featuredPhoto = property.property_photos?.find(p => p.is_featured);
    if (featuredPhoto) return featuredPhoto.photo_url;

    const sortedPhotos = property.property_photos?.sort((a, b) => a.display_order - b.display_order);
    return sortedPhotos?.[0]?.photo_url || null;
  };

  // Calculate stats
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const avgPrice = properties.length > 0
    ? (properties.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / properties.length).toFixed(0)
    : 0;
  const emailSource = properties.filter(p => p.source_type === 'email').length;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">Scraped Properties</h1>
          <p className="text-xs text-gray-500 mt-0.5">Properties from automated data collection</p>
        </div>
      </div>

      {/* Compact Stats Cards */}
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
              <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Avg Price</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">${parseInt(avgPrice).toLocaleString()}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Email Source</p>
              <p className="text-base md:text-lg font-semibold text-gray-900 mt-0.5">{emailSource}</p>
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
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
                placeholder="Search by address, city, state..."
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="off-market">Off-Market</option>
            </select>
            <select
              value={filterPropertyType}
              onChange={(e) => setFilterPropertyType(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">Property Type</option>
              <option value="Single Family">Single Family</option>
              <option value="Multi Family">Multi Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
            </select>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
            >
              <option value="">Source Type</option>
              <option value="email">Email</option>
              <option value="manual">Manual</option>
              <option value="api">API</option>
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
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Property</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Beds/Baths</th>
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
                    <td className="px-3 py-2.5"><div className="h-4 w-20 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded"></div></td>
                    <td className="px-3 py-2.5"><div className="h-4 w-16 bg-neutral-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 md:px-5 py-8 md:py-10 text-center">
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">No properties found</p>
                    <p className="text-[10px] md:text-xs text-neutral-400 mt-1">Try adjusting your search or filters</p>
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
                            alt={property.address}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-xs font-medium text-neutral-900 line-clamp-1">{property.address || 'N/A'}</p>
                          <p className="text-[10px] text-neutral-400">{property.property_type || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-700 line-clamp-1">
                          {property.city && property.state ? `${property.city}, ${property.state}` : 'N/A'}
                        </span>
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
                      <span className="text-xs text-neutral-700">
                        {property.bedrooms || 0} / {property.bathrooms || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(property.status)}`}>
                        {property.status?.charAt(0).toUpperCase() + property.status?.slice(1) || 'Active'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => handleViewClick(property)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                          title="View/Edit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      {showViewModal && selectedProperty && (
        <ScrapedPropertyModal
          property={selectedProperty}
          allPhotos={allPhotos}
          onPhotosChange={setAllPhotos}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProperty(null);
          }}
          onUpdate={handlePropertyUpdate}
          onRefresh={fetchProperties}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedProperty?.address || 'this property'}
        isPermanent={true}
      />
    </div>
  );
};

export default ScrapedProperties;
