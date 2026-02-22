// Supabase Edge Function: notify-bulk-application
// Sends email notification when a user applies to all carriers at once

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = 'admin@mileone.com';

serve(async (req) => {
  try {
    const { user_id, carrier_count } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [profileRes, driverRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user_id).single(),
      supabase.from('driver_profiles').select('*').eq('id', user_id).single(),
    ]);

    const profile = profileRes.data;
    const driver = driverRes.data;

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
          subject: `Bulk Application: ${profile?.full_name} applied to ${carrier_count} carriers`,
          html: `
            <h2>Bulk Job Application</h2>
            <p><strong>${profile?.full_name}</strong> applied to <strong>${carrier_count} carriers</strong> at once.</p>
            <h3>Applicant Details</h3>
            <p><strong>Email:</strong> ${profile?.email}</p>
            <p><strong>Phone:</strong> ${profile?.phone}</p>
            <p><strong>CDL Class:</strong> ${driver?.cdl_class || 'N/A'}</p>
            <p><strong>Endorsements:</strong> ${driver?.endorsements?.join(', ') || 'None'}</p>
            <p><strong>Experience:</strong> ${driver?.months_experience || 0} months</p>
            <p>Review all applications in the admin dashboard.</p>
          `,
        }),
      });
    } else {
      console.log(`[NOTIFICATION] Bulk application: ${profile?.full_name} → ${carrier_count} carriers`);
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
