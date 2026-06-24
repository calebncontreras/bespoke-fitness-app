import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const APP_URL = Deno.env.get('APP_URL') ?? 'https://bespoke-fitness-app.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { clientEmail, clientName, documentName, status } = await req.json();

  let subject: string;
  let body: string;

  if (status === 'all_approved') {
    subject = "You're approved — log in to schedule";
    body = `
      <p style="font-family:sans-serif;font-size:14px;color:#333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        Your documents have been reviewed and approved. You now have access to schedule your free trial session.
      </p>
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        <a href="${APP_URL}" style="color:#111;font-weight:bold;">Log in to get started →</a>
      </p>
      <p style="font-family:sans-serif;font-size:12px;color:#999;margin-top:24px;">
        After your trial, your trainer will help you set up a membership to continue booking.
      </p>`;
  } else if (status === 'approved') {
    subject = `Document approved — ${documentName}`;
    body = `
      <p style="font-family:sans-serif;font-size:14px;color:#333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        Your signed copy of <strong>${documentName}</strong> has been approved.
      </p>`;
  } else {
    subject = `Action required — ${documentName}`;
    body = `
      <p style="font-family:sans-serif;font-size:14px;color:#333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        Your submission for <strong>${documentName}</strong> was not accepted. Please re-sign and re-upload the document.
      </p>
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        <a href="${APP_URL}" style="color:#111;font-weight:bold;">Log in to re-upload →</a>
      </p>`;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bespoke Fitness <onboarding@resend.dev>',
      to: clientEmail,
      subject,
      html: body,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
