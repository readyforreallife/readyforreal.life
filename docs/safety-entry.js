// Teacher Mode visibility is not authorization. Only show this shortcut after a server staff check.
(async()=>{
 const c=window.RFRL_SAFETY;if(!c?.apiOrigin)return;
 let sdk=window.supabase;if(!sdk){sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');}
 const auth=sdk.createClient(c.supabaseUrl,c.supabasePublishableKey);
 const refresh=async()=>{
  document.getElementById('private-safety-entry')?.remove();
  const {data}=await auth.auth.getSession();if(!data.session)return;
  const origin=new URL(c.apiOrigin);if(origin.protocol!=='https:')return;
  const r=await fetch(origin.origin+'/staff/session',{headers:{Authorization:'Bearer '+data.session.access_token},cache:'no-store'});if(!r.ok)return;
  const link=document.createElement('a');link.id='private-safety-entry';link.href='safety-operations.html';link.className='util-btn';link.textContent='Safety Operations — Client Delivery System';
  const parent=document.querySelector('.teacher-shortcuts')||document.getElementById('studentPortal');parent?.append(link);
 };
 await refresh();auth.auth.onAuthStateChange(()=>setTimeout(()=>refresh().catch(()=>{}),0));
})().catch(()=>{});
