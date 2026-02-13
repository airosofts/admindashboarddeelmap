import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { applicationId, email, businessName, contactPersonName, password: providedPassword } = await request.json()

    // Use provided password or generate a new one
    const password = providedPassword || generatePassword()

    // Send email with credentials
    const { data, error } = await resend.emails.send({
      from: 'Deelmap <noreply@deelmap.com>',
      to: [email],
      subject: 'Your Deelmap Seller Account Has Been Approved',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                padding: 40px 20px;
              }
              .email-container {
                max-width: 550px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #112F58;
                padding: 40px 32px;
                text-align: center;
              }
              .header h1 {
                color: #ffffff;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: -0.5px;
                margin: 0;
              }
              .content {
                padding: 40px 32px;
              }
              .greeting {
                font-size: 16px;
                color: #1f2937;
                margin-bottom: 20px;
              }
              .message {
                font-size: 15px;
                color: #4b5563;
                margin-bottom: 16px;
                line-height: 1.7;
              }
              .message strong {
                color: #1f2937;
                font-weight: 600;
              }
              .credentials-card {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 24px;
                margin: 32px 0;
              }
              .credentials-title {
                font-size: 14px;
                font-weight: 600;
                color: #112F58;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 20px;
              }
              .credential-item {
                display: flex;
                flex-direction: column;
                margin-bottom: 16px;
              }
              .credential-item:last-child {
                margin-bottom: 0;
              }
              .credential-label {
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
              }
              .credential-value {
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 15px;
                color: #1f2937;
                background-color: #ffffff;
                padding: 10px 12px;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                word-break: break-all;
              }
              .security-notice {
                background-color: #fef3c7;
                border-left: 3px solid #f59e0b;
                padding: 16px;
                margin: 32px 0;
                border-radius: 4px;
              }
              .security-notice strong {
                font-size: 13px;
                color: #92400e;
                display: block;
                margin-bottom: 4px;
              }
              .security-notice p {
                font-size: 13px;
                color: #78350f;
                margin: 0;
                line-height: 1.6;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #112F58;
                color: #ffffff;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
                transition: background-color 0.2s;
              }
              .button:hover {
                background-color: #0d243f;
              }
              .closing {
                font-size: 15px;
                color: #4b5563;
                margin-top: 32px;
                line-height: 1.7;
              }
              .signature {
                margin-top: 16px;
                font-size: 15px;
                color: #1f2937;
              }
              .signature strong {
                font-weight: 600;
              }
              .footer {
                background-color: #f9fafb;
                padding: 24px 32px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                font-size: 12px;
                color: #6b7280;
                margin: 4px 0;
                line-height: 1.5;
              }
              @media only screen and (max-width: 600px) {
                body {
                  padding: 20px 12px;
                }
                .header {
                  padding: 32px 24px;
                }
                .content {
                  padding: 32px 24px;
                }
                .footer {
                  padding: 20px 24px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>Welcome to Deelmap</h1>
              </div>
              <div class="content">
                <div class="greeting">Dear ${contactPersonName},</div>
                
                <p class="message">
                  Congratulations! Your seller application for <strong>${businessName}</strong> has been approved.
                </p>
                
                <p class="message">
                  You can now access your seller dashboard and start listing your properties on Deelmap.
                </p>

                <div class="credentials-card">
                  <div class="credentials-title">Login Credentials</div>
                  <div class="credential-item">
                    <div class="credential-label">Email Address</div>
                    <div class="credential-value">${email}</div>
                  </div>
                  <div class="credential-item">
                    <div class="credential-label">Password</div>
                    <div class="credential-value">${password}</div>
                  </div>
                </div>

                <div class="security-notice">
                  <strong>Important Security Notice</strong>
                  <p>Please change your password immediately after your first login to ensure your account security.</p>
                </div>

                <div class="button-container">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Login to Your Dashboard</a>
                </div>

                <div class="closing">
                  <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                  <div class="signature">
                    Best regards,<br>
                    <strong>The Deelmap Team</strong>
                  </div>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message from Deelmap.</p>
                <p>Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Deelmap. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      password,
      emailId: data?.id
    })

  } catch (error) {
    console.error('Error in approve API:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
