import test from 'node:test';
import assert from 'node:assert/strict';
import {cloudflareRequest} from '../server/cloudflare-auth.js';
import {handleApi} from '../server/api.js';
import {localDatabase} from '../scripts/sqlite-d1.mjs';
const env={ACCESS_AUD:'correct-app'};
const req=()=>new Request('https://group.example/api/state',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'owner@example.com','cf-access-jwt-assertion':'forged'}});
const context=(email,aud='correct-app')=>({access:{aud,getIdentity:async()=>({email})}});
test('Cloudflare rejects forged headers, missing Access and wrong application',async()=>{
 assert.equal(await cloudflareRequest(req(),env,{}),null);
 assert.equal(await cloudflareRequest(req(),{},context('owner@example.com')),null);
 assert.equal(await cloudflareRequest(req(),env,context('owner@example.com','other-app')),null);
 assert.equal(await cloudflareRequest(req(),env,context('')),null);
});
test('Cloudflare authenticated identity replaces all supplied identity headers',async()=>{
 const r=await cloudflareRequest(req(),env,context('Member@Example.com'));
 assert.equal(r.headers.get('oai-authenticated-user-id'),'cloudflare:member@example.com');
 assert.equal(r.headers.get('oai-authenticated-user-email'),'member@example.com');
});
test('Cloudflare owner bootstrap persists and uninvited identity cannot enter',async()=>{
 const db=localDatabase(), e={...env,DB:db,OWNER_EMAIL:'owner@example.com'};
 try {
  const outsider=await cloudflareRequest(req(),e,context('outsider@example.com'));
  assert.equal((await handleApi(outsider,e)).status,403);
  const owner=await cloudflareRequest(req(),e,context('owner@example.com'));
  let r=await handleApi(owner,e); assert.equal(r.status,200);
  const s=await r.json();assert.equal(s.user.role,'owner');assert.equal(s.data.members.length,0);
  assert.equal((await handleApi(outsider,e)).status,403);
  r=await handleApi(await cloudflareRequest(req(),e,context('owner@example.com')),e);
  assert.equal((await r.json()).user.userId,'cloudflare:owner@example.com');
 } finally {db.close()}
});
