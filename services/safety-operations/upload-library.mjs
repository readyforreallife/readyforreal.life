import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {library} from './core.mjs';
const folder=process.argv[2];if(!folder)throw new Error('Provide private extracted document directory');
const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const {data,error}=await sb.storage.getBucket('safety-operations');if(error||data.public)throw new Error('Private bucket required');
for(const [id,,name] of library){const bytes=readFileSync(resolve(folder,name));const result=await sb.storage.from('safety-operations').upload(id==='complete'?'complete.zip':id+'.docx',bytes,{upsert:true,contentType:id==='complete'?'application/zip':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});if(result.error)throw new Error('Private library upload failed');}
console.info('Private library uploaded. No public URLs created.');
