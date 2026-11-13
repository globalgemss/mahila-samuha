// Only the Cloudflare runtime context is trusted, never browser identity headers.
export async function cloudflareRequest(request, env, ctx) {
  if (!env.ACCESS_AUD || !ctx?.access || ctx.access.aud !== env.ACCESS_AUD) return null;
  const identity = await ctx.access.getIdentity();
  const email = typeof identity?.email === 'string' ? identity.email.trim().toLowerCase() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const headers = new Headers(request.headers);
  headers.delete('oai-authenticated-user-id');
  headers.delete('oai-authenticated-user-email');
  headers.set('oai-authenticated-user-id', `cloudflare:${email}`);
  headers.set('oai-authenticated-user-email', email);
  return new Request(request, {headers});
}
export const accessDenied = () => Response.json({error:'सुरक्षित email login आवश्यक छ। पृष्ठ पुनः खोल्नुहोस्।'}, {status:401, headers:{'cache-control':'no-store'}});
