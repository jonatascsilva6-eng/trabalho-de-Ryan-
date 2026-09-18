/**
 * Validação e sanitização dos dados recebidos do Front-End.
 * Nada chega ao banco sem passar por aqui — é a primeira camada de
 * segurança da informação da aplicação (junto com as queries parametrizadas).
 */
const { ErroDaApi } = require('./errorHandler');

const CATEGORIAS = ['Hardware', 'Software', 'Rede', 'Acesso', 'Outros'];
const PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Urgente'];
const STATUS = ['Aberto', 'Em atendimento', 'Concluído', 'Cancelado'];

/** Remove espaços extras e caracteres de marcação para evitar injeção de HTML/script. */
function limparTexto(valor) {
  return String(valor).trim().replace(/[<>]/g, '');
}

function validarCampos(dados, { parcial = false } = {}) {
  const erros = [];
  const limpo = {};

  const obrigatorio = (campo) => !parcial || dados[campo] !== undefined;

  if (obrigatorio('solicitante')) {
    const solicitante = limparTexto(dados.solicitante ?? '');
    if (solicitante.length < 3 || solicitante.length > 100) {
      erros.push('O nome do solicitante deve ter entre 3 e 100 caracteres.');
    } else {
      limpo.solicitante = solicitante;
    }
  }

  if (obrigatorio('descricao')) {
    const descricao = limparTexto(dados.descricao ?? '');
    if (descricao.length < 10 || descricao.length > 1000) {
      erros.push('A descrição do problema deve ter entre 10 e 1000 caracteres.');
    } else {
      limpo.descricao = descricao;
    }
  }

  if (obrigatorio('categoria')) {
    const categoria = limparTexto(dados.categoria ?? '');
    if (!CATEGORIAS.includes(categoria)) {
      erros.push(`Categoria inválida. Use uma destas: ${CATEGORIAS.join(', ')}.`);
    } else {
      limpo.categoria = categoria;
    }
  }

  if (obrigatorio('prioridade')) {
    const prioridade = limparTexto(dados.prioridade ?? '');
    if (!PRIORIDADES.includes(prioridade)) {
      erros.push(`Prioridade inválida. Use uma destas: ${PRIORIDADES.join(', ')}.`);
    } else {
      limpo.prioridade = prioridade;
    }
  }

  // No cadastro o status é opcional (assume "Aberto"); na alteração ele é validado se vier
  if (dados.status !== undefined) {
    const status = limparTexto(dados.status);
    if (!STATUS.includes(status)) {
      erros.push(`Status inválido. Use um destes: ${STATUS.join(', ')}.`);
    } else {
      limpo.status = status;
    }
  }

  return { erros, limpo };
}

/** Middleware do cadastro: todos os campos principais são obrigatórios. */
function validarCriacao(req, res, next) {
  const { erros, limpo } = validarCampos(req.body || {});
  if (erros.length > 0) {
    return next(new ErroDaApi(400, 'Não foi possível cadastrar o chamado.', erros));
  }
  limpo.status = limpo.status || 'Aberto';
  req.chamado = limpo;
  next();
}

/** Middleware da alteração: aceita envio parcial, mas exige pelo menos um campo. */
function validarAtualizacao(req, res, next) {
  const { erros, limpo } = validarCampos(req.body || {}, { parcial: true });
  if (erros.length > 0) {
    return next(new ErroDaApi(400, 'Não foi possível atualizar o chamado.', erros));
  }
  if (Object.keys(limpo).length === 0) {
    return next(new ErroDaApi(400, 'Informe ao menos um campo para atualizar.'));
  }
  req.chamado = limpo;
  next();
}

/** Middleware que garante que o ID da URL é um número inteiro positivo. */
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new ErroDaApi(400, 'O ID do chamado deve ser um número inteiro positivo.'));
  }
  req.idChamado = id;
  next();
}

module.exports = {
  validarCriacao,
  validarAtualizacao,
  validarId,
  CATEGORIAS,
  PRIORIDADES,
  STATUS
};
