/**
 * Ponto de entrada da aplicação.
 * Sobe o servidor Express, serve o Front-End e expõe a API de chamados.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');

const chamadoRoutes = require('./routes/chamadoRoutes');
const { naoEncontrado, tratadorDeErros } = require('./middlewares/errorHandler');
const { testarConexao } = require('./config/db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Interpreta o corpo das requisições em JSON (limite reduz risco de payload gigante)
app.use(express.json({ limit: '100kb' }));

// Front-End estático (pasta public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api/chamados', chamadoRoutes);

// Rota de verificação rápida do servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servico: 'API de Chamados ConnectTI' });
});

// Rota inexistente e tratamento central de erros (sempre por último)
app.use(naoEncontrado);
app.use(tratadorDeErros);

async function iniciar() {
  try {
    await testarConexao();
    console.log('Banco de dados conectado.');
  } catch (erro) {
    console.error('Não foi possível conectar ao banco de dados.');
    console.error('Verifique o arquivo .env e se o script database/schema.sql já foi executado.');
    console.error(`Detalhe: ${erro.message}`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

iniciar();

module.exports = app;
