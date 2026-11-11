// Controlador de Interface SPA
import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';
import { DataManager } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const offlineForm = document.getElementById('form-offline');
  const btnLogout = document.getElementById('btn-logout');
  const btnSyncCloud = document.getElementById('btn-sync-cloud');
  const envSelector = document.getElementById('env-selector');

  const userInfoDisplay = document.getElementById('user-info-display');
  const storageModeBadge = document.getElementById('storage-mode-badge');
  const envModeBadge = document.getElementById('env-mode-badge');
  const appVersionDisplay = document.getElementById('app-version-display');

  const btnTestarRpc = document.getElementById('btn-testar-rpc');
  const resultadoTesteRpc = document.getElementById('resultado-teste-rpc');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const itemModal = document.getElementById('item-modal');
  const formItem = document.getElementById('form-item');
  const itemsTableBody = document.getElementById('items-table-body');
  const modalTitle = document.getElementById('modal-title');

  const totalCountEl = document.getElementById('total-count');
  const totalQtyEl = document.getElementById('total-qty');
  const activeCountEl = document.getElementById('active-count');
  const baixadosCountEl = document.getElementById('baixados-count');

  if (appVersionDisplay) {
    appVersionDisplay.textContent = `v${CONFIG.VERSION}`;
  }


  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`form-${targetTab}`).classList.add('active');
    });
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await AuthManager.loginSuperDB(document.getElementById('login-email').value,document.getElementById('login-password').value);
      // Login online não solicita PIN. Dados antigos continuam preservados
      // e só são desbloqueados sob demanda em "Recuperar pendências".
      checkAuthAndRender();
    } catch(err) { alert(err.message); }
  });
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Cadastro pelo aplicativo temporariamente desativado. Crie usuários pelo painel do SuperDB e faça login.');
  });
  if (offlineForm) offlineForm.addEventListener('submit', e => e.preventDefault());

  btnLogout.addEventListener('click', () => {
    AuthManager.logout();
  });

  if (btnSyncCloud) {
    btnSyncCloud.addEventListener('click', async () => {
      try { if(DataManager.hasLegacyData() && !AuthManager.isUnlocked()){const pin=prompt('PIN anterior para recuperar dados locais:');if(!pin)return;await AuthManager.unlock(pin);} const result=await DataManager.syncLocalToCloud(); alert(`${result.sent} registro(s) sincronizados.`); await loadItemsTable(); }
      catch(err) { alert(`Sincronização não concluída: ${err.message}`); await loadItemsTable(); }
    });
  }

  function openModal(item = null) {
    formItem.reset();
    document.getElementById('item-id').value = '';

    if (item) {
      modalTitle.textContent = 'Editar Item de Patrimônio';
      document.getElementById('item-id').value = item.id;
      document.getElementById('input-item').value = item.item;
      document.getElementById('input-num-patrimonio').value = item.num_patrimonio;
      document.getElementById('input-categoria').value = item.categoria;
      document.getElementById('input-quantidade').value = item.quantidade;
      document.getElementById('input-fabricante').value = item.fabricante || '';
      document.getElementById('input-modelo').value = item.modelo || '';
      document.getElementById('input-observacoes').value = item.observacoes || '';
    } else {
      modalTitle.textContent = 'Novo Item de Patrimônio';
    }

    itemModal.classList.add('active');
  }

  function closeModal() {
    itemModal.classList.remove('active');
  }

  btnTestarRpc.addEventListener('click', async () => {
    btnTestarRpc.disabled = true;
    resultadoTesteRpc.style.display = 'block';
    resultadoTesteRpc.textContent = 'Consultando permissão no SuperDB DEV...';
    try {
      const permitido = await DataManager.testarPermissaoConsulta();
      resultadoTesteRpc.textContent = permitido
        ? 'RPC: true — usuário autenticado possui patrimonios.consultar.'
        : 'RPC: false — permissão patrimonios.consultar não reconhecida para este usuário.';
    } catch (err) {
      resultadoTesteRpc.textContent = `Falha no teste RPC: ${err.message}`;
    } finally {
      btnTestarRpc.disabled = false;
    }
  });

  btnOpenModal.addEventListener('click', () => openModal());
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  formItem.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemData = {
      id: document.getElementById('item-id').value || null,
      item: document.getElementById('input-item').value,
      num_patrimonio: document.getElementById('input-num-patrimonio').value,
      categoria: document.getElementById('input-categoria').value,
      quantidade: document.getElementById('input-quantidade').value,
      fabricante: document.getElementById('input-fabricante').value,
      modelo: document.getElementById('input-modelo').value,
      observacoes: document.getElementById('input-observacoes').value
    };

    try { await DataManager.saveItem(itemData); closeModal(); await loadItemsTable();alert('Patrimônio gravado e confirmado pelo SuperDB.'); }
    catch(err) { alert(`Não foi possível salvar: ${err.message}`); }
  });

  async function loadItemsTable() {
    itemsTableBody.innerHTML = `<tr><td colspan="9" class="text-center">Consultando banco de dados...</td></tr>`;
    
    let items;
    try { items = await DataManager.getAllItems(); }
    catch(err) { itemsTableBody.textContent = `Erro ao ler os dados: ${err.message}`;return; }

    let totalCount = items.length;
    let totalQty = 0;
    let activeCount = 0;
    let baixadosCount = 0;

    itemsTableBody.innerHTML = '';

    if (items.length === 0) {
      itemsTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="padding: 24px; color: #777;">
            Nenhum patrimônio cadastrado neste ambiente. Clique em <strong>"+ Novo Item"</strong> para começar.
          </td>
        </tr>`;
    } else {
      items.forEach(item => {
        totalQty += parseInt(item.quantidade) || 0;
        if (item.baixado) baixadosCount++;
        else activeCount++;

        let statusBadge = item.baixado 
          ? '<span class="status-tag status-baixado">Baixado</span>'
          : (item.transferido 
              ? '<span class="status-tag status-transferido">Transferido</span>' 
              : '<span class="status-tag status-ativo">Ativo</span>');

        // Indicador de Origem / Sincronização
        let syncBadge = item.isSynced
          ? '<span class="sync-badge sync-badge-cloud" title="Sincronizado no Banco de Dados SuperDB">☁️ Nuvem</span>'
          : '<span class="sync-badge sync-badge-local" title="Salvo Apenas Neste Navegador (Pendente de Sincronização)">💻 Local</span>';

        const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${syncBadge}</td>
          <td><strong>${esc(item.num_patrimonio)}</strong></td>
          <td>${esc(item.item)}</td>
          <td>${esc(item.categoria)}</td>
          <td>${esc(item.quantidade)}</td>
          <td>${esc(item.fabricante || '-')} ${item.modelo ? '/ ' + esc(item.modelo) : ''}</td>
          <td>${statusBadge}</td>
          <td>${esc(item.observacoes || '-')}</td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-edit" data-id="${esc(item.id)}">Editar</button>
            <button class="btn btn-sm ${item.baixado ? 'btn-primary' : 'btn-danger'} btn-baixa" data-id="${esc(item.id)}">
              ${item.baixado ? 'Reativar' : 'Baixar'}
            </button>
          </td>
        `;
        itemsTableBody.appendChild(tr);
      });

      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const item = items.find(i => i.id === id);
          if (item) openModal(item);
        });
      });

      document.querySelectorAll('.btn-baixa').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          try { await DataManager.toggleBaixa(id); await loadItemsTable(); }
          catch(err) { alert(err.message); }
        });
      });
    }

    totalCountEl.textContent = totalCount;
    totalQtyEl.textContent = totalQty;
    activeCountEl.textContent = activeCount;
    baixadosCountEl.textContent = baixadosCount;
  }

  function checkAuthAndRender() {
    const session = AuthManager.getCurrentUser();

    if (session && session.user && session.mode === 'online' && session.token) {
      authScreen.classList.remove('active');
      appScreen.classList.add('active');

      userInfoDisplay.textContent = session.user.name;
      envModeBadge.textContent = CONFIG.getEnvironment().toUpperCase();

      if (CONFIG.getEnvironment() === 'dev') {
        envModeBadge.style.background = '#e67e22';
        envModeBadge.style.color = '#ffffff';
      } else {
        envModeBadge.style.background = '#28a745';
        envModeBadge.style.color = '#ffffff';
      }

      if (session.mode === 'online') {
        storageModeBadge.textContent = 'Online / SuperDB';
        storageModeBadge.style.background = '#0056b3';
        if (btnSyncCloud) btnSyncCloud.style.display = 'inline-block';
      } else {
        storageModeBadge.textContent = 'Acesso offline desativado';
        storageModeBadge.style.background = '#6c757d';
        if (btnSyncCloud) btnSyncCloud.style.display = 'none';
      }

      loadItemsTable();
    } else {
      appScreen.classList.remove('active');
      authScreen.classList.add('active');
    }
  }

  checkAuthAndRender();
});
