"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell, Save, AlertCircle, Check, Info, BarChart3, MessageSquare, Hash, Phone, Clock, Moon, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    analytics_notification_enabled: true,
    analytics_notification_threshold: 2,
    analytics_message_template: 'Hey {seller_name}! Your property at {address} got {no_of_views} new views. Engage with them right now: {magic_link}',
    analytics_notification_from_phone: '(332) 333-3839',
    analytics_cooldown_enabled: false,
    analytics_cooldown_hours: 24,
    analytics_quiet_hours_enabled: false,
    analytics_quiet_hours_start: 21,
    analytics_quiet_hours_end: 8,
    analytics_quiet_hours_timezone: 'America/New_York',
    analytics_queue_outside_hours: true,
    analytics_progressive_milestones: [
      { threshold: 2, enabled: true, message: 'Hey {seller_name}! Your property at {address} got {no_of_views} views. Check it out: {magic_link}' },
      { threshold: 5, enabled: true, message: 'Great news {seller_name}! {address} now has {no_of_views} views. See who\'s interested: {magic_link}' },
      { threshold: 10, enabled: true, message: 'Wow {seller_name}! {address} hit {no_of_views} views! Don\'t miss out: {magic_link}' }
    ]
  });

  const [previewMessage, setPreviewMessage] = useState('');

  // Available placeholders for the message template
  const placeholders = [
    { tag: '{seller_name}', description: 'Temp seller\'s name (skipped if not available)' },
    { tag: '{no_of_views}', description: 'Number of unique views on the property' },
    { tag: '{address}', description: 'Full property address (required)' },
    { tag: '{magic_link}', description: 'Magic link for temp seller to engage (required)' }
  ];

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Update preview whenever template or threshold changes
  useEffect(() => {
    updatePreview();
  }, [formData.analytics_message_template, formData.analytics_notification_threshold]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/analytics');
      const data = await response.json();

      if (data.success) {
        setFormData(data.settings);
      } else {
        showMessage('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = () => {
    const preview = formData.analytics_message_template
      .replace('{seller_name}', 'John Smith')
      .replace('{no_of_views}', formData.analytics_notification_threshold.toString())
      .replace('{address}', '123 Main St, Miami, FL 33101')
      .replace('{magic_link}', 'https://deelmap.com/temp-seller/onboard?token=...');

    setPreviewMessage(preview);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required placeholders
      if (!formData.analytics_message_template.includes('{address}')) {
        showMessage('error', 'Message template must include {address} placeholder');
        return;
      }
      if (!formData.analytics_message_template.includes('{magic_link}')) {
        showMessage('error', 'Message template must include {magic_link} placeholder');
        return;
      }

      const response = await fetch('/api/settings/analytics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Analytics settings saved successfully!');
      } else {
        showMessage('error', data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('message-template');
    const cursorPos = textarea.selectionStart;
    const textBefore = formData.analytics_message_template.substring(0, cursorPos);
    const textAfter = formData.analytics_message_template.substring(cursorPos);

    setFormData({
      ...formData,
      analytics_message_template: textBefore + placeholder + textAfter
    });

    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + placeholder.length, cursorPos + placeholder.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112F58]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 font-['Inter',system-ui,-apple-system,sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Analytics Notifications</h1>
          <p className="text-sm text-gray-600 mt-1.5">Configure when and how temp sellers receive notifications about property views</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-base font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Enable/Disable Notifications */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${formData.analytics_notification_enabled ? 'text-[#112F58]' : 'text-gray-400'}`} />
              <div>
                <span className="text-base font-semibold text-gray-900">Enable Notifications</span>
                <p className="text-sm text-gray-600 mt-1">Send SMS alerts when properties reach view milestones</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.analytics_notification_enabled}
                onChange={(e) => setFormData({ ...formData, analytics_notification_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#112F58] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#112F58]"></div>
            </label>
          </div>
        </div>

        {/* Notification Threshold */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-5 h-5 text-gray-600" />
            <span className="text-base font-semibold text-gray-900">View Threshold</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Send notification when property reaches this many unique views
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={formData.analytics_notification_threshold}
              onChange={(e) => setFormData({ ...formData, analytics_notification_threshold: parseInt(e.target.value) || 1 })}
              className="w-28 px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-semibold"
              disabled={!formData.analytics_notification_enabled}
            />
            <span className="text-base text-gray-700 font-medium">unique views</span>
          </div>
        </div>

        {/* SMS From Phone */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-gray-600" />
            <span className="text-base font-semibold text-gray-900">SMS From Number</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Phone number that SMS notifications will be sent from
          </p>
          <input
            type="tel"
            value={formData.analytics_notification_from_phone}
            onChange={(e) => setFormData({ ...formData, analytics_notification_from_phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58]"
            disabled={!formData.analytics_notification_enabled}
          />
        </div>

        {/* Multi-Property Cooldown */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-base font-semibold text-gray-900">Multi-Property Cooldown</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.analytics_cooldown_enabled}
                onChange={(e) => setFormData({ ...formData, analytics_cooldown_enabled: e.target.checked })}
                className="sr-only peer"
                disabled={!formData.analytics_notification_enabled}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#112F58] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#112F58]"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Prevent notification spam for sellers with multiple properties
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="168"
              value={formData.analytics_cooldown_hours}
              onChange={(e) => setFormData({ ...formData, analytics_cooldown_hours: parseInt(e.target.value) || 1 })}
              className="w-28 px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-semibold"
              disabled={!formData.analytics_notification_enabled || !formData.analytics_cooldown_enabled}
            />
            <span className="text-base text-gray-700 font-medium">hours between notifications per seller</span>
          </div>
        </div>

        {/* Message Template */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span className="text-base font-semibold text-gray-900">Message Template</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Customize the SMS message sent to temp sellers. Use placeholders below.
          </p>

          {/* Placeholders Guide */}
          <div className="mb-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-[#112F58] mt-0.5" />
              <span className="text-sm font-semibold text-gray-900">Available Placeholders:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {placeholders.map((p) => (
                <button
                  key={p.tag}
                  onClick={() => insertPlaceholder(p.tag)}
                  className="text-left p-2.5 hover:bg-neutral-100 rounded transition-colors group"
                  disabled={!formData.analytics_notification_enabled}
                >
                  <code className="text-sm font-mono bg-white px-2.5 py-1 rounded text-[#112F58] border border-neutral-200 font-semibold">
                    {p.tag}
                  </code>
                  <p className="text-xs text-gray-600 mt-1.5">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="message-template"
            value={formData.analytics_message_template}
            onChange={(e) => setFormData({ ...formData, analytics_message_template: e.target.value })}
            rows="4"
            className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-mono"
            placeholder="Enter message template with placeholders..."
            disabled={!formData.analytics_notification_enabled}
          />

          {/* Message Preview */}
          <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Preview:</span>
            </div>
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
              {previewMessage || 'Preview will appear here...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ This is how the message will look with sample data
            </p>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-gray-600" />
              <span className="text-base font-semibold text-gray-900">Quiet Hours</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.analytics_quiet_hours_enabled}
                onChange={(e) => setFormData({ ...formData, analytics_quiet_hours_enabled: e.target.checked })}
                className="sr-only peer"
                disabled={!formData.analytics_notification_enabled}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#112F58] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#112F58]"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Prevent SMS notifications from being sent during nighttime or off-hours
          </p>

          {/* Visual Explanation */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How it works:</p>
                <p className="text-blue-800 mb-2">
                  Set a time range when notifications should NOT be sent. For example:
                </p>
                <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                  <p className="text-blue-900 font-semibold mb-1">Example Configuration:</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• <strong>Start:</strong> 22 (10:00 PM) - When quiet hours BEGIN</li>
                    <li>• <strong>End:</strong> 8 (8:00 AM) - When quiet hours END</li>
                    <li>• <strong>Result:</strong> No SMS between 10 PM and 8 AM</li>
                  </ul>
                </div>
                <p className="text-blue-800 mt-2 text-xs">
                  ⏰ Use 24-hour format (0-23). The system blocks all notifications during these hours.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Start Hour <span className="text-gray-500 font-normal">(0-23)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.analytics_quiet_hours_start}
                  onChange={(e) => setFormData({ ...formData, analytics_quiet_hours_start: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-semibold"
                  disabled={!formData.analytics_notification_enabled || !formData.analytics_quiet_hours_enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  When quiet hours begin ({formData.analytics_quiet_hours_start}:00)
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  End Hour <span className="text-gray-500 font-normal">(0-23)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.analytics_quiet_hours_end}
                  onChange={(e) => setFormData({ ...formData, analytics_quiet_hours_end: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-semibold"
                  disabled={!formData.analytics_notification_enabled || !formData.analytics_quiet_hours_enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  When quiet hours end ({formData.analytics_quiet_hours_end}:00)
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">Timezone</label>
              <select
                value={formData.analytics_quiet_hours_timezone}
                onChange={(e) => setFormData({ ...formData, analytics_quiet_hours_timezone: e.target.value })}
                className="w-full px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58]"
                disabled={!formData.analytics_notification_enabled || !formData.analytics_quiet_hours_enabled}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Phoenix">Mountain Time - Arizona (MST)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-sm text-gray-900 font-medium">Queue notifications during quiet hours for later</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.analytics_queue_outside_hours}
                  onChange={(e) => setFormData({ ...formData, analytics_queue_outside_hours: e.target.checked })}
                  className="sr-only peer"
                  disabled={!formData.analytics_notification_enabled || !formData.analytics_quiet_hours_enabled}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#112F58] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#112F58]"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              💡 When enabled, notifications triggered during quiet hours will be queued and sent when quiet hours end
            </p>
          </div>
        </div>

        {/* Progressive Milestones */}
        <div className="px-4 md:px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-base font-semibold text-gray-900">Progressive Milestones</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Send multiple notifications as property views increase
          </p>

          <div className="space-y-3">
            {formData.analytics_progressive_milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Milestone {index + 1}: {milestone.threshold} views
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={milestone.enabled}
                      onChange={(e) => {
                        const newMilestones = [...formData.analytics_progressive_milestones];
                        newMilestones[index].enabled = e.target.checked;
                        setFormData({ ...formData, analytics_progressive_milestones: newMilestones });
                      }}
                      className="sr-only peer"
                      disabled={!formData.analytics_notification_enabled}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#112F58] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#112F58]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">View Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={milestone.threshold}
                      onChange={(e) => {
                        const newMilestones = [...formData.analytics_progressive_milestones];
                        newMilestones[index].threshold = parseInt(e.target.value) || 1;
                        setFormData({ ...formData, analytics_progressive_milestones: newMilestones });
                      }}
                      className="w-full px-4 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-semibold"
                      disabled={!formData.analytics_notification_enabled || !milestone.enabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Message Template</label>
                    <textarea
                      value={milestone.message}
                      onChange={(e) => {
                        const newMilestones = [...formData.analytics_progressive_milestones];
                        newMilestones[index].message = e.target.value;
                        setFormData({ ...formData, analytics_progressive_milestones: newMilestones });
                      }}
                      rows="3"
                      className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112F58] focus:border-[#112F58] font-mono"
                      placeholder="Enter message template..."
                      disabled={!formData.analytics_notification_enabled || !milestone.enabled}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="px-4 md:px-5 py-4 bg-neutral-50">
          <button
            onClick={handleSave}
            disabled={saving || !formData.analytics_notification_enabled}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold transition-colors ${
              saving || !formData.analytics_notification_enabled
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : 'bg-[#112F58] text-white hover:bg-[#0d243f]'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Analytics Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-2">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>System counts unique viewers (by email) for each property</li>
              <li>When the threshold is reached, temp seller receives an SMS notification</li>
              <li>Notification is sent only once per property (prevents spam)</li>
              <li>SMS includes a magic link for temp seller to engage with viewers</li>
              <li>System users (internal testers) are excluded from view counts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSettingsPage;
