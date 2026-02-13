"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Star, Image as ImageIcon, MapPin, DollarSign, Home } from 'lucide-react';
import { supabaseScraper } from '@/lib/supabaseScraper';
import ScrapedPhotoManager from './ScrapedPhotoManager';

const ScrapedPropertyModal = ({ property, allPhotos = [], onPhotosChange, onClose, onUpdate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('photos'); // Start on photos tab
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter photos for this property from allPhotos
  const propertyPhotos = allPhotos.filter(photo => photo.deal_id === property.id);
  const [photos, setPhotos] = useState(propertyPhotos);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [formData, setFormData] = useState({
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip_code: property.zip_code || '',
    price: property.price || '',
    bedrooms: property.bedrooms || '',
    bathrooms: property.bathrooms || '',
    sqft: property.sqft || '',
    property_type: property.property_type || '',
    description: property.description || '',
    status: property.status || 'active',
    arv: property.arv || '',
    repair_cost: property.repair_cost || ''
  });

  // Update photos when allPhotos changes
  useEffect(() => {
    const propertyPhotos = allPhotos.filter(photo => photo.deal_id === property.id);
    console.log(`📸 Property ${property.id} has ${propertyPhotos.length} photos (from cache)`);
    setPhotos(propertyPhotos);

    // If we have no photos yet and allPhotos is empty, show loading
    if (allPhotos.length === 0 && propertyPhotos.length === 0) {
      setLoadingPhotos(true);
    } else {
      setLoadingPhotos(false);
    }
  }, [allPhotos, property.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRefreshPhotos = async () => {
    // Refresh photos after upload/delete by fetching all photos
    console.log('🔄 Refreshing photos cache...');
    setLoadingPhotos(true);
    const startTime = performance.now();

    try {
      const { data, error } = await supabaseScraper
        .from('property_photos')
        .select('id, photo_url, is_featured, display_order, deal_id')
        .order('display_order', { ascending: true });

      const duration = performance.now() - startTime;
      console.log(`✅ Photos cache refreshed in ${duration.toFixed(0)}ms - ${data?.length || 0} total photos`);

      if (!error && data && onPhotosChange) {
        onPhotosChange(data); // Update the parent's allPhotos
      }
    } catch (err) {
      console.error('❌ Error refreshing photos:', err);
    } finally {
      setLoadingPhotos(false);
    }

    onRefresh();
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Clean up form data - convert empty strings to null for numeric fields
      const cleanedData = {
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        price: formData.price === '' ? null : parseFloat(formData.price),
        bedrooms: formData.bedrooms === '' ? null : parseInt(formData.bedrooms),
        bathrooms: formData.bathrooms === '' ? null : parseFloat(formData.bathrooms),
        sqft: formData.sqft === '' ? null : parseInt(formData.sqft),
        property_type: formData.property_type || null,
        description: formData.description || null,
        status: formData.status || 'active',
        arv: formData.arv === '' ? null : parseFloat(formData.arv),
        repair_cost: formData.repair_cost === '' ? null : parseFloat(formData.repair_cost),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseScraper
        .from('wholesale_deals')
        .update(cleanedData)
        .eq('id', property.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating property:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#112F58] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{property.address || 'Property Details'}</h2>
              <p className="text-sm text-white/70">{property.city && property.state ? `${property.city}, ${property.state}` : 'Location'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-[#112F58] text-[#112F58]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'photos'
                  ? 'border-[#112F58] text-[#112F58]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Photos ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'metadata'
                  ? 'border-[#112F58] text-[#112F58]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Source & Metadata
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">ARV</label>
                    <input
                      type="number"
                      value={formData.arv}
                      onChange={(e) => handleInputChange('arv', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Repair Cost</label>
                    <input
                      type="number"
                      value={formData.repair_cost}
                      onChange={(e) => handleInputChange('repair_cost', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Square Feet</label>
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => handleInputChange('sqft', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Property Type</label>
                    <input
                      type="text"
                      value={formData.property_type}
                      onChange={(e) => handleInputChange('property_type', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!editMode}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#112F58] disabled:bg-neutral-50"
                  placeholder="Property description..."
                />
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            loadingPhotos ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#112F58] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ScrapedPhotoManager
                propertyId={property.id}
                photos={photos}
                onRefresh={handleRefreshPhotos}
              />
            )
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Source Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Source Type</p>
                    <p className="text-sm text-neutral-900 capitalize">{property.source_type || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Creation Method</p>
                    <p className="text-sm text-neutral-900 capitalize">{property.creation_method || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Extraction Date</p>
                    <p className="text-sm text-neutral-900">
                      {property.extraction_date ? new Date(property.extraction_date).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Created At</p>
                    <p className="text-sm text-neutral-900">
                      {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {property.agent_name && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Agent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.agent_name && (
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Agent Name</p>
                        <p className="text-sm text-neutral-900">{property.agent_name}</p>
                      </div>
                    )}
                    {property.agent_phone && (
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Agent Phone</p>
                        <p className="text-sm text-neutral-900">{property.agent_phone}</p>
                      </div>
                    )}
                    {property.agent_email && (
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Agent Email</p>
                        <p className="text-sm text-neutral-900">{property.agent_email}</p>
                      </div>
                    )}
                    {property.company_name && (
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Company Name</p>
                        <p className="text-sm text-neutral-900">{property.company_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    address: property.address || '',
                    city: property.city || '',
                    state: property.state || '',
                    zip_code: property.zip_code || '',
                    price: property.price || '',
                    bedrooms: property.bedrooms || '',
                    bathrooms: property.bathrooms || '',
                    sqft: property.sqft || '',
                    property_type: property.property_type || '',
                    description: property.description || '',
                    status: property.status || 'active',
                    arv: property.arv || '',
                    repair_cost: property.repair_cost || ''
                  });
                }}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#112F58] hover:bg-[#1a4a7a] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapedPropertyModal;
