// Read-only deployed acceptance probes. Never prints response bodies or tokens.
const env=process.env,results=[];
const record=(id,status,detail)=>results.push({id,status,detail});
const origin=env.SAFETY_ACCEPTANCE_API_ORIGIN;
if(origin&&new URL(origin).protocol!=='https:')throw new Error('Acceptance API origin must use HTTPS');
async function request(path,jwt){return fetch(new URL(path,origin),{headers:jwt?{Authorization:'Bearer '+jwt}:{},signal:AbortSignal.timeout(15000),cache:'no-store'});}
async function probe(id,need,fn){if(!origin||need.some(k=>!env[k])){record(id,'BLOCKED','Deployed API origin or private test credentials not supplied');return;}try{const ok=await fn();record(id,ok?'PASS':'FAIL',ok?'Expected authorization behavior observed':'Unexpected response; do not release');}catch{record(id,'FAIL','Probe could not complete; no response content logged');}}
await probe('1 Logged-out staff access',[],async()=>(await request('/staff/library')).status===401);
await probe('2 Ordinary authenticated account denied',['SAFETY_ACCEPTANCE_STUDENT_JWT'],async()=>(await request('/staff/library',env.SAFETY_ACCEPTANCE_STUDENT_JWT)).status===403);
await probe('3 Authorized owner/instructor library',['SAFETY_ACCEPTANCE_OWNER_JWT'],async()=>{const r=await request('/staff/library',env.SAFETY_ACCEPTANCE_OWNER_JWT);if(r.status!==200)return false;const b=await r.json();return b.items?.length===10;});
await probe('4 Direct library download without auth',[],async()=>(await request('/staff/library/01')).status===401);
record('5 No secrets/private documents committed','BLOCKED','Run the local source/private-asset scan; network probe cannot inspect repository contents');
await probe('6 Browser flag is not payment proof',[],async()=>(await request('/client?paid=true&session_id=cs_test_fake')).status===401);
if(env.SAFETY_ACCEPTANCE_SUPABASE_ORIGIN){
 try{let denied=true;for(const key of ['01.docx','complete.zip']){const r=await fetch(new URL('/storage/v1/object/public/safety-operations/'+key,env.SAFETY_ACCEPTANCE_SUPABASE_ORIGIN),{signal:AbortSignal.timeout(15000)});denied&&=[400,401,403,404].includes(r.status);}record('4b Anonymous storage URLs',denied?'PASS':'FAIL','Only meaningful after preflight confirms these exact assets exist privately');}catch{record('4b Anonymous storage URLs','FAIL','Supabase endpoint could not be reached');}
}else record('4b Anonymous storage URLs','BLOCKED','Supabase origin not supplied');
if(env.SAFETY_ACCEPTANCE_UPLOAD_OBJECT_PATH&&env.SAFETY_ACCEPTANCE_SUPABASE_ORIGIN){
 try{const path='/storage/v1/object/public/safety-client-uploads/'+env.SAFETY_ACCEPTANCE_UPLOAD_OBJECT_PATH.split('/').map(encodeURIComponent).join('/');const r=await fetch(new URL(path,env.SAFETY_ACCEPTANCE_SUPABASE_ORIGIN),{signal:AbortSignal.timeout(15000)});record('7 Existing client upload is not public',[400,401,403,404].includes(r.status)?'PASS':'FAIL','Use a known existing sandbox upload; nonexistent paths do not prove privacy');}catch{record('7 Existing client upload is not public','FAIL','Storage endpoint unreachable');}
}else record('7 Existing client upload is not public','BLOCKED','Known existing sandbox upload object path and Supabase origin required');
record('6b Full verified purchase-to-intake cycle','BLOCKED','Complete a sandbox payment, delivered invitation, acknowledgment, intake and private upload; verify a second buyer cannot access that engagement');
record('8 Existing public pages/navigation','BLOCKED','Run browser/link regression checks separately; this script does not click public pages');
console.log(JSON.stringify({releaseReady:false,results},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:2;
