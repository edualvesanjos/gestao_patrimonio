import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';
const K = CONFIG.STORAGE_KEYS;
const errorText = async response => { const d=await response.json().catch(()=>({})); return d.message || d.details || d.error || `HTTP ${response.status}`; };
const headers = () => {
 const s=AuthManager.getCurrentUser(), c=CONFIG.getSuperDBConfig();
 if (!navigator.onLine || !s?.token || s.mode!=='online') throw Error('É necessário estar conectado e autenticado no SuperDB.');
 return {'apikey':c.anonKey,'Authorization':`Bearer ${s.token}`,'X-SuperDB-Project':c.projectSlug,'Accept-Profile':c.projectSchema,'Content-Profile':c.projectSchema};
};
const endpoint = () => `${CONFIG.getSuperDBConfig().apiUrl}/rest/v1/patrimonios`;
const readLegacy = () => { try{return JSON.parse(localStorage.getItem(K.LOCAL_DATA));}catch{return null;} };
const clean = x => { const {isSynced,_base,...record}=x;return record; };
const fields = x => Object.fromEntries(['id','usuario_id','item','categoria','quantidade','fabricante','modelo','num_patrimonio','baixado','transferido','observacoes'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]]));
export const DataManager = {
 async testarPermissaoConsulta(){
  const cfg=CONFIG.getSuperDBConfig();
  const r=await fetch(`${cfg.apiUrl}/rest/v1/rpc/usuario_tem_permissao`,{
   method:'POST',
   headers:{...headers(),'Content-Type':'application/json'},
   body:JSON.stringify({p_codigo:'patrimonios.consultar'}),
   cache:'no-store'
  });
  if(!r.ok)throw Error(`RPC HTTP ${r.status}: ${await errorText(r)}`);
  const resultado=await r.json().catch(()=>{throw Error('A API não retornou JSON válido.');});
  if(typeof resultado!=='boolean')throw Error('A RPC retornou um formato inesperado (esperado: boolean).');
  return resultado;
 },
 async getAllItems(){
  const r=await fetch(`${endpoint()}?select=*`,{headers:headers(),cache:'no-store'});
  if(!r.ok)throw Error(`Consulta SuperDB: ${await errorText(r)}`);
  return (await r.json()).map(x=>({...x,isSynced:true}));
 },
 async saveItem(item){
  const s=AuthManager.getCurrentUser();headers();
  const editing=!!item.id;
  const record=fields({...item,id:item.id || `pat_${crypto.randomUUID()}`,usuario_id:s.user.id,quantidade:Number.parseInt(item.quantidade,10)||1});
  if(!record.item?.trim()||!record.categoria?.trim()||!record.num_patrimonio?.trim())throw Error('Preencha item, categoria e número de patrimônio.');
  const url=editing?`${endpoint()}?id=eq.${encodeURIComponent(record.id)}`:endpoint();
  const r=await fetch(url,{method:editing?'PATCH':'POST',headers:{...headers(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(record)});
  if(!r.ok)throw Error(`Gravação não confirmada (HTTP ${r.status}): ${await errorText(r)}`);
  const result=await r.json().catch(()=>[]);
  if(!Array.isArray(result)||result.length!==1)throw Error('O servidor não confirmou exatamente um registro. Consulte o banco antes de tentar novamente.');
  return {pending:false};
 },
 async toggleBaixa(id){
  const items=await this.getAllItems(), item=items.find(x=>x.id===id);
  if(!item)throw Error('Patrimônio não encontrado ou sem permissão de consulta.');
  return this.saveItem({...item,baixado:!item.baixado});
 },
 hasLegacyData(){return !!readLegacy();},
 async legacyPendingCount(){
  if(!this.hasLegacyData())return 0;
  if(!AuthManager.isUnlocked())throw Error('Informe seu PIN antigo para recuperar os registros locais.');
  const items=await AuthManager.decryptData(readLegacy());
  return items.filter(x=>!x.isSynced).length;
 },
 async syncLocalToCloud(){
  headers();
  if(!this.hasLegacyData())return {sent:0};
  if(!AuthManager.isUnlocked())throw Error('Desbloqueie o armazenamento antigo com seu PIN antes de recuperar pendências.');
  const items=await AuthManager.decryptData(readLegacy());
  const pending=items.filter(x=>!x.isSynced);
  if(!pending.length)return {sent:0};
  const cloud=await this.getAllItems(), remote=new Map(cloud.map(x=>[x.id,x]));
  const conflicts=pending.filter(x=>remote.has(x.id) && (!x._base || JSON.stringify(clean(remote.get(x.id)))!==x._base));
  if(conflicts.length)throw Error(`${conflicts.length} conflito(s) detectado(s). Nenhum registro foi sobrescrito.`);
  let sent=0;
  for(const item of pending){
   const record=fields(clean(item)), editing=remote.has(item.id);
   const url=editing?`${endpoint()}?id=eq.${encodeURIComponent(item.id)}`:endpoint();
   const r=await fetch(url,{method:editing?'PATCH':'POST',headers:{...headers(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(record)});
   if(!r.ok)throw Error(`Registro ${item.num_patrimonio}: ${await errorText(r)} (HTTP ${r.status}). ${sent} enviado(s). Pendências preservadas.`);
   const saved=await r.json().catch(()=>[]);
   if(!Array.isArray(saved)||saved.length!==1)throw Error(`Confirmação ambígua para ${item.num_patrimonio}. Confira o banco antes de repetir.`);
   item.isSynced=true;delete item._base;
   localStorage.setItem(K.LOCAL_DATA,JSON.stringify(await AuthManager.encryptData(items)));
   sent++;
  }
  return {sent};
 }
};
window.DataManager=DataManager;
