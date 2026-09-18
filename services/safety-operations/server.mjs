import {createServer} from 'node:http';
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {mkdirSync,realpathSync,statSync,writeFileSync,unlinkSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import Stripe from 'stripe';
import {createMailer} from './mail.mjs';
import {createClient} from '@supabase/supabase-js';
import {createSafety,HttpError} from './core.mjs';


function verifyNetlifyFormSignature(token,raw,secret){
 if(!secret||typeof token!=='string')return false;
 const parts=token.split('.');if(parts.length!==3)return false;
 let header,payload;
 try{header=JSON.parse(Buffer.from(parts[0],'base64url').toString());payload=JSON.parse(Buffer.from(parts[1],'base64url').toString());}catch{return false;}
 if(header.alg!=='HS256'||payload.iss!=='netlify')return false;
 const expected=createHmac('sha256',secret).update(parts[0]+'.'+parts[1]).digest();
 let actual;try{actual=Buffer.from(parts[2],'base64url');}catch{return false;}
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;
 return payload.sha256===createHash('sha256').update(raw).digest('hex');
}

export function httpServer(service,siteOrigin){return createServer(async(req,res)=>{
 const origin=req.headers.origin;
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Vary':'Origin'};
 if(origin===siteOrigin){headers['Access-Control-Allow-Origin']=siteOrigin;headers['Access-Control-Allow-Headers']='Authorization, Content-Type';headers['Access-Control-Allow-Methods']='GET,POST,PATCH,OPTIONS';}
 const send=(code,value,extra={})=>{res.writeHead(code,{...headers,'Content-Type':'application/json',...extra});res.end(Buffer.isBuffer(value)?value:JSON.stringify(value));};
 try{
  if(origin&&origin!==siteOrigin)throw new HttpError(403,'Origin not allowed');
  if(req.method==='OPTIONS')return send(204,'');
  const path=new URL(req.url,'https://internal.invalid').pathname;
  if(path==='/health'&&req.method==='GET')return send(200,{up:true});
  const chunks=[];let size=0;
  const max=path==='/client/uploads'?14005000:1000000;
  for await(const chunk of req){size+=chunk.length;if(size>max)throw new HttpError(413,'Request too large');chunks.push(chunk);}
  const raw=Buffer.concat(chunks);
  if(path==='/stripe/webhook'&&req.method==='POST')return send(200,await service.webhook(raw,req.headers['stripe-signature']));
  if(path==='/netlify/review-request'&&req.method==='POST'){
   if(!verifyNetlifyFormSignature(req.headers['x-webhook-signature'],raw,process.env.NETLIFY_FORM_WEBHOOK_SECRET))throw new HttpError(403,'Invalid signature');
   let submission;try{submission=JSON.parse(raw.toString());}catch{throw new HttpError(400,'Invalid request');}
   return send(200,await service.formSubmission(submission));
  }
  let body={};if(raw.length){try{body=JSON.parse(raw.toString());}catch{throw new HttpError(400,'Invalid request');}}
  const auth=req.headers.authorization||'',token=auth.startsWith('Bearer ')?auth.slice(7):'';
  const result=await service.route(req.method,path,token,body);
  if(result.bytes)return send(200,result.bytes,{'Content-Type':result.mime,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(result.name)}`});
  send(200,result);
 }catch(e){send(e.status||503,{error:e.status?e.message:'Safety service temporarily unavailable'});}
 });}

// Wait for the socket before declaring startup successful. Railway routes to PORT
// on the container network interface; a loopback-only listener is unreachable.
export async function startHttpServer(service,siteOrigin,{port=process.env.PORT??8789,log=console.info}={}){
 if(!/^\d+$/.test(String(port))||Number(port)>65535)throw new Error('Invalid HTTP listening port');
 const server=httpServer(service,siteOrigin);
 server.requestTimeout=60000;server.headersTimeout=15000;
 await new Promise((resolve,reject)=>{
  const failed=error=>{server.off('listening',listening);reject(error);};
  const listening=()=>{server.off('error',failed);resolve();};
  server.once('error',failed);server.once('listening',listening);
  server.listen({port:Number(port),host:'0.0.0.0'});
 });
 log('Safety HTTP server listening on 0.0.0.0:'+server.address().port);
 return server;
}

async function stage(name,fn){
 console.info(`Safety startup stage: ${name}`);
 try{return await fn();}
 catch{console.error(`Safety startup stage failed: ${name}`);throw new Error('startup stage failed');}
}

async function main(){
 process.umask(0o077);
 const need=k=>{if(!process.env[k])throw new Error('Missing '+k);return process.env[k];};

 const {site,dbPath,config}=await stage('environment validation',async()=>{
  const site=new URL(need('SITE_ORIGIN'));if(site.protocol!=='https:'||site.pathname!=='/'||site.search||site.hash||site.username||site.password)throw new Error('Use an HTTPS site origin');
  const dbPath=need('DATABASE_PATH');if(!isAbsolute(dbPath))throw new Error('Use an absolute private database path');
  const checkout=resolve(dirname(fileURLToPath(import.meta.url)),'../..');mkdirSync(dirname(dbPath),{recursive:true,mode:0o700});
  if(!relative(checkout,realpathSync(dirname(dbPath))).startsWith('../'))throw new Error('Database must be outside website');
  const mode=need('STRIPE_MODE');if(!['live','test'].includes(mode))throw new Error('Invalid mode');
  const config={dbPath,siteOrigin:site.origin,live:mode==='live',paymentLinkId:need('SAFETY_STRIPE_PAYMENT_LINK_ID'),priceId:need('SAFETY_STRIPE_PRICE_ID'),webhookSecret:need('SAFETY_STRIPE_WEBHOOK_SECRET')};
  return {site,dbPath,config};
 });

 const stripe=await stage('Stripe configuration check',async()=>{
  const stripe=new Stripe(need('STRIPE_RESTRICTED_KEY'),{timeout:15000,maxNetworkRetries:2});
  const link=await stripe.paymentLinks.retrieve(config.paymentLinkId),price=await stripe.prices.retrieve(config.priceId);
  const items=await stripe.paymentLinks.listLineItems(config.paymentLinkId,{limit:2});
  if(!link.active||link.livemode!==config.live||price.livemode!==config.live||price.unit_amount!==49900||price.currency!=='usd'||price.type!=='one_time'||items.has_more||items.data.length!==1||items.data[0].price.id!==config.priceId||items.data[0].quantity!==1)throw new Error('Incorrect Safety checkout configuration');
  return stripe;
 });

 const sb=await stage('Supabase private bucket checks',async()=>{
  const sb=createClient(need('SUPABASE_URL'),need('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  for(const bucket of ['safety-operations','safety-client-uploads']){const {data,error}=await sb.storage.getBucket(bucket);if(error||!data||data.public)throw new Error('Required private bucket unavailable');}
  return sb;
 });

 await stage('Private data filesystem check',async()=>{
  const dir=dirname(dbPath);
  const s=statSync(dir);
  const mode=(s.mode & 0o777).toString(8).padStart(3,'0');
  console.info('Private data filesystem diagnostic: exists=yes uid='+s.uid+' gid='+s.gid+' mode='+mode);
  const probe=resolve(dir,'.write-probe-'+process.pid);
  try{
   writeFileSync(probe,'ok',{flag:'wx',mode:0o600});
   console.info('Private data filesystem diagnostic: write=yes');
  }catch(error){
   console.error('Private data filesystem diagnostic: write=no code='+(error?.code||'no-code'));
   throw error;
  }finally{
   try{unlinkSync(probe);}catch{}
  }
 });
 const sendEmail=await stage('Gmail authorization',()=>createMailer());
 const service=await stage('Safety database initialization',async()=>{
  try { return createSafety({config,supabase:sb,stripe,sendEmail}); }
  catch (error) {
    console.error('Safety database diagnostic:', error?.name || 'Error', error?.code || 'no-code', error?.message || 'no-message');
    throw error;
  }
});

 await stage('HTTP server startup',async()=>{
  const server=await startHttpServer(service,site.origin);
  const run=()=>service.queue().catch(()=>console.warn('Safety invitation queue needs attention'));
  const interval=setInterval(run,15000);run();
  process.on('SIGTERM',()=>{clearInterval(interval);server.close(()=>process.exit(0));});
  console.info('Safety operations service started');
 });
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Safety service startup failed; see stage label above');process.exitCode=1;});
