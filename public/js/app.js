/* =====================================================================
   Front-End do sistema de chamados.
   Conversa com o Back-End apenas por requisições HTTP trocando JSON.
   ===================================================================== */

const API = '/api/chamados';

const form            = document.getElementById('formChamado');
const campoId         = document.getElementById('chamadoId');
const campoStatus     = document.getElementById('campoStatus');
const tituloForm      = document.getElementById('tituloForm');
const btnSalvar       = document.getElementById('btnSalvar');
const btnCancelar     = document.getElementById('btnCancelarEdicao');
const avisoForm       = document.getElementById('avisoForm');
const lista           = document.getElementById('listaChamados');
const filtroStatus    = document.getElementById('filtroStatus');
const filtroBusca     = document.getElementById('filtroBusca');
const notificacao     = document.getElementById('mensagem');

/* ------------------------- Utilidades ------------------------- */

/** Escapa HTML antes de inserir texto vindo do banco na tela (anti-XSS). */
function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function formatarData(valor) {
  if (!valor) return '';
  const data = new Date(valor.replace(' ', 'T'));
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

let temporizadorAviso;
function avisar(texto, tipo = 'ok') {
  notificacao.textContent = texto;
  notificacao.dataset.tipo = tipo;
  notificacao.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { notificacao.hidden = true; }, 3500);
}

function mostrarErrosNoForm(mensagem, erros = []) {
  avisoForm.innerHTML = escapar(mensagem) +
    (erros.length ? `<ul>${erros.map((e) => `<li>${escapar(e)}</li>`).join('')}</ul>` : '');
  avisoForm.hidden = false;
}

function limparErrosDoForm() {
  avisoForm.hidden = true;
  avisoForm.innerHTML = '';
}

/** Faz a requisição e já trata os erros devolvidos pela API. */
async function requisitar(url, opcoes = {}) {
  const resposta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });

  let corpo = {};
  try {
    corpo = await resposta.json();
  } catch {
    throw { mensagem: 'O servidor respondeu em um formato inesperado.', erros: [] };
  }

  if (!resposta.ok) {
    throw { mensagem: corpo.mensagem || 'Falha na requisição.', erros: corpo.erros || [] };
  }
  return corpo;
}

/* --------------------------- Leitura -------------------------- */

async function carregarChamados() {
  const parametros = new URLSearchParams();
  if (filtroStatus.value) parametros.set('status', filtroStatus.value);
  if (filtroBusca.value.trim()) parametros.set('busca', filtroBusca.value.trim());

  try {
    const { dados } = await requisitar(`${API}?${parametros.toString()}`);
    renderizar(dados);
    atualizarPainel();
  } catch (erro) {
    lista.innerHTML = `<div class="vazio"><strong>Não foi possível carregar os chamados</strong>
      ${escapar(erro.mensagem)} Confira se o servidor está rodando e recarregue a página.</div>`;
  }
}

function renderizar(chamados) {
  if (!chamados.length) {
    lista.innerHTML = `<div class="vazio"><strong>Nenhum chamado por aqui</strong>
      Registre o primeiro atendimento no formulário ao lado ou troque os filtros.</div>`;
    return;
  }

  lista.innerHTML = chamados.map((c) => `
    <article class="chamado ${c.status === 'Concluído' ? 'chamado--concluido' : ''}"
             data-prioridade="${escapar(c.prioridade)}">
      <div class="chamado__cabecalho">
        <div>
          <span class="chamado__id">#${String(c.id).padStart(4, '0')}</span>
          <span class="chamado__solicitante">${escapar(c.solicitante)}</span>
        </div>
        <span class="selo" data-status="${escapar(c.status)}">${escapar(c.status)}</span>
      </div>

      <p class="chamado__descricao">${escapar(c.descricao)}</p>

      <div class="chamado__meta">
        <span>${escapar(c.categoria)}</span>
        <span>Prioridade ${escapar(c.prioridade)}</span>
        <span>Aberto em ${formatarData(c.data_abertura)}</span>
        <div class="chamado__acoes">
          <button class="btn btn--fino" data-acao="editar" data-id="${c.id}">Editar</button>
          <button class="btn btn--fino btn--perigo" data-acao="excluir" data-id="${c.id}">Excluir</button>
        </div>
      </div>
    </article>
  `).join('');
}

