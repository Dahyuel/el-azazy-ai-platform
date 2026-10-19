'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {writeEvidence:writeSqlite}=require('./sqlite-writer.cjs');
const root=__dirname;
const queue=path.join(root,'pending');
function writeEvidence(record,filename=path.join(root,'data/evidence.sqlite')){
  try{return writeSqlite(record,filename);}catch(error){
    fs.mkdirSync(queue,{recursive:true,mode:0o700});
    const body=JSON.stringify(record);
    if(Buffer.byteLength(body)>256*1024)throw Error('record_too_large');
    if(fs.readdirSync(queue).filter(x=>x.endsWith('.json')).length>=1000)throw Error('pending_capacity_reached');
    const id=crypto.createHash('sha256').update(record.idempotency_key).digest('hex');
    const destination=path.join(queue,id+'.json');
    let fd;
    try{fd=fs.openSync(destination,'wx',0o600);}catch(e){if(e.code==='EEXIST')return {queued:true};throw e;}
    try{fs.writeFileSync(fd,body);fs.fsyncSync(fd);}catch(e){fs.closeSync(fd);fs.unlinkSync(destination);throw e;}
    fs.closeSync(fd);
    return {queued:true};
  }
}
function maintain(){
  let replayed=0,failed=0;
  fs.mkdirSync(queue,{recursive:true,mode:0o700});
  for(const name of fs.readdirSync(queue).filter(x=>/^[a-f0-9]{64}\.json$/.test(x)).slice(0,100)){
    const file=path.join(queue,name);
    try{const record=JSON.parse(fs.readFileSync(file,'utf8'));writeSqlite(record,path.join(root,'data/evidence.sqlite'));fs.unlinkSync(file);replayed++;}catch(_){failed++;}
  }
  const {DatabaseSync}=require('node:sqlite');
  const db=new DatabaseSync(path.join(root,'data/evidence.sqlite'));
  let expired=0;
  try{
    db.exec('PRAGMA busy_timeout=200;');
    const cutoff=new Date(Date.now()-30*86400*1000).toISOString();
    expired=Number(db.prepare('DELETE FROM media_evidence WHERE observed_at < ?').run(cutoff).changes);
  }finally{db.close();}
  return {replayed,failed,expired,pending:fs.readdirSync(queue).filter(x=>x.endsWith('.json')).length};
}
module.exports={writeEvidence,maintain};
if(require.main===module){try{console.log(JSON.stringify(maintain()));}catch(_){console.error('audit_maintenance_failed');process.exitCode=1;}}
