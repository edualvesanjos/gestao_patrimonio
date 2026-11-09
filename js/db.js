// Camada de Persistência Híbrida de Dados (LocalStorage + SuperDB API)
import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';

export const DataManager = {
  // Retorna os dados locais salvos no navegador
  _getLocalItems() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DATA);
    return data ? JSON.parse(data) : [];
  },

  // Salva no LocalStorage
  _setLocalItems(items) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DATA, JSON.stringify(items));
  },

  // Listar todos os itens
  async getAllItems() {
    const session = AuthManager.getCurrentUser();
    
    if (session && session.mode === 'superdb') {
      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[DB] GET todos os patrimônios no SuperDB (${activeEnv.name})`);
      // Em produção real faria fetch(`${activeEnv.apiUrl}/patrimonios`, ...)
      // Retornamos fallback do local para testes fluidos
      return this._getLocalItems();
    } else {
      return this._getLocalItems();
    }
  },

  // Criar ou Atualizar Item
  async saveItem(itemData) {
    const session = AuthManager.getCurrentUser();
    let items = this._getLocalItems();

    if (itemData.id) {
      // Atualização
      const index = items.findIndex(i => i.id === itemData.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...itemData, updated_at: new Date().toISOString() };
      }
    } else {
      // Criação Novo Registro
      const newItem = {
        id: 'pat_' + Date.now(),
        item: itemData.item,
        categoria: itemData.categoria,
        quantidade: parseInt(itemData.quantidade) || 1,
        fabricante: itemData.fabricante || '',
        modelo: itemData.modelo || '',
        num_patrimonio: itemData.num_patrimonio,
        baixado: false,
        transferido: false,
        observacoes: itemData.observacoes || '',
        created_at: new Date().toISOString()
      };
      items.push(newItem);
    }

    this._setLocalItems(items);

    if (session && session.mode === 'superdb') {
      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[DB] POST/PUT para SuperDB (${activeEnv.name})`, itemData);
    }

    return true;
  },

  // Alternar Status de Baixado (true/false)
  async toggleBaixa(id) {
    let items = this._getLocalItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.baixado = !item.baixado;
      item.updated_at = new Date().toISOString();
      this._setLocalItems(items);

      const session = AuthManager.getCurrentUser();
      if (session && session.mode === 'superdb') {
        const activeEnv = CONFIG.getSuperDBConfig();
        console.log(`[DB] PATCH Baixa para SuperDB (${activeEnv.name}) ID: ${id}`);
      }
    }
  },

  // Excluir registro
  async deleteItem(id) {
    let items = this._getLocalItems();
    items = items.filter(i => i.id !== id);
    this._setLocalItems(items);

    const session = AuthManager.getCurrentUser();
    if (session && session.mode === 'superdb') {
      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[DB] DELETE no SuperDB (${activeEnv.name}) ID: ${id}`);
    }
  }
};

window.DataManager = DataManager;
