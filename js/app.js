// Controlador de Interface SPA & Módulo de Patrimônio
import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';
import { DataManager } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const btnGuest = document.getElementById('btn-guest');
  const btnLogout = document.getElementById('btn-logout');
  const envSelector = document.getElementById('env-selector');

  const userInfoDisplay = document.getElementById('user-info-display');
  const storageModeBadge = document.getElementById('storage-mode-badge');
  const envModeBadge = document.getElementById('env-mode-badge');
  const appVersionDisplay = document.getElementById('app-version-display');

  // Elementos do Módulo CRUD Patrimônio
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const itemModal = document.getElementById('item-modal');
  const formItem = document.getElementById('form-item');
  const itemsTableBody = document.getElementById('items-table-body');
  const modalTitle = document.getElementById('modal-title');

  // Elementos dos Cards de Estatística
  const totalCountEl = document.getElementById('total-count');
  const totalQtyEl = document.getElementById('total-qty');
  const activeCountEl = document.getElementById('active-count');
  const baixadosCountEl = document.getElementById('baixados-count');

  if (appVersionDisplay) {
    appVersionDisplay.textContent = `v${CONFIG.VERSION}`;
  }

  if (envSelector) {
    envSelector.value = CONFIG.getEnvironment();
    envSelector.addEventListener('change', (e) => {
      CONFIG.setEnvironment(e.target.value);
    });
  }

  // Alternância de Abas na Tela de Auth
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
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const session = await AuthManager.loginSuperDB(email, password);
    if (session) checkAuthAndRender();
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const session = await AuthManager.registerSuperDB(name, email, password);
    if (session) checkAuthAndRender();
  });

  btnGuest.addEventListener('click', () => {
    AuthManager.loginLocal();
    checkAuthAndRender();
  });

  btnLogout.addEventListener('click', () => {
    AuthManager.logout();
  });

  // Controls Modal
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

  btnOpenModal.addEventListener('click', () => openModal());
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Submit Formulário de Item (Salvar / Editar)
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

    await DataManager.saveItem(itemData);
    closeModal();
    loadItemsTable();
  });

  // Renderizar Tabela e Cards de Estatísticas
  async function loadItemsTable() {
    const items = await DataManager.getAllItems();

    let totalCount = items.length;
    let totalQty = 0;
    let activeCount = 0;
    let baixadosCount = 0;

    itemsTableBody.innerHTML = '';

    if (items.length === 0) {
      itemsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 24px; color: #777;">
            Nenhum patrimônio cadastrado. Clique em <strong>"+ Novo Item"</strong> para começar.
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

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.num_patrimonio}</strong></td>
          <td>${item.item}</td>
          <td>${item.categoria}</td>
          <td>${item.quantidade}</td>
          <td>${item.fabricante || '-'} ${item.modelo ? '/ ' + item.modelo : ''}</td>
          <td>${statusBadge}</td>
          <td>${item.observacoes || '-'}</td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-edit" data-id="${item.id}">Editar</button>
            <button class="btn btn-sm ${item.baixado ? 'btn-primary' : 'btn-danger'} btn-baixa" data-id="${item.id}">
              ${item.baixado ? 'Reativar' : 'Baixar'}
            </button>
          </td>
        `;
        itemsTableBody.appendChild(tr);
      });

      // Bind botões de ação dinâmicos
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
          await DataManager.toggleBaixa(id);
          loadItemsTable();
        });
      });
    }

    // Atualiza indicadores
    totalCountEl.textContent = totalCount;
    totalQtyEl.textContent = totalQty;
    activeCountEl.textContent = activeCount;
    baixadosCountEl.textContent = baixadosCount;
  }

  function checkAuthAndRender() {
    const session = AuthManager.getCurrentUser();

    if (session && session.user) {
      authScreen.classList.remove('active');
      appScreen.classList.add('active');

      userInfoDisplay.textContent = session.user.name;
      const currentEnvConfig = CONFIG.getSuperDBConfig();
      envModeBadge.textContent = CONFIG.getEnvironment().toUpperCase();

      if (CONFIG.getEnvironment() === 'dev') {
        envModeBadge.style.background = '#e67e22';
        envModeBadge.style.color = '#ffffff';
      } else {
        envModeBadge.style.background = '#28a745';
        envModeBadge.style.color = '#ffffff';
      }

      if (session.mode === 'superdb') {
        storageModeBadge.textContent = 'SuperDB Nuvem';
        storageModeBadge.style.background = '#0056b3';
      } else {
        storageModeBadge.textContent = 'Modo Local';
        storageModeBadge.style.background = '#6c757d';
      }

      loadItemsTable();
    } else {
      appScreen.classList.remove('active');
      authScreen.classList.add('active');
    }
  }

  checkAuthAndRender();
});
