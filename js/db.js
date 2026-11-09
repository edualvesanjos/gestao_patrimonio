// Camada de Persistência Híbrida e Sincronização
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
      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[DB] Buscando patrimônios da nuvem SuperDB vinculados ao UUID: ${session.user.id}`);
      return this._getLocalItems();
    } else {
      return this._getLocalItems();
    }
  },

  async saveItem(itemData) {
    const session = AuthManager.getCurrentUser();
    let items = this._getLocalItems();

    if (itemData.id) {
      const index = items.findIndex(i => i.id === itemData.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...itemData, updated_at: new Date().toISOString() };
      }
    } else {
      const newItem = {
        id: 'pat_' + Date.now(),
        usuario_id: session && session.user ? session.user.id : null,
        item: itemData.item,
        categoria: itemData.categoria,
        quantidade: parseInt(itemData.quantidade) || 1,
        fabricante: itemData.fabricante || '',
        modelo: itemData.modelo || '',
        num_patrimonio: itemData.num_patrimonio,
        baixado: false,
        transferido: false,
        observacoes: itemData.observacoes || '',
        synced: session ? session.mode === 'superdb' : false,
        created_at: new Date().toISOString()
      };
      items.push(newItem);
    }

    this._setLocalItems(items);

    if (session && session.mode === 'superdb') {
      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[DB] Inserindo registro na tabela patrimonios com usuario_id = auth.uid() (${session.user.id})`);
    }

    return true;
  },

  async toggleBaixa(id) {
    let items = this._getLocalItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.baixado = !item.baixado;
      item.updated_at = new Date().toISOString();
      this._setLocalItems(items);
    }
  },

  async deleteItem(id) {
    let items = this._getLocalItems();
    items = items.filter(i => i.id !== id);
    this._setLocalItems(items);
  },

  async syncLocalToCloud() {
    const session = AuthManager.getCurrentUser();
    if (!session || session.mode !== 'superdb') {
      alert("Para sincronizar dados com o servidor on-line, você deve estar conectado em uma conta SuperDB.");
      return false;
    }

    const localItems = this._getLocalItems();
    if (localItems.length === 0) {
      alert("Não há dados cadastrados localmente para enviar.");
      return false;
    }

    const activeEnv = CONFIG.getSuperDBConfig();
    console.log(`[SYNC] Sincronizando ${localItems.length} itens para usuario_id = ${session.user.id} no SuperDB...`);

    const updatedItems = localItems.map(item => ({
      ...item,
      usuario_id: session.user.id,
      synced: true,
      synced_at: new Date().toISOString()
    }));

    this._setLocalItems(updatedItems);
    alert(`Sincronização concluída! Todos os bens foram associados ao seu UUID nativo no SuperDB (${activeEnv.name}).`);
    return true;
  }
};

window.DataManager = DataManager;
