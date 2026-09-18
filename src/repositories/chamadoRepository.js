/**
 * Camada de acesso aos dados.
 * Todas as queries usam parâmetros (?) — o driver escapa os valores,
 * o que protege a aplicação contra SQL Injection.
 */
const { pool } = require('../config/db');

const COLUNAS = `id, solicitante, descricao, categoria, prioridade, status,
                 data_abertura, atualizado_em`;

async function listar(filtros = {}) {
  let sql = `SELECT ${COLUNAS} FROM chamados WHERE 1 = 1`;
  const valores = [];

  if (filtros.status) {
    sql += ' AND status = ?';
    valores.push(filtros.status);
  }
  if (filtros.prioridade) {
    sql += ' AND prioridade = ?';
    valores.push(filtros.prioridade);
  }
  if (filtros.busca) {
    sql += ' AND (solicitante LIKE ? OR descricao LIKE ?)';
    valores.push(`%${filtros.busca}%`, `%${filtros.busca}%`);
  }

  sql += ` ORDER BY FIELD(prioridade, 'Urgente', 'Alta', 'Média', 'Baixa'), data_abertura DESC`;

  const [linhas] = await pool.query(sql, valores);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${COLUNAS} FROM chamados WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    `INSERT INTO chamados (solicitante, descricao, categoria, prioridade, status)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.solicitante, dados.descricao, dados.categoria, dados.prioridade, dados.status]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const campos = Object.keys(dados);
  const clausulas = campos.map((campo) => `${campo} = ?`).join(', ');
  const valores = campos.map((campo) => dados[campo]);

  const [resultado] = await pool.query(
    `UPDATE chamados SET ${clausulas} WHERE id = ?`,
    [...valores, id]
  );

  if (resultado.affectedRows === 0) return null;
  return buscarPorId(id);
}

async function remover(id) {
  const [resultado] = await pool.query('DELETE FROM chamados WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function contarPorStatus() {
  const [linhas] = await pool.query(
    'SELECT status, COUNT(*) AS total FROM chamados GROUP BY status'
  );
  return linhas;
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, contarPorStatus };
