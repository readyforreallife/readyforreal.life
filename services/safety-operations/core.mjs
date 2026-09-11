import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
export const statuses=['Paid','Intake pending','Intake received','Documents complete','Review in progress','Report ready','Findings meeting scheduled','Closed'];
export const library=[
 ['01','Client Delivery Playbook','01_Client_Delivery_Playbook.docx'],
 ['02','Client Intake Questionnaire','02_Client_Intake_Questionnaire.docx'],
 ['03','Document Request Checklist','03_Document_Request_Checklist.docx'],
 ['04','Preparedness Assessment Rubric','04_Assessment_Rubric.docx'],
 ['05','Client Report Template','05_Client_Report_Template.docx'],
 ['06','30-Minute Virtual Findings Review','06_30_Minute_Findings_Review_Agenda.docx'],
 ['07','Client Email Templates','07_Client_Email_Templates.docx'],
 ['08','Scope, Terms, and Client Acknowledgment','08_Scope_Terms_Client_Acknowledgment.docx'],
 ['09','Internal Engagement Worksheet','09_Internal_Engagement_Worksheet.docx'],
 ['complete','Download Complete Safety Delivery System','complete-system.zip']
];
export const categories=['Emergency/safety plan','Notification procedure','Roles and responsibilities','Evacuation/shelter/accountability procedures','Staff quick-reference sheets','Training/drill/after-action records','Visitor/general access policy','Child or vulnerable-person accountability procedures','Necessary facility map','Communication templates','Other agreed review policy'];
export const fields=[['organization','Organization name'],['representative','Authorized representative'],['contact','Contact details and website'],['profile','Organization type, size, locations, and operating hours'],['concerns','Top concerns and reason for requesting this review'],['changes','Relevant incidents or upcoming changes (omit unnecessary personal details)'],['plans','Current plans, dates reviewed, and situations covered'],['roles','Safety responsibilities and emergency decision-making authority'],['communications','Emergency communications and accountability procedures'],['training','Training, exercises, and follow-up process'],['access','General visitor/access responsibilities (no codes or credentials)']];
export const acknowledgmentVersion='safety-scope-2026-09-10';
export const scope='This remote advisory preparedness review includes review of information and documents you provide, a written findings report with prioritized recommendations and a 30/60/90-day roadmap, and one 30-minute virtual findings review. It cannot verify all physical conditions. Findings depend on the information supplied and conditions at the time of review. It is not a guarantee of safety or security, certification, legal or engineering advice, a fire-code/regulatory inspection, a tactical penetration test, or governmental or law-enforcement approval. Ready for Real Life Safety is an independent private service and is not affiliated with, sponsored by, or endorsed by Michael Terry’s current or former employers or any government agency. You are responsible for accurate information, redaction, implementation decisions, and obtaining specialized advice when needed.';
export const warning='Do not upload passwords, usernames, alarm codes, lock combinations, access credentials, private keys, or unnecessary sensitive medical, personnel, or personal records. Redact information not needed for the agreed review.';
const hash=t=>createHash('sha256').update(t).digest('hex');
const ident=v=>typeof v==='string'?v:v?.id;
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
const deny=()=>{throw new HttpError(403,'Access denied');};
export function validateUpload(input){
 if(!categories.includes(input.category)||input.redacted!==true)throw new HttpError(400,'Choose an allowed document category and confirm redaction');
 const name=String(input.name||'');
 if(!/^[^/\\\x00-\x1f]{1,160}\.(pdf|docx)$/i.test(name))throw new HttpError(400,'Only PDF and DOCX files are permitted');
 if(typeof input.base64!=='string'||input.base64.length>14000000||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.base64))throw new HttpError(400,'Invalid file');
 const bytes=Buffer.from(input.base64,'base64');
 if(!bytes.length||bytes.length>10*1024*1024)throw new HttpError(400,'Maximum file size is 10 MB');
 const ext=name.split('.').at(-1).toLowerCase();
 if(ext==='pdf'&&bytes.subarray(0,5).toString()!=='%PDF-')throw new HttpError(400,'Invalid PDF');
 if(ext==='docx'){
  try{const parts=unzipSync(bytes,{filter:f=>{
   if(/vbaProject|\.exe$|\.js$/i.test(f.name))throw new Error('Active content');
   if(['[Content_Types].xml','word/document.xml'].includes(f.name)){if(f.originalSize>2000000)throw new Error('Oversized content');return true;}return false;
  }});if(!parts['word/document.xml']||!parts['[Content_Types].xml'])throw new Error('Not DOCX');}
  catch{throw new HttpError(400,'Invalid or unsupported DOCX');}
 }
 return {name,bytes,mime:ext==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',ext};
}
export function createSafety({config,supabase,stripe,sendEmail,now=Date.now}){
 const db=new DatabaseSync(config.dbPath);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS engagements(id TEXT PRIMARY KEY,session_id TEXT UNIQUE NOT NULL,status TEXT NOT NULL DEFAULT 'Paid',intake TEXT,ack_version TEXT,ack_at INTEGER,created_at INTEGER NOT NULL,email_sent INTEGER,attempts INTEGER NOT NULL DEFAULT 0,next_attempt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS grants(hash TEXT PRIMARY KEY,engagement_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,engagement_id TEXT NOT NULL,name TEXT NOT NULL,path TEXT NOT NULL,mime TEXT NOT NULL,category TEXT NOT NULL,ready INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,engagement_id TEXT,actor TEXT NOT NULL,action TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS lead_confirmations(submission_id TEXT PRIMARY KEY,email TEXT NOT NULL,created_at INTEGER NOT NULL,sent_at INTEGER);`);
 async function staff(jwt){
  if(!jwt)throw new HttpError(401,'Sign in required');
  const {data,error}=await supabase.auth.getUser(jwt);
  if(error||!data?.user)throw new HttpError(401,'Sign in required');
  const member=await supabase.from('safety_staff').select('user_id,role').eq('user_id',data.user.id).eq('enabled',true).maybeSingle();
  if(member.error)throw new HttpError(503,'Safety authorization is not configured');
  if(!member.data||!['owner','instructor'].includes(member.data.role))deny();
  return data.user.id;
 }
 async function paid(sessionId){
  if(typeof sessionId!=='string'||!/^cs_(live_|test_)?[A-Za-z0-9]+$/.test(sessionId))return null;
  const s=await stripe.checkout.sessions.retrieve(sessionId);
  if(s.status!=='complete'||s.payment_status!=='paid'||s.mode!=='payment'||s.livemode!==config.live||ident(s.payment_link)!==config.paymentLinkId||s.currency!=='usd'||s.amount_total!==49900||s.amount_subtotal!==49900)return null;
  const items=await stripe.checkout.sessions.listLineItems(sessionId,{limit:2});
  if(items.has_more||items.data.length!==1||ident(items.data[0].price)!==config.priceId||items.data[0].quantity!==1)return null;
  const pi=await stripe.paymentIntents.retrieve(ident(s.payment_intent),{expand:['latest_charge']});
  const c=pi.latest_charge;
  if(pi.status!=='succeeded'||pi.amount_received!==49900||pi.currency!=='usd'||pi.livemode!==config.live||!c?.paid||c.refunded||c.amount_refunded>0||c.disputed)return null;
  const email=s.customer_details?.email;
  if(typeof email!=='string'||!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(email))return null;
  return {email};
 }
 async function webhook(body,signature){
  let event;try{event=stripe.webhooks.constructEvent(body,signature,config.webhookSecret,300);}catch{throw new HttpError(400,'Invalid signature');}
  if(event.livemode!==config.live||!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return {accepted:true};
  const sid=event.data?.object?.id;if(!await paid(sid))return {accepted:true};
  db.prepare('INSERT OR IGNORE INTO engagements(id,session_id,created_at,next_attempt) VALUES(?,?,?,?)').run(randomUUID(),sid,now(),now());return {accepted:true};
 }
 let running=false;
 async function queue(){
  if(running)return;running=true;
  try{db.prepare('DELETE FROM grants WHERE expires_at<=?').run(now());
   for(const e of db.prepare('SELECT * FROM engagements WHERE email_sent IS NULL AND next_attempt<=? LIMIT 10').all(now())){
    let token;
    try{const p=await paid(e.session_id);if(!p){db.prepare('UPDATE engagements SET next_attempt=? WHERE id=?').run(now()+3600000,e.id);continue;}
     token=randomBytes(32).toString('base64url');db.prepare('INSERT INTO grants VALUES(?,?,?)').run(hash(token),e.id,now()+7*86400000);
     await sendEmail({to:{address:p.email},subject:'Ready for Real Life Safety — your private intake',text:`Your payment has been verified. Review the scope acknowledgment and complete your private intake here:\n${config.siteOrigin}/safety-onboarding.html#access=${token}\n\nThis private link expires in seven days. ${warning}\nFor help or an expired link, contact the seller using your payment receipt.`});
     db.prepare("UPDATE engagements SET email_sent=?,status=CASE WHEN status='Paid' THEN 'Intake pending' ELSE status END WHERE id=?").run(now(),e.id);
    }catch{if(token)db.prepare('DELETE FROM grants WHERE hash=?').run(hash(token));db.prepare('UPDATE engagements SET attempts=attempts+1,next_attempt=? WHERE id=?').run(now()+Math.min(3600000,30000*2**Math.min(e.attempts,7)),e.id);console.warn('Safety intake invitation queued for retry');}
   }
  }finally{running=false;}
 }

 async function formSubmission(submission){
  if(!submission||submission.form_name!=='safety-review-request')return {accepted:true};
  const id=String(submission.id||'').trim();
  const data=submission.data||{};
  const email=String(data.email||submission.email||'').trim();
  const name=String(data.name||submission.name||'').trim().slice(0,120);
  if(!id||!email||!/^[^\\s<>@,;]+@[^\\s<>@,;]+\\.[^\\s<>@,;]+$/.test(email))throw new HttpError(400,'Invalid form submission');
  const prior=db.prepare('SELECT sent_at FROM lead_confirmations WHERE submission_id=?').get(id);
  if(prior?.sent_at)return {accepted:true,duplicate:true};
  db.prepare('INSERT OR IGNORE INTO lead_confirmations(submission_id,email,created_at) VALUES(?,?,?)').run(id,email,now());
  try{
   const greeting=name?name+',':'Hello,';
   await sendEmail({
    to:{address:email},
    subject:'Ready for Real Life Safety — Request Received',
    text:greeting+'\\n\\nThank you for requesting a Ready for Real Life Safety review. Your request has been received.\\n\\nI will personally review the information you submitted and follow up with you regarding next steps. If the review appears to be a good fit for your organization, I will send you a secure link to complete the $499 Founding Client payment and begin the review process.\\n\\nNo payment has been collected at this point.\\n\\nPlease avoid sending sensitive operational information by email.\\n\\nMike\\nReady for Real Life Safety'
   });
   db.prepare('UPDATE lead_confirmations SET sent_at=? WHERE submission_id=?').run(now(),id);
   return {accepted:true,confirmed:true};
  }catch{
   db.prepare('DELETE FROM lead_confirmations WHERE submission_id=? AND sent_at IS NULL').run(id);
   throw new HttpError(503,'Confirmation email temporarily unavailable');
  }
 }

 async function client(token){
  if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new HttpError(401,'Use the private link emailed after payment');
  const e=db.prepare('SELECT e.* FROM engagements e JOIN grants g ON g.engagement_id=e.id WHERE g.hash=? AND g.expires_at>?').get(hash(token),now());
  if(!e)throw new HttpError(401,'Invalid or expired intake link');
  if(!await paid(e.session_id))deny();return e;
 }
 async function privateFile(bucket,path,name,mime){const {data,error}=await supabase.storage.from(bucket).download(path);if(error||!data)throw new HttpError(404,'Private file is not available');return {bytes:Buffer.from(await data.arrayBuffer()),name,mime};}
 async function route(method,path,token,body={}){
  if(path.startsWith('/staff/')){
   const actor=await staff(token);
   if(method==='GET'&&path==='/staff/session')return {authorized:true};
   if(method==='GET'&&path==='/staff/library')return {items:library.map(([id,title])=>({id,title}))};
   if(method==='GET'&&path.startsWith('/staff/library/')){const item=library.find(x=>x[0]===path.split('/').at(-1));if(!item)throw new HttpError(404,'Not found');return privateFile('safety-operations',item[0]==='complete'?'complete.zip':item[0]+'.docx',item[2],item[0]==='complete'?'application/zip':'application/vnd.openxmlformats-officedocument.wordprocessingml.document');}
   if(method==='GET'&&path==='/staff/engagements')return {engagements:db.prepare('SELECT id,status,created_at,intake FROM engagements ORDER BY created_at DESC').all().map(e=>({...e,intake:e.intake?JSON.parse(e.intake):null})),statuses};
   const match=path.match(/^\/staff\/engagements\/([0-9a-f-]+)$/);
   if(match){const e=db.prepare('SELECT * FROM engagements WHERE id=?').get(match[1]);if(!e)throw new HttpError(404,'Not found');
    if(method==='GET')return {id:e.id,status:e.status,intake:e.intake?JSON.parse(e.intake):null,ack_version:e.ack_version,ack_at:e.ack_at,uploads:db.prepare('SELECT id,name,category FROM uploads WHERE engagement_id=? AND ready=1').all(e.id)};
    if(method==='PATCH'){if(!statuses.includes(body.status))throw new HttpError(400,'Invalid status');db.prepare('UPDATE engagements SET status=? WHERE id=?').run(body.status,e.id);db.prepare('INSERT INTO audit(engagement_id,actor,action,created_at) VALUES(?,?,?,?)').run(e.id,actor,'Status: '+body.status,now());return {saved:true};}
   }
   if(method==='GET'&&path.startsWith('/staff/uploads/')){const f=db.prepare('SELECT * FROM uploads WHERE id=? AND ready=1').get(path.split('/').at(-1));if(!f)throw new HttpError(404,'Not found');return privateFile('safety-client-uploads',f.path,f.name,f.mime);}
   if(method==='POST'&&path==='/staff/reinvite'){const e=db.prepare('SELECT * FROM engagements WHERE id=?').get(body.id);if(!e||!await paid(e.session_id))deny();db.prepare('UPDATE engagements SET email_sent=NULL,next_attempt=? WHERE id=?').run(now(),e.id);return {queued:true};}
  }
  if(path.startsWith('/client')){
   const e=await client(token);
   if(method==='GET'&&path==='/client')return {id:e.id,status:e.status,scope,warning,fields,categories,acknowledgmentVersion,intake:e.intake?JSON.parse(e.intake):null,uploads:db.prepare('SELECT name,category FROM uploads WHERE engagement_id=? AND ready=1').all(e.id)};
   if(method==='POST'&&path==='/client/intake'){
    if(body.acknowledged!==true||body.acknowledgmentVersion!==acknowledgmentVersion)throw new HttpError(400,'Scope acknowledgment required');
    const intake={};for(const [key] of fields){if(typeof body[key]!=='string'||body[key].trim().length>5000)throw new HttpError(400,'Invalid intake response');intake[key]=body[key].trim();}
    if(!intake.organization||!intake.representative||!intake.contact)throw new HttpError(400,'Organization, representative and contact are required');
    if(!['Paid','Intake pending','Intake received'].includes(e.status))throw new HttpError(409,'Review has started; contact your reviewer for corrections');
    db.prepare("UPDATE engagements SET intake=?,ack_version=?,ack_at=?,status='Intake received' WHERE id=?").run(JSON.stringify(intake),acknowledgmentVersion,now(),e.id);
    return {received:true,message:'Your intake has been received privately. Save this confirmation and use this link to add permitted documents. Mike will review your materials before preparing findings.'};
   }
   if(method==='POST'&&path==='/client/uploads'){
    if(!e.ack_at)throw new HttpError(409,'Submit the scope acknowledgment and intake first');
    if(!['Intake received'].includes(e.status))throw new HttpError(409,'Contact your reviewer to add files at this stage');
    const f=validateUpload(body);if(db.prepare('SELECT COUNT(*) n FROM uploads WHERE engagement_id=?').get(e.id).n>=20)throw new HttpError(400,'Maximum 20 documents per engagement');
    const fid=randomUUID(),storagePath=e.id+'/'+fid+'.'+f.ext;
    db.prepare('INSERT INTO uploads(id,engagement_id,name,path,mime,category) VALUES(?,?,?,?,?,?)').run(fid,e.id,f.name,storagePath,f.mime,body.category);
    const {error}=await supabase.storage.from('safety-client-uploads').upload(storagePath,f.bytes,{contentType:f.mime,upsert:false});
    if(error){db.prepare('DELETE FROM uploads WHERE id=?').run(fid);throw new HttpError(503,'Upload failed; please retry');}
    db.prepare('UPDATE uploads SET ready=1 WHERE id=?').run(fid);return {received:true};
   }
  }
  throw new HttpError(404,'Not found');
 }
 return {route,webhook,formSubmission,queue,db,staff,client,paid};
}
