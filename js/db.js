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
    
    if (session && session.mode === 'superdb') {
      const cfg = CONFIG.getSuperDBConfig();
      try {
        const res = await fetch(`${cfg.apiUrl}/rest/v1/patrimonios?select=*`, {
          headers: {
            'apikey': cfg.anonKey,
            'Authorization': session.user.accessToken ? `Bearer ${session.user.accessToken}` : `Bearer ${cfg.anonKey}`,
            'X-SuperDB-Project': cfg.projectSlug,
            'Accept-Profile': cfg.projectSchema
          }
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.error('[DB] Erro ao buscar itens:', err);
      }
    }
    return this._getLocalItems();
  },

  async saveItem(itemData) {
    const session = AuthManager.getCurrentUser();
    
    if (session && session.mode === 'superdb') {
      const cfg = CONFIG.getSuperDBConfig();

      const record = {
        id: itemData.id && !itemData.id.startsWith('pat_') ? itemData.id : 'pat_' + Date.now(),
        usuario_id: session.user.id,
        item: itemData.item,
        categoria: itemData.categoria,
        quantidade: parseInt(itemData.quantidade) || 1,
        fabricante: itemData.fabricante || null,
        modelo: itemData.modelo || null,
        num_patrimonio: itemData.num_patrimonio,
        observacoes: itemData.observacoes || null,
        baixado: false,
        transferido: false
      };

      try {
        const res = await fetch(`${cfg.apiUrl}/rest/v1/patrimonios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cfg.anonKey,
            'Authorization': session.user.accessToken ? `Bearer ${session.user.accessToken}` : `Bearer ${cfg.anonKey}`,
            'X-SuperDB-Project': cfg.projectSlug,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(record)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Falha ao salvar no banco.');
        }
        return true;
      } catch (err) {
        alert("Erro ao gravar no SuperDB: " + err.message);
        return false;
      }
    } else {
      let items = this._getLocalItems();
      if (itemData.id) {
        const index = items.findIndex(i => i.id === itemData.id);
        if (index !== -1) items[index] = { ...items[index], ...itemData };
      } else {
        items.push({
          id: 'pat_' + Date.now(),
          ...itemData,
          quantidade: parseInt(itemData.quantidade) || 1,
          baixado: false,
          transferido: false,
          synced: false
        });
      }
      this._setLocalItems(items);
      return true;
    }
  },

  async toggleBaixa(id) {
    let items = this._getLocalItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.baixado = !item.baixado;
      this._setLocalItems(items);
    }
  },

  async syncLocalToCloud() {
    const session = AuthManager.getCurrentUser();
    if (!session || session.mode !== 'superdb') {
      alert("Faça login na sua conta SuperDB para enviar os dados.");
      return false;
    }

    const localItems = this._getLocalItems();
    if (localItems.length === 0) {
      alert("Não há registros locais para sincronizar.");
      return false;
    }

    const cfg = CONFIG.getSuperDBConfig();
    const payload = localItems.map(item => ({
      id: item.id.startsWith('pat_') ? item.id : 'pat_' + Date.now(),
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
      const res = await fetch(`${cfg.apiUrl}/rest/v1/patrimonios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'Authorization': session.user.accessToken ? `Bearer ${session.user.accessToken}` : `Bearer ${cfg.anonKey}`,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro de sincronização.');
      }

      this._setLocalItems([]);
      alert(`Sincronização realizada com sucesso! ${payload.length} item(ns) salvos.`);
      return true;
    } catch (err) {
      alert("Erro ao sincronizar: " + err.message);
      return false;
    }
  }
};

window.DataManager = DataManager;
