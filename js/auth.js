import { CONFIG } from './config.js';
const K = CONFIG.STORAGE_KEYS;
const enc = new TextEncoder();
const b64 = bytes => btoa(String.fromCharCode(...bytes));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const derive = async (pin, salt) => crypto.subtle.deriveKey(
  {name:'PBKDF2', salt, iterations:310000, hash:'SHA-256'},
  await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']),
  {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
let activeKey = null;
let current = null;
export const AuthManager = {
  getCurrentUser() { return current; },
  hasOfflineProfile() { return !!read(K.OFFLINE); },
  async loginSuperDB(email, password) {
    if (!email || !password) throw Error('Informe e-mail e senha.');
    const cfg = CONFIG.getSuperDBConfig();
    let res;
    try {
      res = await fetch(`${cfg.authUrl}/auth/v1/signin`, {method:'POST', headers:{'Content-Type':'application/json','apikey':cfg.anonKey,'X-SuperDB-Project':cfg.projectSlug}, body:JSON.stringify({email,password})});
    } catch { throw Error('Sem conexão com o SuperDB. Utilize o acesso offline, se já configurado.'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Error(`Login não autorizado (HTTP ${res.status}): ${data.message || data.error || 'verifique as credenciais e a configuração da API'}`);
    const session = data.session || data;
    const user = data.user || session.user;
    const token = data.data_plane_token || session.data_plane_token;
    if (!user?.id || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(user.id) || !token || typeof token !== 'string')
      throw Error('O SuperDB não retornou ID de usuário e data_plane_token válidos. Verifique o formato da resposta da API.');
    current = {user:{id:user.id,email:user.email || email,name:(user.email || email).split('@')[0]}, token, mode:'online', env:'dev'};
    save(K.USER_SESSION, {user:current.user, env:'dev'}); // Nunca persistir tokens no navegador.
    return current;
  },
  async setupPin(pin) {
    if (!current || current.mode !== 'online') throw Error('Faça login online primeiro.');
    if (!/^\d{6}$/.test(pin)) throw Error('O PIN deve ter exatamente seis números.');
    const old = read(K.OFFLINE);
    if (old && old.user.id !== current.user.id) throw Error('Já existe um usuário offline neste navegador. Não é seguro substituí-lo sem exportar os dados.');
    if (old) throw Error('O PIN já está configurado. Use o PIN existente para desbloquear os dados locais.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(pin, salt);
    const check = await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode('patrimonio-offline-v1'));
    save(K.OFFLINE,{user:current.user,salt:b64(salt),iv:b64(iv),check:b64(new Uint8Array(check)),attempts:0,blockedUntil:0});
    activeKey = key;
  },
  async unlock(pin) {
    const p = read(K.OFFLINE);
    if (!p) throw Error('Acesso offline ainda não configurado.');
    if (Date.now() < (p.blockedUntil || 0)) throw Error('PIN temporariamente bloqueado. Tente novamente mais tarde.');
    if (!/^\d{6}$/.test(pin)) throw Error('Informe seis números.');
    try {
      const key = await derive(pin,unb64(p.salt));
      const clear = await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p.iv)},key,unb64(p.check));
      if (new TextDecoder().decode(clear) !== 'patrimonio-offline-v1') throw Error('PIN inválido');
      p.attempts=0;p.blockedUntil=0;save(K.OFFLINE,p);
      activeKey=key;
      if (!current) current={user:p.user,token:null,mode:'offline',env:'dev'};
      if (current.user.id !== p.user.id) throw Error('Este navegador está associado a outro usuário offline.');
      return current;
    } catch {
      p.attempts=(p.attempts||0)+1;
      if(p.attempts>=5){p.blockedUntil=Date.now()+15*60*1000;p.attempts=0;}
      save(K.OFFLINE,p);
      throw Error('PIN incorreto ou perfil local incompatível. Após cinco tentativas, o acesso é bloqueado por 15 minutos.');
    }
  },
  getKey() { return activeKey; },
  isUnlocked() { return !!activeKey; },
  async encryptData(items) {
    if(!activeKey) throw Error('Desbloqueie os dados locais com seu PIN.');
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv},activeKey,enc.encode(JSON.stringify(items)));
    return {iv:b64(iv),data:b64(new Uint8Array(bytes))};
  },
  async decryptData(blob) {
    if(!blob) return [];
    if(!activeKey) throw Error('Desbloqueie os dados locais com seu PIN.');
    const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(blob.iv)},activeKey,unb64(blob.data));
    return JSON.parse(new TextDecoder().decode(bytes));
  },
  logout() { current=null;activeKey=null;localStorage.removeItem(K.USER_SESSION);location.reload(); }
};
window.AuthManager=AuthManager;
