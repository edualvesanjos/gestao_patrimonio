import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';
const K=CONFIG.STORAGE_KEYS;
const read=()=>{try{return JSON.parse(localStorage.getItem(K.LOCAL_DATA));}catch{return null;}};
const errorText=async r=>{const d=await r.json().catch(()=>({}));return d.message||d.details||d.error||`HTTP ${r.status}`;};
const clean=x=>{const {isSynced,_base,...record}=x;return record;};
const headers=()=>{const s=AuthManager.getCurrentUser(),c=CONFIG.getSuperDBConfig();if(!s?.token)throw Error('É necessário autenticar online para sincronizar.');return {'apikey':c.anonKey,'Authorization':`Bearer ${s.token}`,'X-SuperDB-Project':c.projectSlug,'Accept-Profile':c.projectSchema,'Content-Profile':c.projectSchema};};
export const DataManager={
 async _getLocalItems(){return AuthManager.decryptData(read());},
 async _setLocalItems(items){localStorage.setItem(K.LOCAL_DATA,JSON.stringify(await AuthManager.encryptData(items)));},
 async _cloud(){const c=CONFIG.getSuperDBConfig();const r=await fetch(`${c.apiUrl}/rest/v1/patrimonios?select=*`,{headers:headers()});if(!r.ok)throw Error(await errorText(r));return r.json();},
 async getAllItems(){
  const local=await this._getLocalItems();let cloud=[];
  if(AuthManager.getCurrentUser()?.token&&navigator.onLine){try{cloud=await this._cloud();}catch(e){console.warn('Consulta nuvem indisponível:',e.message);}}
  const map=new Map(cloud.map(x=>[x.id,{...x,isSynced:true}]));
  for(const item of local)map.set(item.id,item); // alterações pendentes sempre prevalecem na interface
  // Cache de dados remotos somente após download bem-sucedido; não descarta pendências.
  if(cloud.length){const pending=local.filter(x=>!x.isSynced);await this._setLocalItems([...cloud.map(x=>({...x,isSynced:true})),...pending.filter(x=>!cloud.some(c=>c.id===x.id))].map(x=>pending.find(p=>p.id===x.id)||x));}
  return [...map.values()];
 },
 async saveItem(itemData){
  const s=AuthManager.getCurrentUser();if(!s||!AuthManager.isUnlocked())throw Error('Entre e desbloqueie o armazenamento com PIN.');
  const items=await this._getLocalItems();const existing=items.find(x=>x.id===itemData.id);
  const id=itemData.id||`pat_${crypto.randomUUID()}`;
  const base = existing ? (existing._base ?? (existing.isSynced ? JSON.stringify(clean(existing)) : null)) : null;
  const record={...existing,...itemData,id,usuario_id:s.user.id,_base:base,quantidade:Number.parseInt(itemData.quantidade,10)||1,baixado:itemData.baixado??existing?.baixado??false,transferido:itemData.transferido??existing?.transferido??false,isSynced:false};
  if(!record.item?.trim()||!record.categoria?.trim()||!record.num_patrimonio?.trim())throw Error('Preencha item, categoria e número de patrimônio.');
  const next=items.filter(x=>x.id!==id);next.push(record);await this._setLocalItems(next);
  return {pending:true};
 },
 async toggleBaixa(id){const items=await this.getAllItems();const item=items.find(x=>x.id===id);if(!item)throw Error('Patrimônio não encontrado.');return this.saveItem({...item,baixado:!item.baixado});},
 async syncLocalToCloud(){
  const s=AuthManager.getCurrentUser();if(!s?.token)throw Error('Entre online para sincronizar.');
  const items=await this._getLocalItems();const pending=items.filter(x=>!x.isSynced);
  if(!pending.length)return {sent:0};
  const cloud=await this._cloud();const remote=new Map(cloud.map(x=>[x.id,x]));
  // Bloqueio conservador: não sobrescrever registros existentes sem controle de versão.
  const conflicts=pending.filter(x=>remote.has(x.id)&&(!x._base || JSON.stringify(clean(remote.get(x.id)))!==x._base));
  if(conflicts.length)throw Error(`${conflicts.length} registro(s) alterado(s) remotamente ou sem versão-base. A sincronização foi bloqueada para evitar sobrescrita. Nenhum registro foi descartado.`);
  const c=CONFIG.getSuperDBConfig();let sent=0;
  for(const item of pending){
   const record=clean(item);
   const editing=remote.has(item.id);
   const url=editing?`${c.apiUrl}/rest/v1/patrimonios?id=eq.${encodeURIComponent(item.id)}`:`${c.apiUrl}/rest/v1/patrimonios`;
   const r=await fetch(url,{method:editing?'PATCH':'POST',headers:{...headers(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(record)});
   if(!r.ok)throw Error(`Registro ${item.num_patrimonio}: ${await errorText(r)}. ${sent} registro(s) enviados antes da falha; não repita a operação sem conferir o banco.`);
   item.isSynced=true;delete item._base;await this._setLocalItems(items);sent++;
  }
  return {sent};
 }
};
window.DataManager=DataManager;
