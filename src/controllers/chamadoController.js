/**
 * Controllers: recebem a requisição HTTP, chamam o repositório
 * e devolvem a resposta em JSON com o código de status adequado.
 */
const repositorio = require('../repositories/chamadoRepository');
const { ErroDaApi, capturarAsync } = require('../middlewares/errorHandler');

// GET /api/chamados
const listar = capturarAsync(async (req, res) => {
  const { status, prioridade, busca } = req.query;
  const chamados = await repositorio.listar({ status, prioridade, busca });
  res.json({ sucesso: true, total: chamados.length, dados: chamados });
});

// GET /api/chamados/resumo
const resumo = capturarAsync(async (req, res) => {
  const contagem = await repositorio.contarPorStatus();
  res.json({ sucesso: true, dados: contagem });
});

// GET /api/chamados/:id
const buscarPorId = capturarAsync(async (req, res) => {
  const chamado = await repositorio.buscarPorId(req.idChamado);
  if (!chamado) {
    throw new ErroDaApi(404, `Nenhum chamado encontrado com o ID ${req.idChamado}.`);
  }
  res.json({ sucesso: true, dados: chamado });
});

// POST /api/chamados
const criar = capturarAsync(async (req, res) => {
  const chamado = await repositorio.criar(req.chamado);
  res.status(201).json({
    sucesso: true,
    mensagem: `Chamado #${chamado.id} cadastrado.`,
    dados: chamado
  });
});

// PUT /api/chamados/:id
const atualizar = capturarAsync(async (req, res) => {
  const existente = await repositorio.buscarPorId(req.idChamado);
  if (!existente) {
    throw new ErroDaApi(404, `Nenhum chamado encontrado com o ID ${req.idChamado}.`);
  }
  const chamado = await repositorio.atualizar(req.idChamado, req.chamado);
  res.json({
    sucesso: true,
    mensagem: `Chamado #${req.idChamado} atualizado.`,
    dados: chamado
  });
});

// DELETE /api/chamados/:id
const remover = capturarAsync(async (req, res) => {
  const removido = await repositorio.remover(req.idChamado);
  if (!removido) {
    throw new ErroDaApi(404, `Nenhum chamado encontrado com o ID ${req.idChamado}.`);
  }
  res.json({ sucesso: true, mensagem: `Chamado #${req.idChamado} excluído.` });
});

module.exports = { listar, resumo, buscarPorId, criar, atualizar, remover };
