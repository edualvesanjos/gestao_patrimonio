// Camada de Persistência e Sincronização com SuperDB
import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';

export const DataManager = {
  _getLocalItems() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DATA);
    return data ? JSON.parse(data) : [];
  },

  _setLocalItems(items) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DATA, JSON.stringify(items));
  },

  async getAllItems() {
    const session = AuthManager.getCurrentUser();
    let cloudItems = [];

    if (session && session.mode === 'superdb') {
      const cfg = CONFIG.getSuperDBConfig();
      const authToken = session.user.dataPlaneToken || cfg.anonKey;
      try {
        const res = await fetch(`${cfg.apiUrl}/rest/v1/patrimonios?select=*`, {
          headers: {
            'apikey': cfg.anonKey,
            'Authorization': `Bearer ${authToken}`,
            'X-SuperDB-Project': cfg.projectSlug,
            'Accept-Profile': cfg.projectSchema
          }
        });
        if (res.ok) {
          cloudItems = await res.json();
          cloudItems = cloudItems.map(item => ({ ...item, isSynced: true }));
        }
      } catch (err) {
        console.warn('[DB] Erro ao consultar itens da nuvem:', err);
      }
    }

    const localItems = this._getLocalItems().map(item => ({ ...item, isSynced: false }));
    
    // Mesclar itens evitando duplicatas (Nuvem se sobrepõe ao local se houver mesmo ID)
    const combinedMap = new Map();
    localItems.forEach(item => combinedMap.set(item.id, item));
    cloudItems.forEach(item => combinedMap.set(item.id, item));

    return Array.from(combinedMap.values());
  },

  async saveItem(itemData) {
    const session = AuthManager.getCurrentUser();
    const isEdit = !!itemData.id;
    const recordId = isEdit ? itemData.id : 'pat_' + Date.now();

    const record = {
      id: recordId,
      usuario_id: session ? session.user.id : 'local_user',
      item: itemData.item,
      categoria: itemData.categoria,
      quantidade: parseInt(itemData.quantidade) || 1,
      fabricante: itemData.fabricante || null,
      modelo: itemData.modelo || null,
      num_patrimonio: itemData.num_patrimonio,
      observacoes: itemData.observacoes || null,
      baixado: itemData.baixado || false,
      transferido: itemData.transferido || false
    };

    if (session && session.mode === 'superdb') {
      const cfg = CONFIG.getSuperDBConfig();
      const authToken = session.user.dataPlaneToken || cfg.anonKey;

      // Utiliza PATCH para edições e POST para criações
      const url = isEdit 
        ? `${cfg.apiUrl}/rest/v1/patrimonios?id=eq.${recordId}` 
        : `${cfg.apiUrl}/rest/v1/patrimonios`;
      const method = isEdit ? 'PATCH' : 'POST';

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'apikey': cfg.anonKey,
            'Authorization': `Bearer ${authToken}`,
            'X-SuperDB-Project': cfg.projectSlug,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(record)
        });

        if (res.ok) {
          // Remove a versão local para não duplicar se salvou com sucesso na nuvem
          let localItems = this._getLocalItems();
          localItems = localItems.filter(i => i.id !== recordId);
          this._setLocalItems(localItems);
          return true;
        }
      } catch (err) {
        console.warn('[DB] Erro de rede ao salvar na nuvem, aplicando fallback local.');
      }
    }

    // FALLBACK LOCAL: Usa findIndex para editar, evitando push() duplicado!
    let items = this._getLocalItems();
    const index = items.findIndex(i => i.id === recordId);
    
    const localRecord = { ...record, isSynced: false };

    if (index !== -1) {
      items[index] = localRecord;
    } else {
      items.push(localRecord);
    }
    
    this._setLocalItems(items);
    return true;
  },

  async toggleBaixa(id) {
    const items = await this.getAllItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.baixado = !item.baixado;
      await this.saveItem(item);
    }
  },

  async syncLocalToCloud() {
    const session = AuthManager.getCurrentUser();
    if (!session || session.mode !== 'superdb') {
      alert("Faça login no SuperDB para sincronizar com a nuvem.");
      return false;
    }

    const localItems = this._getLocalItems();
    if (localItems.length === 0) {
      alert("Todos os seus registros já estão sincronizados com o banco de dados SuperDB!");
      return true;
    }

    const cfg = CONFIG.getSuperDBConfig();
    const authToken = session.user.dataPlaneToken || cfg.anonKey;

    const payload = localItems.map(item => ({
      id: item.id,
      usuario_id: session.user.id,
      item: item.item,
      categoria: item.categoria,
      quantidade: parseInt(item.quantidade) || 1,
      fabricante: item.fabricante || null,
      modelo: item.modelo || null,
      num_patrimonio: item.num_patrimonio,
      baixado: item.baixado || false,
      transferido: item.transferido || false,
      observacoes: item.observacoes || null
    }));

    try {
      // Usa on_conflict=id explícito na URL para garantir o comportamento UPSERT e não duplicar registros na Nuvem
      const res = await fetch(`${cfg.apiUrl}/rest/v1/patrimonios?on_conflict=id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${authToken}`,
          'X-SuperDB-Project': cfg.projectSlug,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.details || 'Falha ao sincronizar registros com a nuvem.');
      }

      this._setLocalItems([]);
      alert(`Sincronização concluída com sucesso! ${payload.length} patrimônio(s) enviados para a nuvem.`);
      return true;
    } catch (err) {
      alert("Erro ao sincronizar: " + err.message);
      return false;
    }
  }
};

window.DataManager = DataManager;
