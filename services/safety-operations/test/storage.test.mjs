import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('actual storage migration denies Safety access despite permissive policies', async () => {
 const db = new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create schema storage;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id text primary key,bucket_id text);
 alter table storage.objects enable row level security;
 grant usage on schema storage,public to anon,authenticated,service_role;
 grant all on storage.objects to anon,authenticated,service_role;
 create policy legacy_broad on storage.objects for all to anon,authenticated using(true) with check(true);
 insert into auth.users values('00000000-0000-0000-0000-000000000001');
 insert into storage.objects values('ops','safety-operations'),('client','safety-client-uploads'),('existing','portal-files');`);
 await db.exec(await readFile(new URL('../storage.sql',import.meta.url),'utf8'));
 await db.exec(`insert into public.safety_staff(user_id,role) values('00000000-0000-0000-0000-000000000001','owner');
 grant all on public.safety_staff to anon,authenticated;
 create policy legacy_staff on public.safety_staff for all to anon,authenticated using(true) with check(true);`);
 for (const role of ['anon','authenticated']) {
 await db.exec(`set role ${role}`);
 assert.deepEqual((await db.query('select id from storage.objects')).rows,[{id:'existing'}]);
 assert.equal((await db.query('select * from public.safety_staff')).rows.length,0);
 await assert.rejects(db.exec("insert into storage.objects values('attack','safety-client-uploads')"),/row-level security/);
 await assert.rejects(db.exec("update storage.objects set bucket_id='safety-operations' where id='existing'"),/row-level security/);
 assert.equal((await db.query("delete from storage.objects where id='ops' returning id")).rows.length,0);
 await db.exec('reset role');
 }
 await db.exec('set role service_role');
 assert.equal((await db.query('select * from storage.objects')).rows.length,3);
 assert.equal((await db.query('select * from public.safety_staff')).rows.length,1);
 await db.exec('reset role');
 assert.ok((await db.query('select public from storage.buckets')).rows.every(x=>x.public===false));
 } finally { await db.close(); }
});
