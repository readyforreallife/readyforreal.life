import test from 'node:test';
import assert from 'node:assert/strict';
import {startHttpServer} from '../server.mjs';
const close=server=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
const unreachable=new Proxy({}, {get(){throw new Error('Health must not call a provider, queue, or authenticated route');}});
test('startup binds all IPv4 interfaces using PORT and serves health before provider work',async()=>{
 const previousPort=process.env.PORT,previousHost=process.env.HOST;
 process.env.PORT='0';process.env.HOST='127.0.0.1';
 let server;const logs=[];
 try{
  server=await startHttpServer(unreachable,'https://readyforreal.life',{log:line=>logs.push(line)});
  assert.equal(server.listening,true);const address=server.address();
  assert.equal(address.address,'0.0.0.0');assert(address.port>0);
  assert.deepEqual(logs,['Safety HTTP server listening on 0.0.0.0:'+address.port]);
  const response=await fetch('http://127.0.0.1:'+address.port+'/health',{signal:AbortSignal.timeout(1000)});
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/json/);
  assert.deepEqual(await response.json(),{up:true});
 }finally{
  if(server)await close(server);
  if(previousPort===undefined)delete process.env.PORT;else process.env.PORT=previousPort;
  if(previousHost===undefined)delete process.env.HOST;else process.env.HOST=previousHost;
 }
});
test('occupied PORT rejects startup without a misleading listening log',async()=>{
 const server=await startHttpServer(unreachable,'https://readyforreal.life',{port:0,log:()=>{}});const logs=[];
 try{await assert.rejects(startHttpServer(unreachable,'https://readyforreal.life',{port:server.address().port,log:line=>logs.push(line)}),error=>error.code==='EADDRINUSE');assert.deepEqual(logs,[]);}finally{await close(server);}
});
test('invalid PORT fails before attempting to listen',async()=>{
 for(const port of ['', 'bad', '-1', '65536', '80.5'])await assert.rejects(startHttpServer(unreachable,'https://readyforreal.life',{port}),/Invalid HTTP listening port/);
});
