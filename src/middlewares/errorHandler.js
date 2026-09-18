/**
 * Tratamento central de erros da API.
 * Qualquer erro lançado nos controllers chega aqui e vira uma resposta JSON.
 */

/** Erro com código HTTP, usado pelas camadas da aplicação. */
class ErroDaApi extends Error {
  constructor(status, mensagem, detalhes = null) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

/** Requisição para uma rota que não existe. */
function naoEncontrado(req, res, next) {
  next(new ErroDaApi(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

function tratadorDeErros(erro, req, res, next) { // eslint-disable-line no-unused-vars
  // JSON malformado enviado pelo cliente
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'O corpo da requisição não é um JSON válido.'
    });
  }

  const status = erro.status || 500;

  if (status >= 500) {
    console.error('[ERRO]', erro);
  }

  res.status(status).json({
    sucesso: false,
    mensagem: status >= 500
      ? 'Erro interno no servidor. Tente novamente em alguns instantes.'
      : erro.message,
    ...(erro.detalhes ? { erros: erro.detalhes } : {})
  });
}

/** Evita repetir try/catch em todo controller assíncrono. */
function capturarAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { ErroDaApi, naoEncontrado, tratadorDeErros, capturarAsync };
