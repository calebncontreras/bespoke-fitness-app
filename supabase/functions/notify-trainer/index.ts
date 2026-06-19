import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TRAINER_EMAIL = Deno.env.get('TRAINER_EMAIL');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const { memberName, documentName } = await req.json();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bespoke Fitness <onboarding@resend.dev>',
      to: TRAINER_EMAIL,
      subject: `Document submitted — ${memberName}`,
      html: `
        <p style="font-family: sans-serif; font-size: 14px; color: #333;">
          <strong>${memberName}</strong> has uploaded a signed copy of <strong>${documentName}</strong>.
        </p>
        <p style="font-family: sans-serif; font-size: 14px; color: #666;">
          Log in to your dashboard to review and approve it.
        </p>
      `,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
