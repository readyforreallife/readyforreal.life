import { lookup } from 'node:dns/promises';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { library } from './core.mjs';
const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','STRIPE_RESTRICTED_KEY','STRIPE_MODE','SAFETY_STRIPE_PAYMENT_LINK_ID','SAFETY_STRIPE_PRICE_ID','SAFETY_STRIPE_WEBHOOK_SECRET','SITE_ORIGIN','DATABASE_PATH','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','MAIL_FROM'];
const results=[];
const report=(check,status,detail)=>results.push({check,status,detail});
const missing=required.filter(k=>!process.env[k]);
report('Required private configuration',missing.length?'BLOCKED':'PASS',missing.length?'Missing variable names: '+missing.join(', '):'All required names supplied; values redacted.');
async function check(name,fn){try{await fn();report(name,'PASS','Verified read-only.');}catch{report(name,'FAIL','Provider check failed. Values and provider response omitted to protect credentials.');}}
if(process.env.SUPABASE_URL)await check('Supabase DNS',()=>lookup(new URL(process.env.SUPABASE_URL).hostname));
if(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY){
 const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
 await check('Safety staff table and at least one authorized staff account',async()=>{const r=await sb.from('safety_staff').select('user_id,role').eq('enabled',true);if(r.error||!r.data?.some(x=>['owner','instructor'].includes(x.role)))throw Error();});
 for(const name of ['safety-operations','safety-client-uploads'])await check('Private bucket: '+name,async()=>{const r=await sb.storage.getBucket(name);if(r.error||r.data.public)throw Error();});
 await check('All ten private library assets exist',async()=>{for(const [id] of library){const r=await sb.storage.from('safety-operations').info(id==='complete'?'complete.zip':id+'.docx');if(r.error||!r.data)throw Error();}});
}
if(['STRIPE_RESTRICTED_KEY','SAFETY_STRIPE_PAYMENT_LINK_ID','SAFETY_STRIPE_PRICE_ID','STRIPE_MODE'].every(k=>process.env[k])){
 const stripe=new Stripe(process.env.STRIPE_RESTRICTED_KEY,{timeout:15000,maxNetworkRetries:0});
 await check('Stripe Safety link and one-time USD 499.00 price',async()=>{const link=await stripe.paymentLinks.retrieve(process.env.SAFETY_STRIPE_PAYMENT_LINK_ID);const items=await stripe.paymentLinks.listLineItems(link.id,{limit:2});const price=await stripe.prices.retrieve(process.env.SAFETY_STRIPE_PRICE_ID);if(!link.active||link.livemode!==(process.env.STRIPE_MODE==='live')||price.livemode!==link.livemode||!price.active||price.unit_amount!==49900||price.currency!=='usd'||price.type!=='one_time'||items.has_more||items.data.length!==1||items.data[0].price.id!==price.id||items.data[0].quantity!==1)throw Error();});
}
if(['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS'].every(k=>process.env[k]))await check('TLS SMTP connection (no email sent)',async()=>{const port=Number(process.env.SMTP_PORT);if(![465,587].includes(port))throw Error();const mail=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,socketTimeout:15000});try{await mail.verify();}finally{mail.close();}});
report('Real payment, email receipt and intake/upload cycle','BLOCKED','Must be completed in the deployed Stripe sandbox. Preflight never charges or sends email.');
console.log(JSON.stringify({ready:false,results},null,2));
process.exitCode=results.some(r=>r.status==='FAIL')?1:results.some(r=>r.status==='BLOCKED')?2:0;
