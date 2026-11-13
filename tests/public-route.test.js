import test from 'node:test';import assert from 'node:assert/strict';
import {isPublicRequest} from '../server/public-route.js';import {emptyData,publicData} from '../server/domain.js';
test('only public reads bypass authentication; private APIs and writes remain protected',()=>{
 for(const path of ['/','/api/public','/assets/main.js','/images/hero.webp'])assert.equal(isPublicRequest(new Request('https://example.com'+path)),true);
 for(const path of ['/admin','/admin/','/api/state','/api/action','/api/public/','/assets/../api/state','/images/../admin/'])assert.equal(isPublicRequest(new Request('https://example.com'+path)),false);
 for(const path of ['/','/api/public','/assets/main.js'])assert.equal(isPublicRequest(new Request('https://example.com'+path,{method:'POST'})),false);
});
test('public projection contains no private members, access records or ledgers',()=>{
 const d=emptyData();d.members=[{id:'private-member',name:'Private',phone:'secret-phone',citizenship:'secret-id'}];d.transactions=[{amount:999}];d.access=[{email:'private@example.com'}];
 const p=publicData(d);assert.deepEqual(p.members,[]);assert.equal(p.memberCount,1);assert.equal(p.transactions,undefined);assert.equal(p.access,undefined);for(const value of ['secret-phone','secret-id','private@example.com','private-member'])assert.equal(JSON.stringify(p).includes(value),false);
});
