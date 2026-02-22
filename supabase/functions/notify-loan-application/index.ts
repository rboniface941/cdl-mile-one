// Supabase Edge Function: notify-loan-application
// Sends an email notification to admin@mileone.com when a new loan application is submitted

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ADMIN_EMAIL = 'admin@mileone.com';

serve(async (req) => {
  try {
    const { full_name, email, loan_amount } = await req.json();

    // Using Supabase's built-in SMTP or a configured email service
    // For production, integrate with SendGrid, Resend, or similar
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Mile One <notifications@mileone.com>',
          to: [ADMIN_EMAIL],
          subject: `New Loan Application: ${full_name}`,
          html: `
            <h2>New CDL School Funding Application</h2>
            <p><strong>Name:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Requested Amount:</strong> $${loan_amount?.toLocaleString()}</p>
            <p>Log in to the admin dashboard to review this application.</p>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errorText = await emailRes.text();
        console.error('Email send failed:', errorText);
      }
    } else {
      console.log(`[NOTIFICATION] New loan application from ${full_name} (${email}) for $${loan_amount}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
