import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublicDemo,demoEnabled} from '../src/publicDemo.js';
test('public demo is opt-in and isolated from other data instances',()=>{assert.equal(demoEnabled(''),false);assert.equal(demoEnabled('?demo=0'),false);assert.equal(demoEnabled('?demo=1'),true);const a=createPublicDemo(),b=createPublicDemo();a.settings.name='changed';a.posts[0].title='changed';assert.notEqual(b.settings.name,a.settings.name);assert.notEqual(a.posts[0].title,b.posts[0].title);assert.equal(b.members.length,0);assert.equal(b.posts.length,3);assert.ok(b.posts.every(p=>p.reviewed&&p.consent&&p.status==='प्रकाशित'));});
