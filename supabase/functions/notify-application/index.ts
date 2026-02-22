// Supabase Edge Function: notify-application
// Sends email notification when a user applies to a carrier

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = 'admin@mileone.com';

serve(async (req) => {
  try {
    const { user_id, carrier_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch applicant profile and driver profile
    const [profileRes, driverRes, carrierRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user_id).single(),
      supabase.from('driver_profiles').select('*').eq('id', user_id).single(),
      supabase.from('carriers').select('*').eq('id', carrier_id).single(),
    ]);

    const profile = profileRes.data;
    const driver = driverRes.data;
    const carrier = carrierRes.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Mile One <notifications@mileone.com>',
          to: [ADMIN_EMAIL],
          subject: `New Job Application: ${profile?.full_name} → ${carrier?.company_name}`,
          html: `
            <h2>New Job Application</h2>
            <h3>Applicant</h3>
            <p><strong>Name:</strong> ${profile?.full_name}</p>
            <p><strong>Email:</strong> ${profile?.email}</p>
            <p><strong>Phone:</strong> ${profile?.phone}</p>
            <h3>Driver Profile</h3>
            <p><strong>CDL Class:</strong> ${driver?.cdl_class || 'N/A'}</p>
            <p><strong>State:</strong> ${driver?.state_issued || 'N/A'}</p>
            <p><strong>Endorsements:</strong> ${driver?.endorsements?.join(', ') || 'None'}</p>
            <p><strong>Experience:</strong> ${driver?.months_experience || 0} months</p>
            <p><strong>Job Type:</strong> ${driver?.job_type || 'N/A'}</p>
            <h3>Applied To</h3>
            <p><strong>Carrier:</strong> ${carrier?.company_name}</p>
            <p><strong>Position:</strong> ${carrier?.job_title}</p>
          `,
        }),
      });
    } else {
      console.log(`[NOTIFICATION] New application: ${profile?.full_name} → ${carrier?.company_name}`);
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
