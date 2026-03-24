import type { APIRoute } from 'astro';

const PB_URL = (import.meta.env.PB_URL || import.meta.env.PUBLIC_PB_URL || '').replace(/\/$/, '');

function getToken(request: Request) {
  const raw = request.headers.get('authorization') || '';
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
}

async function verifySuperuserToken(token: string) {
  if (!PB_URL || !token) {
    return false;
  }

  const response = await fetch(`${PB_URL}/api/collections/_superusers/auth-refresh`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
  });

  return response.ok;
}

export const POST: APIRoute = async ({ request }) => {
  if (!PB_URL) {
    return new Response(JSON.stringify({ message: 'PB_URL manquant.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = getToken(request);
  const isAllowed = await verifySuperuserToken(token);

  if (!isAllowed) {
    return new Response(JSON.stringify({ message: 'Session admin invalide.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const response = await fetch(`${PB_URL}/api/collections/foods/records`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
    body: formData,
  });
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
};
