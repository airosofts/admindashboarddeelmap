"use client";

import { useState, useRef, useEffect } from 'react';
import { supabaseScraper } from '@/lib/supabaseScraper';
import { Upload, X, Star, Trash2, Loader } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function ScrapedPhotoManager({ propertyId, photos = [], onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [localPhotos, setLocalPhotos] = useState(photos);
  const fileInputRef = useRef(null);

  // Update local photos when prop changes
  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.85
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    // Create previews
    const previews = await Promise.all(
      files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      })
    );
    setUploadPreviews(previews);

    try {
      let completed = 0;
      const uploadPromises = files.map(async (file, index) => {
        // Compress image
        const compressedFile = await compressImage(file);

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase scraper bucket
        const { data, error } = await supabaseScraper.storage
          .from('scraperpropertyphotos')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabaseScraper.storage
          .from('scraperpropertyphotos')
          .getPublicUrl(fileName);

        // Save photo to database
        const maxOrder = photos.reduce((max, p) => Math.max(max, p.display_order || 0), 0);

        const { error: dbError } = await supabaseScraper
          .from('property_photos')
          .insert({
            deal_id: propertyId,
            photo_url: publicUrl,
            display_order: maxOrder + index + 1,
            is_featured: photos.length === 0 && index === 0 // First photo is featured if no photos exist
          });

        if (dbError) throw dbError;

        completed++;
        setUploadProgress({ current: completed, total: files.length });

        return publicUrl;
      });

      await Promise.all(uploadPromises);

      // Clear previews
      setUploadPreviews([]);

      // Trigger parent refresh to update photo cache
      console.log('✅ Upload complete, refreshing photo cache...');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photos: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photo) => {
    try {
      setDeleting(photo.id);

      // Extract file path from URL
      const urlParts = photo.photo_url.split('/scraperpropertyphotos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];

        // Delete from storage
        const { error: storageError } = await supabaseScraper.storage
          .from('scraperpropertyphotos')
          .remove([filePath]);

        if (storageError) console.warn('Storage delete warning:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabaseScraper
        .from('property_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // Update local state immediately for instant feedback
      setLocalPhotos(prev => prev.filter(p => p.id !== photo.id));

      // Also refresh the parent cache in the background
      console.log('🗑️ Photo deleted, refreshing cache...');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleSetFeatured = async (photo) => {
    try {
      // Remove featured from all photos
      await supabaseScraper
        .from('property_photos')
        .update({ is_featured: false })
        .eq('deal_id', propertyId);

      // Set this photo as featured
      const { error } = await supabaseScraper
        .from('property_photos')
        .update({ is_featured: true })
        .eq('id', photo.id);

      if (error) throw error;

      // Update local state immediately
      setLocalPhotos(prev => prev.map(p => ({
        ...p,
        is_featured: p.id === photo.id
      })));

      // Refresh the parent cache in the background
      console.log('⭐ Featured photo updated, refreshing cache...');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Set featured error:', error);
      alert('Failed to set featured photo: ' + error.message);
    }
  };

  const sortedPhotos = [...localPhotos].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">Manage property photos</p>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#112F58] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading {uploadProgress.current}/{uploadProgress.total}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Photos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Previews */}
      {uploadPreviews.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              Uploading {uploadProgress.current} of {uploadProgress.total} photos...
            </p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {uploadPreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-300">
                <img src={preview} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                {idx < uploadProgress.current && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {sortedPhotos.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-neutral-200 rounded-xl">
          <Upload className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-2">No photos yet</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-[#112F58] hover:text-[#1a4a7a] font-medium"
          >
            Upload your first photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square"
            >
              <img
                src={photo.photo_url}
                alt="Property"
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2">
                {/* Featured Badge */}
                {photo.is_featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                )}

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {!photo.is_featured && (
                    <button
                      onClick={() => handleSetFeatured(photo)}
                      className="p-2 bg-white rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                      title="Set as featured"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={deleting === photo.id}
                    className="p-2 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deleting === photo.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500 mt-2">
        Click on a photo to set it as featured. The featured photo will be displayed as the main property image.
      </p>
    </div>
  );
}
