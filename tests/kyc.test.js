import test from 'node:test';import assert from 'node:assert/strict';import {validateKyc} from '../src/kyc.js';
test('minimal KYC permits missing voter ID and old member fields',()=>{assert.equal(validateKyc({name:'नमुना सदस्य'}),null)});
test('invalid coordinates and mobile are rejected',()=>{assert.ok(validateKyc({name:'Demo',latitude:'91',longitude:'85'}));assert.ok(validateKyc({name:'Demo',phone:'123'}));assert.equal(validateKyc({name:'Demo',latitude:'27.7',longitude:'85.3'}),null)});
test('family rows require both name and relation',()=>{assert.ok(validateKyc({name:'Demo',family:[{name:'Test'}]}));assert.equal(validateKyc({name:'Demo',family:[{name:'Test',relation:'बहिनी'}]}),null)});
