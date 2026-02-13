import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch property engagement summary
    if (type === 'summary') {
      let query = supabase
        .from('property_analytics')
        .select(`
          property_id,
          property_address,
          user_email,
          user_first_name,
          user_last_name,
          device_type,
          duration_seconds,
          active_time_seconds,
          scrolled_to_bottom,
          viewed_description,
          viewed_repairs,
          viewed_photos,
          clicked_more_photos,
          clicked_share,
          zoomed_map,
          full_view_achieved,
          created_at,
          utm_source
        `)
        .order('created_at', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
      }

      // Group by property and calculate stats
      const propertyStats = {};

      data.forEach(view => {
        if (!propertyStats[view.property_id]) {
          propertyStats[view.property_id] = {
            property_id: view.property_id,
            property_address: view.property_address,
            total_views: 0,
            unique_viewers: new Set(),
            total_duration: 0,
            total_active_time: 0,
            engagement_metrics: {
              scrolled_to_bottom: 0,
              viewed_description: 0,
              viewed_repairs: 0,
              viewed_photos: 0,
              clicked_more_photos: 0,
              clicked_share: 0,
              zoomed_map: 0,
              full_view_achieved: 0
            },
            devices: { desktop: 0, mobile: 0, tablet: 0 },
            utm_sources: {},
            recent_viewers: []
          };
        }

        const stats = propertyStats[view.property_id];
        stats.total_views++;

        if (view.user_email) {
          stats.unique_viewers.add(view.user_email);
        }

        stats.total_duration += view.duration_seconds || 0;
        stats.total_active_time += view.active_time_seconds || 0;

        if (view.scrolled_to_bottom) stats.engagement_metrics.scrolled_to_bottom++;
        if (view.viewed_description) stats.engagement_metrics.viewed_description++;
        if (view.viewed_repairs) stats.engagement_metrics.viewed_repairs++;
        if (view.viewed_photos) stats.engagement_metrics.viewed_photos++;
        if (view.clicked_more_photos) stats.engagement_metrics.clicked_more_photos++;
        if (view.clicked_share) stats.engagement_metrics.clicked_share++;
        if (view.zoomed_map) stats.engagement_metrics.zoomed_map++;
        if (view.full_view_achieved) stats.engagement_metrics.full_view_achieved++;

        if (view.device_type) {
          stats.devices[view.device_type] = (stats.devices[view.device_type] || 0) + 1;
        }

        if (view.utm_source) {
          stats.utm_sources[view.utm_source] = (stats.utm_sources[view.utm_source] || 0) + 1;
        }

        // Track recent viewers
        if (view.user_email && stats.recent_viewers.length < 10) {
          stats.recent_viewers.push({
            email: view.user_email,
            name: `${view.user_first_name || ''} ${view.user_last_name || ''}`.trim(),
            created_at: view.created_at,
            device: view.device_type
          });
        }
      });

      // Convert to array and calculate final metrics
      const propertyArray = Object.values(propertyStats).map(stats => ({
        ...stats,
        unique_viewers_count: stats.unique_viewers.size,
        unique_viewers: undefined,
        avg_duration: stats.total_views > 0 ? Math.round(stats.total_duration / stats.total_views) : 0,
        avg_active_time: stats.total_views > 0 ? Math.round(stats.total_active_time / stats.total_views) : 0,
        engagement_rate: stats.total_views > 0
          ? Math.round((stats.engagement_metrics.full_view_achieved / stats.total_views) * 100)
          : 0
      }));

      // Sort by total views descending
      propertyArray.sort((a, b) => b.total_views - a.total_views);

      return NextResponse.json({ success: true, data: propertyArray });
    }

    // Fetch detailed property analytics
    if (type === 'property-detail' && propertyId) {
      const { data, error } = await supabase
        .from('property_analytics')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching property detail:', error);
        return NextResponse.json({ error: 'Failed to fetch property details' }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    // Fetch notifications history
    if (type === 'notifications') {
      const { data, error } = await supabase
        .from('analytics_notifications_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
