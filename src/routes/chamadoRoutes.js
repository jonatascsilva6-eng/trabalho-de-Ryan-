/**
 * Rotas da API de chamados (padrão REST).
 *
 *  GET    /api/chamados          -> lista todos (aceita ?status= &prioridade= &busca=)
 *  GET    /api/chamados/resumo   -> total de chamados por status
 *  GET    /api/chamados/:id      -> consulta um chamado específico
 *  POST   /api/chamados          -> cadastra um chamado
 *  PUT    /api/chamados/:id      -> altera um chamado
 *  DELETE /api/chamados/:id      -> exclui um chamado
 */
const express = require('express');
const controller = require('../controllers/chamadoController');
const { validarCriacao, validarAtualizacao, validarId } = require('../middlewares/validarChamado');

const router = express.Router();

router.get('/', controller.listar);
router.get('/resumo', controller.resumo);
router.get('/:id', validarId, controller.buscarPorId);
router.post('/', validarCriacao, controller.criar);
router.put('/:id', validarId, validarAtualizacao, controller.atualizar);
router.delete('/:id', validarId, controller.remover);

module.exports = router;
