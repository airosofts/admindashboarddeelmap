"use client";

import React, { useState } from 'react';
import { X, Building2, Mail, Phone, Globe, Linkedin, Calendar, MapPin, FileText, Tag, Briefcase, TrendingUp } from 'lucide-react';

const SellerViewModal = ({ application, onClose, onStatusChange }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    await onStatusChange(application.id, newStatus);
    setUpdatingStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#112F58] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{application.business_name}</h2>
              <p className="text-sm text-white/70">{application.contact_person_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Status Section */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-700">Application Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                {formatStatus(application.status)}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['pending', 'under_review', 'approved', 'rejected', 'on_hold', 'requires_info'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updatingStatus || application.status === status}
                  className={`px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all ${
                    application.status === status
                      ? 'bg-[#112F58] text-white border-[#112F58]'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#112F58] hover:text-[#112F58]'
                  } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#112F58]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-neutral-900">{application.email}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm text-neutral-900">{application.phone}</p>
              </div>
              {application.website && (
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Website</p>
                  <a
                    href={application.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#112F58] hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {application.website}
                  </a>
                </div>
              )}
              {application.linkedin && (
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">LinkedIn</p>
                  <a
                    href={application.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#112F58] hover:underline flex items-center gap-1"
                  >
                    <Linkedin className="w-3 h-3" />
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#112F58]" />
              Business Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Business Type</p>
                <p className="text-sm text-neutral-900 capitalize">{application.business_type}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Deals Per Month</p>
                <p className="text-sm text-neutral-900">{application.deals_per_month}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Primary Markets</p>
                <p className="text-sm text-neutral-900">{application.primary_markets || 'N/A'}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Property Types</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {application.property_types?.map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-[#112F58]/10 text-[#112F58] text-[10px] rounded-full"
                    >
                      {type}
                    </span>
                  )) || <span className="text-sm text-neutral-500">N/A</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {application.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#112F58]" />
                Description
              </h3>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{application.description}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {application.admin_notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#112F58]" />
                Admin Notes
              </h3>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{application.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#112F58]" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Applied On</p>
                <p className="text-sm text-neutral-900">
                  {new Date(application.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {application.reviewed_at && (
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Last Reviewed</p>
                  <p className="text-sm text-neutral-900">
                    {new Date(application.reviewed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Close
          </button>
          <a
            href={`mailto:${application.email}`}
            className="px-4 py-2 text-sm font-medium text-white bg-[#112F58] hover:bg-[#1a4a7a] rounded-lg transition-colors"
          >
            Contact Seller
          </a>
        </div>
      </div>
    </div>
  );
};

export default SellerViewModal;
