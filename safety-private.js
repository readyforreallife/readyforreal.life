const config=window.RFRL_SAFETY;
const auth=document.body.dataset.safetyPage==='safety-onboarding'?null:window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey);
const page=document.body.dataset.safetyPage,message=document.getElementById('message');
let token='',clientData;
const showError=e=>{message.textContent=e.message;message.className='error';};
const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
function apiOrigin(){if(!config.apiOrigin)throw new Error('Private Safety service is awaiting deployment. Documents are not available publicly.');const u=new URL(config.apiOrigin);if(u.protocol!=='https:')throw new Error('Secure service configuration required');return u.origin;}
async function request(path,{method='GET',body,download=false}={}){
 const r=await fetch(apiOrigin()+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 if(!r.ok){if((r.status===401||r.status===403)&&page==='safety-operations'){const content=document.getElementById('private-content');content.hidden=true;content.replaceChildren();}const data=await r.json();if(r.status===401&&page==='safety-operations')location.replace('safety-login.html');throw new Error(data.error||'Request failed');}
 return download?r.blob():r.json();
}
async function download(path,name){const blob=await request(path,{download:true});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function action(text,fn){const b=node('button',text);b.type='button';b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){showError(e);}finally{b.disabled=false;}};return b;}
async function operations(){
 const access=await request('/staff/session');if(access.role!=='owner')throw new Error('Owner-only Safety access is required.');
 document.getElementById('private-content').hidden=false;message.textContent='Owner-only Safety Review Dashboard';
 const lib=await request('/staff/library');const target=document.getElementById('library');
 lib.items.forEach(item=>{const row=node('div','');row.className='library-item';row.append(node('strong',item.title),action('Download',()=>download('/staff/library/'+item.id,item.id==='complete'?'Safety-Delivery-System.zip':item.title+'.docx')));target.append(row);});
 const list=document.getElementById('engagements'),box=document.getElementById('engagement-detail');let stages=[];let previewUrls=[];
 const clearPreviews=()=>{previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];};
 window.addEventListener('pagehide',clearPreviews);
 const detail=async id=>{
  const d=await request('/staff/engagements/'+id);clearPreviews();box.replaceChildren();box.className='card';
  box.append(node('h3',d.intake?.organization||'Awaiting private intake'),node('p',(d.paymentMode||'')+' payment: '+(d.paymentStatus||'Unavailable')),node('p','Review status: '+d.status));
  box.append(node('p',d.ack_at?'Scope acknowledged: '+new Date(d.ack_at).toLocaleString()+' ('+d.ack_version+')':'Scope not yet acknowledged'));
  box.append(node('h4','Submitted intake'));
  if(d.intake)for(const [key,value] of Object.entries(d.intake))box.append(node('strong',key),node('pre',value||'Not provided'));else box.append(node('p','Intake not submitted yet.'));
  box.append(node('h4','Private client documents'));
  if(!d.uploads.length)box.append(node('p','No documents uploaded.'));
  for(const file of d.uploads){const row=node('div','');row.className='library-item';row.append(node('span',file.name+' — '+file.category),action('Download privately',()=>download('/staff/uploads/'+file.id,file.name)));
   if(/\.pdf$/i.test(file.name))row.append(action('Prepare private PDF view',async()=>{const blob=await request('/staff/uploads/'+file.id,{download:true});const url=URL.createObjectURL(blob);previewUrls.push(url);const a=node('a','Open PDF');a.href=url;a.target='_blank';a.rel='noopener noreferrer';row.append(a);}));box.append(row);
  }
  const label=node('label','Review stage'),select=document.createElement('select');for(const status of stages){const o=node('option',status);o.value=status;select.append(o);}select.value=d.status;label.append(select);
  box.append(label,action('Save review stage',async()=>{await request('/staff/engagements/'+id,{method:'PATCH',body:{status:select.value}});await refresh();await detail(id);message.textContent='Review stage saved.';}));
  box.append(node('h4','Review history'));for(const item of d.history||[])box.append(node('p',new Date(item.created_at).toLocaleString()+' — '+item.action));
 };
 const refresh=async()=>{const data=await request('/staff/engagements');stages=data.statuses;list.replaceChildren();if(!data.engagements.length)list.textContent='No verified paid engagements yet.';
  for(const e of data.engagements){const row=node('div','');row.className='library-item';const summary=node('div','');summary.append(node('strong',e.intake?.organization||'Awaiting intake'),node('p',e.status+' · '+(e.intake?'Intake received':'Intake pending')+' · '+(e.document_count||0)+' documents'));row.append(summary,action('Open review',()=>detail(e.id)));list.append(row);}
 };
 document.getElementById('refresh-engagements').onclick=async()=>{try{await refresh();}catch(e){showError(e);}};await refresh();
}
async function onboarding(){
 const fragment=new URLSearchParams(location.hash.slice(1));const supplied=fragment.get('access');
 if(supplied){sessionStorage.setItem('rfrl-safety-intake',supplied);history.replaceState(null,'',location.pathname);}
 token=sessionStorage.getItem('rfrl-safety-intake')||'';
 clientData=await request('/client');document.getElementById('private-content').hidden=false;message.textContent='Payment verified. Your intake is private.';
 document.getElementById('scope').textContent=clientData.scope;document.getElementById('warning').textContent=clientData.warning;document.getElementById('engagement-status').textContent=clientData.status;
 const form=document.getElementById('intake-form');
 for(const [key,title] of clientData.fields){const label=node('label',title),input=document.createElement(['organization','representative','contact'].includes(key)?'input':'textarea');input.name=key;input.maxLength=5000;input.required=['organization','representative','contact'].includes(key);input.value=clientData.intake?.[key]||'';label.append(input);document.getElementById('fields').append(label);}
 form.onsubmit=async event=>{event.preventDefault();try{const body=Object.fromEntries(new FormData(form));body.acknowledged=form.elements.acknowledged.checked;body.acknowledgmentVersion=clientData.acknowledgmentVersion;const r=await request('/client/intake',{method:'POST',body});document.getElementById('confirmation').textContent=r.message;message.textContent='Intake received';}catch(e){showError(e);}};
 const upload=document.getElementById('upload-form');for(const category of clientData.categories){const o=node('option',category);upload.elements.category.append(o);}
 const uploads=document.getElementById('uploads');clientData.uploads.forEach(f=>uploads.append(node('li',f.name+' — '+f.category)));
 upload.onsubmit=async event=>{event.preventDefault();const b=upload.querySelector('button');b.disabled=true;try{const f=upload.elements.file.files[0];if(!f||f.size>10*1024*1024)throw new Error('Choose a PDF or DOCX no larger than 10 MB');const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(f);});await request('/client/uploads',{method:'POST',body:{name:f.name,base64,category:upload.elements.category.value,redacted:upload.elements.redacted.checked}});uploads.append(node('li',f.name));message.textContent='Document received privately.';upload.reset();}catch(e){showError(e);}finally{b.disabled=false;}};
}
try{
 if(page==='safety-onboarding')await onboarding();
 else if(page==='safety-login'){
  const {data}=await auth.auth.getSession();if(data.session)location.replace('safety-operations.html');else message.textContent='Sign in with your existing Supabase portal account.';
  document.getElementById('login-form').onsubmit=async e=>{e.preventDefault();try{const f=e.target;const {error}=await auth.auth.signInWithPassword({email:f.elements.email.value,password:f.elements.password.value});if(error)throw error;location.replace('safety-operations.html');}catch(error){showError(error);}};
 }else{const {data}=await auth.auth.getSession();if(!data.session)location.replace('safety-login.html');else{token=data.session.access_token;await operations();}}
}catch(e){showError(e);}
auth?.auth.onAuthStateChange((event,session)=>{if(page==='safety-operations'){if(event==='SIGNED_OUT'){document.getElementById('private-content').hidden=true;location.replace('safety-login.html');}else if(session)token=session.access_token;}});
