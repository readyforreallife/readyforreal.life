import test from 'node:test';
import assert from 'node:assert/strict';
import {createMailer} from './mail.mjs';
const env={MAIL_PROVIDER:'gmail',MAIL_FROM:'Ready for Real Life <sender@example.com>',GMAIL_CLIENT_ID:'test-client',GMAIL_CLIENT_SECRET:'test-secret',GMAIL_REFRESH_TOKEN:'test-refresh'};
test('Gmail refreshes privately and sends MIME over HTTPS without SMTP',async()=>{
 const calls=[];
 const send=await createMailer(env,async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.includes('/token')?{access_token:'test-access',expires_in:3600}:{id:'message-id'}));});
 assert.equal(calls.length,1);
 await send({to:'buyer@example.com',subject:'Private intake',text:'Your private invitation'});
 assert.equal(calls.length,2);
 assert.equal(calls[1].options.headers.Authorization,'Bearer test-access');
 const mime=Buffer.from(JSON.parse(calls[1].options.body).raw,'base64url').toString();
 assert.match(mime,/To: buyer@example.com/);assert.match(mime,/Your private invitation/);
 assert.ok(!mime.includes('test-secret'));assert.ok(!mime.includes('test-refresh'));
});
test('Gmail errors never expose provider response or credentials',async()=>{
 await assert.rejects(createMailer(env,async()=>new Response(JSON.stringify({error:'test-secret'}),{status:400})),{message:'Gmail authorization unavailable'});
 const send=await createMailer(env,async(url)=>new Response(JSON.stringify(url.includes('/token')?{access_token:'token',expires_in:3600}:{error:'private contents'}),{status:url.includes('/token')?200:403}));
 await assert.rejects(send({to:'buyer@example.com',subject:'Test',text:'Private'}),{message:'Gmail delivery unavailable'});
});
