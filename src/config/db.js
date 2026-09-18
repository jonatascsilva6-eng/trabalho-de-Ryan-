/**
 * Configuração da conexão com o banco de dados MySQL.
 * Usa um pool de conexões, que reaproveita conexões abertas e evita
 * esgotar o limite do servidor quando várias requisições chegam juntas.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'connectti_chamados',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci'
});

/** Testa a conexão no start do servidor para falhar cedo, com mensagem clara. */
async function testarConexao() {
  const conexao = await pool.getConnection();
  await conexao.ping();
  conexao.release();
}

module.exports = { pool, testarConexao };
