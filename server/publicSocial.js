import {readSmallBody} from './publicRequests.js';
import {publicPosts} from '../src/publicContent.js';
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
export async function publicSocial(request,db,data){
 const match=request.headers.get('cookie')?.match(/(?:^|;\s*)mahila_visitor=([a-f0-9-]+)/),existing=match&&uuid.test(match[1])?match[1]:null,visitor=existing||crypto.randomUUID();
 const posts=publicPosts(data),keys=new Set(posts.map(p=>p.key));
 if(request.method==='POST'){
  if(!existing)fail(409,'पहिले पेज पुनः लोड गर्नुहोस्।');const b=await readSmallBody(request);
  if(!keys.has(b?.id))fail(404,'यो पोस्ट प्रकाशित छैन।');if(!['like','share'].includes(b.action)||(b.action==='like'&&typeof b.liked!=='boolean'))fail(400,'कार्य मिलेन।');
  const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||'local',digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+Math.floor(now/60000))),bucket=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const count=await db.prepare('INSERT INTO public_social_rate(bucket,hits,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1 RETURNING hits').bind(bucket,now+86400000).first();if(count.hits>60)fail(429,'केही समयपछि प्रयास गर्नुहोस्।');
  await db.prepare('DELETE FROM public_social_rate WHERE expires < ?').bind(now).run();
  if(b.action==='like')await db.prepare('INSERT INTO public_reactions(post_id,visitor,liked) VALUES(?,?,?) ON CONFLICT(post_id,visitor) DO UPDATE SET liked=excluded.liked').bind(b.id,visitor,b.liked?1:0).run();
  else await db.prepare('INSERT INTO public_reactions(post_id,visitor,shares,shared_at) VALUES(?,?,1,?) ON CONFLICT(post_id,visitor) DO UPDATE SET shares=shares+1,shared_at=excluded.shared_at WHERE public_reactions.shared_at <= ?').bind(b.id,visitor,now,now-10000).run();
 }
 const rows=await db.prepare('SELECT post_id, SUM(liked) AS likes,SUM(shares) AS shares,MAX(CASE WHEN visitor=? THEN liked ELSE 0 END) AS liked FROM public_reactions GROUP BY post_id').bind(visitor).run();
 const counts=Object.fromEntries(rows.results.filter(r=>keys.has(r.post_id)).map(r=>[r.post_id,{likes:r.likes,shares:r.shares,liked:!!r.liked}]));
 return new Response(JSON.stringify({counts}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','set-cookie':`mahila_visitor=${visitor}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`}});
}
