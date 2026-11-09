// Camada de Persistência e Sincronização Real com o Banco SuperDB
import { CONFIG } from './config.js';
import { AuthManager, getSuperDBClient } from './auth.js';

export const DataManager = {
  _getLocalItems() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DATA);
    return data ? JSON.parse(data) : [];
  },

  _setLocalItems(items) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DATA, JSON.stringify(items));
  },

  // Busca dados diretamente do Banco de Dados SuperDB quando logado em modo 'superdb'
  async getAllItems() {
    const session = AuthManager.getCurrentUser();
    
    if (session && session.mode === 'superdb') {
      const client = getSuperDBClient();
      if (client) {
        const { data, error } = await client
          .from('patrimonios')
          .select('*')
          .order('criado_em', { ascending: false });

        if (!error && data) {
          return data;
        } else {
          console.error('[DB] Erro ao buscar da nuvem:', error);
        }
      }
    }
    return this._getLocalItems();
  },

  // Salva no Banco de Dados SuperDB ou LocalStorage
  async saveItem(itemData) {
    const session = AuthManager.getCurrentUser();
    
    if (session && session.mode === 'superdb') {
      const client = getSuperDBClient();
      if (!client) {
        alert("Erro: Cliente SuperDB não inicializado.");
        return false;
      }

      if (itemData.id && !itemData.id.startsWith('pat_')) {
        // Atualização no BD
        const { error } = await client
          .from('patrimonios')
          .update({
            item: itemData.item,
            categoria: itemData.categoria,
            quantidade: parseInt(itemData.quantidade) || 1,
            fabricante: itemData.fabricante || null,
            modelo: itemData.modelo || null,
            num_patrimonio: itemData.num_patrimonio,
            observacoes: itemData.observacoes || null
          })
          .eq('id', itemData.id);

        if (error) {
          alert("Erro ao atualizar patrimônio no SuperDB: " + error.message);
          return false;
        }
      } else {
        // Inserção no BD (O RLS preenche usuario_id com auth.uid() automaticamente se configurado ou enviamos session.user.id)
        const newRecord = {
          id: 'pat_' + Date.now(),
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

        const { error } = await client.from('patrimonios').insert([newRecord]);

        if (error) {
          alert("Erro ao gravar patrimônio no SuperDB: " + error.message);
          return false;
        }
      }
      return true;
    } else {
      // Modo Local Offline
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
    const session = AuthManager.getCurrentUser();
    if (session && session.mode === 'superdb') {
      const client = getSuperDBClient();
      const items = await this.getAllItems();
      const current = items.find(i => i.id === id);
      if (current && client) {
        await client.from('patrimonios').update({ baixado: !current.baixado }).eq('id', id);
      }
    } else {
      let items = this._getLocalItems();
      const item = items.find(i => i.id === id);
      if (item) {
        item.baixado = !item.baixado;
        this._setLocalItems(items);
      }
    }
  },

  // Sincronização real: Envia itens criados no modo local para o Banco de Dados SuperDB
  async syncLocalToCloud() {
    const session = AuthManager.getCurrentUser();
    if (!session || session.mode !== 'superdb') {
      alert("Faça login na sua conta SuperDB para enviar os dados para o banco on-line.");
      return false;
    }

    const client = getSuperDBClient();
    if (!client) {
      alert("Erro ao conectar ao SuperDB.");
      return false;
    }

    const localItems = this._getLocalItems();
    if (localItems.length === 0) {
      alert("Não há registros no modo local para sincronizar.");
      return false;
    }

    // Prepara o array para INSERT no banco
    const payload = localItems.map(item => ({
      id: item.id.startsWith('pat_') ? item.id : 'pat_' + Date.now() + Math.random().toString(36).substr(2, 4),
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

    console.log("[SYNC] Enviando payload para o SuperDB:", payload);

    const { error } = await client.from('patrimonios').insert(payload);

    if (error) {
      alert("Falha na sincronização com o banco SuperDB: " + error.message);
      return false;
    }

    // Limpa a fila local após sincronizar com sucesso
    this._setLocalItems([]);
    alert(`Sincronização realizada com sucesso! ${payload.length} patrimônio(s) gravado(s) no banco SuperDB.`);
    return true;
  }
};

window.DataManager = DataManager;
