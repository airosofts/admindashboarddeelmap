import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Generate random password
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request) {
  try {
    const applicationData = await request.json()

    // Check if auto-approve is enabled for any admin
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('auto_approve_sellers')
      .eq('auto_approve_sellers', true)
      .limit(1)
      .single()

    const shouldAutoApprove = settings?.auto_approve_sellers === true

    let status = 'pending'
    let password = null
    let reviewedAt = null

    if (shouldAutoApprove) {
      status = 'approved'
      password = generatePassword()
      reviewedAt = new Date().toISOString()
    }

    // Insert the application
    const { data: application, error: insertError } = await supabase
      .from('seller_applications')
      .insert([
        {
          business_name: applicationData.businessName,
          contact_person_name: applicationData.contactPersonName,
          email: applicationData.email,
          phone: applicationData.phone,
          business_type: applicationData.businessType,
          deals_per_month: applicationData.dealsPerMonth,
          primary_markets: applicationData.primaryMarkets,
          property_types: applicationData.propertyTypes,
          website: applicationData.website || null,
          linkedin: applicationData.linkedin || null,
          description: applicationData.description || null,
          status: status,
          password: password,
          reviewed_at: reviewedAt
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // If auto-approved, send email with credentials
    if (shouldAutoApprove && application) {
      try {
        const approvalResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/seller-applications/approve`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applicationId: application.id,
              email: application.email,
              businessName: application.business_name,
              contactPersonName: application.contact_person_name,
              password: password
            })
          }
        )

        const approvalResult = await approvalResponse.json()

        if (!approvalResult.success) {
          console.error('Failed to send auto-approval email:', approvalResult.error)
          // Don't throw - application is still created and approved
        }
      } catch (emailError) {
        console.error('Error sending auto-approval email:', emailError)
        // Don't throw - application is still created and approved
      }
    }

    return NextResponse.json({
      success: true,
      application: application,
      autoApproved: shouldAutoApprove
    })

  } catch (error) {
    console.error('Error in submit API:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
