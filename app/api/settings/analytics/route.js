import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET - Fetch analytics settings
export async function GET(request) {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select(`
        analytics_notification_enabled,
        analytics_notification_threshold,
        analytics_message_template,
        analytics_notification_from_phone,
        analytics_cooldown_enabled,
        analytics_cooldown_hours,
        analytics_quiet_hours_enabled,
        analytics_quiet_hours_start,
        analytics_quiet_hours_end,
        analytics_quiet_hours_timezone,
        analytics_queue_outside_hours,
        analytics_progressive_milestones
      `)
      .limit(1)
      .single()

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          settings: {
            analytics_notification_enabled: true,
            analytics_notification_threshold: 2,
            analytics_message_template: 'Hey {seller_name}! Your property at {address} got {no_of_views} new views. Engage with them right now: {magic_link}',
            analytics_notification_from_phone: '(332) 333-3839',
            analytics_cooldown_enabled: false,
            analytics_cooldown_hours: 24,
            analytics_quiet_hours_enabled: false,
            analytics_quiet_hours_start: 22,
            analytics_quiet_hours_end: 8,
            analytics_quiet_hours_timezone: 'America/New_York',
            analytics_queue_outside_hours: true,
            analytics_progressive_milestones: [
              {threshold: 2, enabled: true, message: 'Hey {seller_name}! Your property at {address} got {no_of_views} new views. Engage with them right now: {magic_link}'},
              {threshold: 5, enabled: true, message: 'Great news {seller_name}! Your property at {address} now has {no_of_views} views. Keep the momentum going: {magic_link}'},
              {threshold: 10, enabled: true, message: 'Hot property! {address} has {no_of_views} views! Check them out: {magic_link}'}
            ]
          }
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      settings: settings || {
        analytics_notification_enabled: true,
        analytics_notification_threshold: 2,
        analytics_message_template: 'Hey {seller_name}! Your property at {address} got {no_of_views} new views. Engage with them right now: {magic_link}',
        analytics_notification_from_phone: '(332) 333-3839'
      }
    })

  } catch (error) {
    console.error('Error fetching analytics settings:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT - Update analytics settings
export async function PUT(request) {
  try {
    const body = await request.json()
    const {
      analytics_notification_enabled,
      analytics_notification_threshold,
      analytics_message_template,
      analytics_notification_from_phone,
      analytics_cooldown_enabled,
      analytics_cooldown_hours,
      analytics_quiet_hours_enabled,
      analytics_quiet_hours_start,
      analytics_quiet_hours_end,
      analytics_quiet_hours_timezone,
      analytics_queue_outside_hours,
      analytics_progressive_milestones
    } = body

    // Validate required fields
    if (analytics_notification_threshold && analytics_notification_threshold < 1) {
      return NextResponse.json({
        success: false,
        error: 'Notification threshold must be at least 1'
      }, { status: 400 })
    }

    // Validate message template has required placeholders
    if (analytics_message_template) {
      const requiredPlaceholders = ['{address}', '{magic_link}']
      const missingPlaceholders = requiredPlaceholders.filter(
        placeholder => !analytics_message_template.includes(placeholder)
      )

      if (missingPlaceholders.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Message template must include: ${missingPlaceholders.join(', ')}`
        }, { status: 400 })
      }
    }

    // Check if settings record exists
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('settings')
        .update({
          analytics_notification_enabled,
          analytics_notification_threshold,
          analytics_message_template,
          analytics_notification_from_phone,
          analytics_cooldown_enabled,
          analytics_cooldown_hours,
          analytics_quiet_hours_enabled,
          analytics_quiet_hours_start,
          analytics_quiet_hours_end,
          analytics_quiet_hours_timezone,
          analytics_queue_outside_hours,
          analytics_progressive_milestones,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('settings')
        .insert([{
          analytics_notification_enabled,
          analytics_notification_threshold,
          analytics_message_template,
          analytics_notification_from_phone,
          analytics_cooldown_enabled,
          analytics_cooldown_hours,
          analytics_quiet_hours_enabled,
          analytics_quiet_hours_start,
          analytics_quiet_hours_end,
          analytics_quiet_hours_timezone,
          analytics_queue_outside_hours,
          analytics_progressive_milestones,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      settings: result,
      message: 'Analytics settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating analytics settings:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