async function atualizarPainel() {
  try {
    const { dados } = await requisitar(`${API}/resumo`);
    const total = (status) => dados.find((d) => d.status === status)?.total ?? 0;
    document.getElementById('contAberto').textContent = total('Aberto');
    document.getElementById('contAtendimento').textContent = total('Em atendimento');
    document.getElementById('contConcluido').textContent = total('Concluído');
  } catch {
    /* o painel é informativo: se falhar, a lista continua funcionando */
  }
}

/* ------------------- Cadastro e alteração --------------------- */

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErrosDoForm();

  const dados = {
    solicitante: document.getElementById('solicitante').value,
    descricao:   document.getElementById('descricao').value,
    categoria:   document.getElementById('categoria').value,
    prioridade:  document.getElementById('prioridade').value
  };

  const id = campoId.value;
  if (id) dados.status = document.getElementById('status').value;

  btnSalvar.disabled = true;
  try {
    const resposta = await requisitar(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(dados)
    });
    avisar(resposta.mensagem);
    sairDoModoEdicao();
    form.reset();
    document.getElementById('prioridade').value = 'Média';
    carregarChamados();
  } catch (erro) {
    mostrarErrosNoForm(erro.mensagem, erro.erros);
  } finally {
    btnSalvar.disabled = false;
  }
});

/* --------------- Ações dentro da lista (editar/excluir) -------- */

lista.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const { acao, id } = botao.dataset;
  if (acao === 'editar')  return entrarNoModoEdicao(id);
  if (acao === 'excluir') return excluirChamado(id);
});

async function entrarNoModoEdicao(id) {
  try {
    const { dados } = await requisitar(`${API}/${id}`);
    campoId.value = dados.id;
    document.getElementById('solicitante').value = dados.solicitante;
    document.getElementById('descricao').value   = dados.descricao;
    document.getElementById('categoria').value   = dados.categoria;
    document.getElementById('prioridade').value  = dados.prioridade;
    document.getElementById('status').value      = dados.status;

    campoStatus.classList.remove('oculto');
    btnCancelar.classList.remove('oculto');
    tituloForm.textContent = `Editar chamado #${String(dados.id).padStart(4, '0')}`;
    btnSalvar.textContent = 'Salvar alterações';
    limparErrosDoForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    avisar(erro.mensagem, 'erro');
  }
}

function sairDoModoEdicao() {
  campoId.value = '';
  campoStatus.classList.add('oculto');
  btnCancelar.classList.add('oculto');
  tituloForm.textContent = 'Abrir chamado';
  btnSalvar.textContent = 'Registrar chamado';
  limparErrosDoForm();
}

btnCancelar.addEventListener('click', () => {
  form.reset();
  document.getElementById('prioridade').value = 'Média';
  sairDoModoEdicao();
});

async function excluirChamado(id) {
  if (!confirm(`Excluir o chamado #${String(id).padStart(4, '0')}? Essa ação não pode ser desfeita.`)) return;
  try {
    const resposta = await requisitar(`${API}/${id}`, { method: 'DELETE' });
    avisar(resposta.mensagem);
    if (campoId.value === String(id)) { form.reset(); sairDoModoEdicao(); }
    carregarChamados();
  } catch (erro) {
    avisar(erro.mensagem, 'erro');
  }
}

/* ---------------------------- Filtros -------------------------- */

filtroStatus.addEventListener('change', carregarChamados);

let temporizadorBusca;
filtroBusca.addEventListener('input', () => {
  clearTimeout(temporizadorBusca);
  temporizadorBusca = setTimeout(carregarChamados, 350);
});

carregarChamados();
