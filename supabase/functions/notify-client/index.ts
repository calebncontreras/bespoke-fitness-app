import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { clientEmail, clientName, documentName, status } = await req.json();

  const approved = status === 'approved';
  const subject = approved
    ? `Your document has been approved — ${documentName}`
    : `Action required — ${documentName}`;
  const body = approved
    ? `<p style="font-family:sans-serif;font-size:14px;color:#333;">Hi <strong>${clientName}</strong>,</p>
       <p style="font-family:sans-serif;font-size:14px;color:#333;">Your signed copy of <strong>${documentName}</strong> has been approved. You're all set!</p>`
    : `<p style="font-family:sans-serif;font-size:14px;color:#333;">Hi <strong>${clientName}</strong>,</p>
       <p style="font-family:sans-serif;font-size:14px;color:#333;">Your submission for <strong>${documentName}</strong> was not accepted. Please re-sign and re-upload the document.</p>`;

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
