import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {encode85,decode85,BASE85_ALPHABET} from '../scripts/encoding.mjs';
test('standalone packing preserves arbitrary image bytes, including padding and maximum words',()=>{
 assert.equal(BASE85_ALPHABET.length,85);assert.doesNotMatch(BASE85_ALPHABET,/["'<>`\\&/]/);
 for(const bytes of [Buffer.alloc(0),Buffer.alloc(17,255),Buffer.from(Array.from({length:256},(_,i)=>i)),...Array.from({length:12},(_,i)=>randomBytes(i*131+1))]){
  const encoded=encode85(bytes);assert.equal(encoded.length,Math.ceil(bytes.length/4)*5);assert.deepEqual(Buffer.from(decode85(encoded,bytes.length,BASE85_ALPHABET)),bytes);
 }
});
