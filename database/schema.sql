-- =====================================================================
-- Banco de dados do Sistema de Chamados - ConnectTI Soluções em Tecnologia
-- Execute este script uma vez antes de iniciar o servidor.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS connectti_chamados
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE connectti_chamados;

CREATE TABLE IF NOT EXISTS chamados (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  solicitante   VARCHAR(100) NOT NULL,
  descricao     TEXT         NOT NULL,
  categoria     ENUM('Hardware', 'Software', 'Rede', 'Acesso', 'Outros') NOT NULL,
  prioridade    ENUM('Baixa', 'Média', 'Alta', 'Urgente') NOT NULL DEFAULT 'Média',
  status        ENUM('Aberto', 'Em atendimento', 'Concluído', 'Cancelado') NOT NULL DEFAULT 'Aberto',
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_prioridade (prioridade)
) ENGINE=InnoDB;

-- Dados de exemplo para teste (opcional)
INSERT INTO chamados (solicitante, descricao, categoria, prioridade, status) VALUES
  ('Marina Alves',   'A impressora do setor financeiro não imprime desde a manhã.', 'Hardware', 'Alta',    'Aberto'),
  ('Carlos Pereira', 'O sistema de emissão de notas fiscais fecha sozinho ao salvar.', 'Software', 'Urgente', 'Em atendimento'),
  ('Juliana Rocha',  'A rede sem fio da recepção cai várias vezes por dia.', 'Rede', 'Média', 'Aberto'),
  ('Eduardo Lima',   'Liberar acesso ao servidor de arquivos para o novo estagiário.', 'Acesso', 'Baixa', 'Concluído');
