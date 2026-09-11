import nodemailer from 'nodemailer';

// Credentials stay in the hosting environment. Never include provider responses in errors.
export async function createMailer(env=process.env, request=fetch){
 const need=k=>{if(!env[k])throw Error('Missing '+k);return env[k];};
 const from=need('MAIL_FROM');
 if((env.MAIL_PROVIDER||'smtp')==='smtp'){
  const port=Number(need('SMTP_PORT'));if(![465,587].includes(port))throw Error('SMTP requires TLS');
  const mail=nodemailer.createTransport({host:need('SMTP_HOST'),port,secure:port===465,requireTLS:true,auth:{user:need('SMTP_USER'),pass:need('SMTP_PASS')},connectionTimeout:15000,socketTimeout:30000});
  await mail.verify();
  return async message=>{const r=await mail.sendMail({...message,from});if(!r.accepted?.length||r.rejected?.length)throw Error('Email rejected');};
 }
 if(env.MAIL_PROVIDER!=='gmail')throw Error('Invalid mail provider');
 const client=need('GMAIL_CLIENT_ID'),secret=need('GMAIL_CLIENT_SECRET'),refresh=need('GMAIL_REFRESH_TOKEN');
 let token,expires=0;
 async function access(){
  if(token&&Date.now()<expires)return token;
  let response,data;
  try{
   response=await request('https://oauth2.googleapis.com/token',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),body:new URLSearchParams({client_id:client,client_secret:secret,refresh_token:refresh,grant_type:'refresh_token'})});
   data=await response.json();
  }catch{throw Error('Gmail authorization unavailable');}
  if(!response.ok||!data.access_token||!(Number(data.expires_in)>60))throw Error('Gmail authorization unavailable');
  token=data.access_token;expires=Date.now()+(Number(data.expires_in)-60)*1000;return token;
 }
 await access(); // Validates refresh credentials without sending a message.
 const mime=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'windows'});
 return async ({to,subject,text,html})=>{
  const message=await mime.sendMail({from,to,subject,text,html,disableFileAccess:true,disableUrlAccess:true});
  let response,data;
  try{
   response=await request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{Authorization:'Bearer '+await access(),'Content-Type':'application/json'},body:JSON.stringify({raw:message.message.toString('base64url')})});
   data=await response.json();
  }catch{throw Error('Gmail delivery unavailable');}
  if(!response.ok||!data.id){if(response.status===401){token=null;expires=0;}throw Error('Gmail delivery unavailable');}
 };
}
