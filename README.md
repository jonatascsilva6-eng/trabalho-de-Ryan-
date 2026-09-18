# Sistema de Chamados — ConnectTI Soluções em Tecnologia

Protótipo funcional de gerenciamento de chamados de suporte técnico, com Front-End,
Back-End (API REST em Node.js/Express) e persistência em MySQL.

Unidade curricular: Codificação para Back-End — Técnico em Informática para Internet.

---

## 1. Como executar

### Pré-requisitos
- Node.js 18 ou superior e npm
- MySQL em execução (local, XAMPP, Workbench etc.)

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o banco e a tabela (pelo terminal ou colando o script no Workbench)
mysql -u root -p < database/schema.sql

# 3. Configurar o acesso ao banco
cp .env.example .env      # no Windows: copy .env.example .env
#   edite o .env com o usuário e a senha do seu MySQL

# 4. Subir o servidor
npm start
```

Acesse **http://localhost:3000**.

---

## 2. Estrutura do projeto

```
sistema-chamados/
├── database/
│   └── schema.sql                  Criação do banco, da tabela e dados de exemplo
├── public/                         FRONT-END
│   ├── index.html                  Interface do técnico
│   ├── css/style.css               Identidade visual
│   └── js/app.js                   Requisições HTTP (fetch) e renderização
├── src/                            BACK-END
│   ├── server.js                   Sobe o Express, serve o Front-End e a API
│   ├── config/db.js                Pool de conexões MySQL
│   ├── routes/chamadoRoutes.js     Definição das rotas da API
│   ├── controllers/                Regras de resposta HTTP
│   ├── repositories/               Acesso ao banco (SQL parametrizado)
│   └── middlewares/                Validação de dados e tratamento de erros
├── .env.example
└── package.json
```

A separação em camadas (rota → middleware de validação → controller → repositório)
mantém cada arquivo com uma responsabilidade só e facilita a manutenção.

---

## 3. A API

Base: `http://localhost:3000/api/chamados`

| Método | Rota                | O que faz                     | Corpo / parâmetros |
|--------|---------------------|-------------------------------|--------------------|
| GET    | `/api/chamados`     | Lista os chamados             | `?status=` `?prioridade=` `?busca=` |
| GET    | `/api/chamados/resumo` | Total de chamados por status | — |
| GET    | `/api/chamados/:id` | Consulta um chamado           | — |
| POST   | `/api/chamados`     | Cadastra um chamado           | JSON |
| PUT    | `/api/chamados/:id` | Altera um chamado             | JSON (campos parciais) |
| DELETE | `/api/chamados/:id` | Exclui um chamado             | — |

### Campos do chamado

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | inteiro | gerado pelo banco |
| `solicitante` | texto | 3 a 100 caracteres |
| `descricao` | texto | 10 a 1000 caracteres |
| `categoria` | texto | Hardware, Software, Rede, Acesso, Outros |
| `prioridade` | texto | Baixa, Média, Alta, Urgente |
| `status` | texto | Aberto, Em atendimento, Concluído, Cancelado (padrão: Aberto) |
| `data_abertura` | data/hora | preenchida automaticamente |

### Exemplos

Cadastrar:

```json
POST /api/chamados
{
  "solicitante": "Marina Alves",
  "descricao": "A impressora do setor financeiro não imprime desde a manhã.",
  "categoria": "Hardware",
  "prioridade": "Alta"
}
```

Resposta `201 Created`:

```json
{
  "sucesso": true,
  "mensagem": "Chamado #5 cadastrado.",
  "dados": { "id": 5, "solicitante": "Marina Alves", "status": "Aberto", "...": "..." }
}
```

Mudar o andamento do atendimento:

```json
PUT /api/chamados/5
{ "status": "Em atendimento" }
```

Erro de validação `400 Bad Request`:

```json
{
  "sucesso": false,
  "mensagem": "Não foi possível cadastrar o chamado.",
  "erros": ["A descrição do problema deve ter entre 10 e 1000 caracteres."]
}
```

---

## 4. Validações, erros e segurança

- **Validação de entrada** em `src/middlewares/validarChamado.js`: tamanho dos textos,
  campos obrigatórios, listas fechadas para categoria/prioridade/status e ID numérico.
- **Tratamento de erros** centralizado em `src/middlewares/errorHandler.js`:
  `400` dado inválido ou JSON malformado, `404` chamado ou rota inexistente,
  `500` falha interna (a mensagem técnica fica no log do servidor, não na resposta).
- **SQL Injection**: todas as queries usam parâmetros (`?`), nunca concatenação de strings.
- **XSS**: o texto é limpo na entrada (Back-End) e escapado na exibição (Front-End).
- **Credenciais** ficam no `.env`, fora do código versionado.

---

## 5. Como testar

1. Abra a interface e cadastre um chamado — ele aparece na lista ordenado por prioridade.
2. Clique em **Editar**, mude o status para "Em atendimento" e depois para "Concluído".
3. Clique em **Excluir** e confirme.
4. Use o filtro de status e a busca.
5. Envie um formulário incompleto para ver as mensagens de validação.
6. Abra o DevTools (aba Network) e acompanhe as requisições e as respostas em JSON.
7. Teste a API direto, sem o Front-End:

```bash
curl http://localhost:3000/api/chamados
curl http://localhost:3000/api/chamados/999          # deve retornar 404
curl -X POST http://localhost:3000/api/chamados \
     -H "Content-Type: application/json" \
     -d '{"solicitante":"Ana","descricao":"curta","categoria":"Rede","prioridade":"Alta"}'
```

---

## 6. Entregas da situação de aprendizagem

| Item solicitado | Onde está |
|-----------------|-----------|
| Interface Front-End | `public/` |
| Servidor Back-End | `src/server.js` |
| API | `src/routes/` + `src/controllers/` |
| Banco de dados | `database/schema.sql` + `src/config/db.js` |
| Operações CRUD | POST, GET, PUT e DELETE em `/api/chamados` |
| Comunicação Front/Back | `fetch` com JSON em `public/js/app.js` |
| Persistência dos dados | MySQL via `src/repositories/chamadoRepository.js` |
| Validações básicas | `src/middlewares/validarChamado.js` |
| Tratamento de erros | `src/middlewares/errorHandler.js` |
| Código organizado | separação em camadas descrita no item 2 |
# trabalho-de-Ryan-
