const config=window.RFRL_SAFETY;
const auth=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey);
const page=document.body.dataset.safetyPage,message=document.getElementById('message');
let token='',clientData;
const showError=e=>{message.textContent=e.message;message.className='error';};
const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
function apiOrigin(){if(!config.apiOrigin)throw new Error('Private Safety service is awaiting deployment. Documents are not available publicly.');const u=new URL(config.apiOrigin);if(u.protocol!=='https:')throw new Error('Secure service configuration required');return u.origin;}
async function request(path,{method='GET',body,download=false}={}){
 const r=await fetch(apiOrigin()+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 if(!r.ok){const data=await r.json();if(r.status===401&&page==='safety-operations')location.replace('safety-login.html');throw new Error(data.error||'Request failed');}
 return download?r.blob():r.json();
}
async function download(path,name){const blob=await request(path,{download:true});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function action(text,fn){const b=node('button',text);b.type='button';b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){showError(e);}finally{b.disabled=false;}};return b;}
async function operations(){
 await request('/staff/session');document.getElementById('private-content').hidden=false;message.textContent='Authorized Safety workspace';
 const lib=await request('/staff/library');const target=document.getElementById('library');
 lib.items.forEach(item=>{const row=node('div','');row.className='library-item';row.append(node('strong',item.title),action(item.id==='complete'?'Download complete ZIP':'Open / Download',()=>download('/staff/library/'+item.id,item.id==='complete'?'Safety-Delivery-System.zip':item.title+'.docx')));target.append(row);});
 const data=await request('/staff/engagements');const list=document.getElementById('engagements');
 if(!data.engagements.length)list.textContent='No verified paid engagements yet.';
 for(const e of data.engagements){const row=node('div','');row.className='library-item';row.append(node('span',(e.intake?.organization||'New paid engagement')+' — '+e.status),action('View engagement',async()=>{
  const detail=await request('/staff/engagements/'+e.id),box=document.getElementById('engagement-detail');box.replaceChildren();
  box.append(node('h3',detail.intake?.organization||'Intake pending'));
  if(detail.intake)for(const [key,value] of Object.entries(detail.intake)){box.append(node('strong',key),node('pre',value));}
  box.append(node('p',detail.ack_at?'Scope acknowledged: '+new Date(detail.ack_at).toLocaleString()+' ('+detail.ack_version+')':'Scope not yet acknowledged'));
  const label=node('label','Engagement status'),select=document.createElement('select');for(const status of data.statuses){const o=node('option',status);o.value=status;select.append(o);}select.value=detail.status;label.append(select);box.append(label,action('Save status',async()=>{await request('/staff/engagements/'+e.id,{method:'PATCH',body:{status:select.value}});message.textContent='Status saved. No report was sent.';}),action('Resend private intake invitation',async()=>{await request('/staff/reinvite',{method:'POST',body:{id:e.id}});message.textContent='Invitation queued to the verified checkout email.';}));
  for(const file of detail.uploads)box.append(action('Download: '+file.name,()=>download('/staff/uploads/'+file.id,file.name)));
 }));list.append(row);}
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
auth.auth.onAuthStateChange((event,session)=>{if(page==='safety-operations'){if(event==='SIGNED_OUT'){document.getElementById('private-content').hidden=true;location.replace('safety-login.html');}else if(session)token=session.access_token;}});
