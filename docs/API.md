# API Documentation - Plataforma Multiatendimento WhatsApp

## Visão Geral

API REST construída com NestJS. Autenticação via JWT com refresh tokens.

**Base URL:** `http://localhost:3001/api`

---

## Autenticação

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Endpoints de Auth

#### POST /auth/login
Realiza login e retorna tokens.

**Request:**
```json
{
  "email": "atendente@empresa.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "atendente@empresa.com",
    "name": "João Silva",
    "role": "AGENT",
    "avatarUrl": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

**Cookies setados:**
- `refresh_token` (HttpOnly, 7 dias)

---

#### POST /auth/refresh
Renova o access token usando refresh token do cookie.

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

---

#### POST /auth/logout
Invalida o refresh token.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET /auth/me
Retorna dados do usuário autenticado.

**Response (200):**
```json
{
  "id": "clx1234567890",
  "email": "atendente@empresa.com",
  "name": "João Silva",
  "role": "AGENT",
  "avatarUrl": null,
  "isOnline": true
}
```

---

## Usuários

### GET /users
Lista todos os usuários (Admin/Supervisor).

**Query Params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| role | string | - | Filtrar por role (ADMIN, SUPERVISOR, AGENT) |
| online | boolean | - | Filtrar por status online |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "email": "atendente@empresa.com",
      "name": "João Silva",
      "role": "AGENT",
      "isOnline": true,
      "lastSeenAt": "2026-01-18T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

### POST /users
Cria novo usuário (Admin).

**Request:**
```json
{
  "email": "novo@empresa.com",
  "name": "Maria Santos",
  "password": "senha123",
  "role": "AGENT"
}
```

**Response (201):**
```json
{
  "id": "clx0987654321",
  "email": "novo@empresa.com",
  "name": "Maria Santos",
  "role": "AGENT"
}
```

---

### PATCH /users/:id
Atualiza usuário.

**Request:**
```json
{
  "name": "Maria Santos Silva",
  "role": "SUPERVISOR"
}
```

---

### DELETE /users/:id
Remove usuário (Admin).

---

## Conversas

### GET /conversations
Lista conversas com filtros.

**Query Params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| status | string | - | PENDING, IN_PROGRESS, RESOLVED |
| assignedToId | string | - | ID do atendente |
| unassigned | boolean | false | Apenas não atribuídas |
| page | number | 1 | Página |
| limit | number | 20 | Itens por página |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx1111111111",
      "protocol": "2026011800001",
      "status": "PENDING",
      "contact": {
        "id": "clx2222222222",
        "name": "Cliente João",
        "phone": "+55 11 99999-9999",
        "profilePicUrl": "https://..."
      },
      "assignedTo": null,
      "lastMessageAt": "2026-01-18T12:30:00Z",
      "lastMessagePreview": "Olá, preciso de ajuda...",
      "unreadCount": 3
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

---

### GET /conversations/:id
Detalhes de uma conversa.

**Response (200):**
```json
{
  "id": "clx1111111111",
  "protocol": "2026011800001",
  "status": "IN_PROGRESS",
  "contact": {
    "id": "clx2222222222",
    "whatsappId": "5511999999999@s.whatsapp.net",
    "name": "Cliente João",
    "phone": "+55 11 99999-9999",
    "profilePicUrl": "https://..."
  },
  "assignedTo": {
    "id": "clx1234567890",
    "name": "João Silva"
  },
  "startedAt": "2026-01-18T12:35:00Z",
  "createdAt": "2026-01-18T12:30:00Z"
}
```

---

### POST /conversations/:id/assign
Atribui conversa ao usuário autenticado.

**Response (200):**
```json
{
  "id": "clx1111111111",
  "status": "IN_PROGRESS",
  "assignedTo": {
    "id": "clx1234567890",
    "name": "João Silva"
  },
  "startedAt": "2026-01-18T12:35:00Z"
}
```

---

### POST /conversations/:id/transfer
Transfere conversa para outro atendente.

**Request:**
```json
{
  "toUserId": "clx0987654321",
  "reason": "Especialista em vendas"
}
```

**Response (200):**
```json
{
  "id": "clx1111111111",
  "assignedTo": {
    "id": "clx0987654321",
    "name": "Maria Santos"
  },
  "transfer": {
    "id": "clx3333333333",
    "fromUser": { "id": "clx1234567890", "name": "João Silva" },
    "toUser": { "id": "clx0987654321", "name": "Maria Santos" },
    "reason": "Especialista em vendas",
    "createdAt": "2026-01-18T12:40:00Z"
  }
}
```

---

### POST /conversations/:id/resolve
Finaliza a conversa.

**Response (200):**
```json
{
  "id": "clx1111111111",
  "status": "RESOLVED",
  "resolvedAt": "2026-01-18T13:00:00Z"
}
```

---

## Mensagens

### GET /conversations/:id/messages
Lista mensagens de uma conversa.

**Query Params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| cursor | string | - | ID da última mensagem (paginação cursor) |
| limit | number | 50 | Quantidade de mensagens |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx4444444444",
      "content": "Olá, preciso de ajuda com meu pedido",
      "type": "TEXT",
      "direction": "INCOMING",
      "status": "READ",
      "sender": null,
      "createdAt": "2026-01-18T12:30:00Z"
    },
    {
      "id": "clx5555555555",
      "content": "Olá! Claro, qual o número do pedido?",
      "type": "TEXT",
      "direction": "OUTGOING",
      "status": "DELIVERED",
      "sender": {
        "id": "clx1234567890",
        "name": "João Silva"
      },
      "createdAt": "2026-01-18T12:31:00Z"
    }
  ],
  "nextCursor": "clx4444444444",
  "hasMore": true
}
```

---

### POST /conversations/:id/messages
Envia mensagem.

**Request (Texto):**
```json
{
  "type": "TEXT",
  "content": "Olá! Como posso ajudar?"
}
```

**Request (Mídia):**
```json
{
  "type": "IMAGE",
  "mediaUrl": "https://r2.zaid.com/media/image123.jpg",
  "content": "Segue a imagem solicitada"
}
```

**Response (201):**
```json
{
  "id": "clx6666666666",
  "content": "Olá! Como posso ajudar?",
  "type": "TEXT",
  "direction": "OUTGOING",
  "status": "PENDING",
  "createdAt": "2026-01-18T12:32:00Z"
}
```

---

### POST /conversations/:id/messages/:messageId/read
Marca mensagem como lida.

---

## Contatos

### GET /contacts
Lista contatos.

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| search | string | Busca por nome ou telefone |
| page | number | Página |
| limit | number | Itens por página |

---

### PATCH /contacts/:id
Atualiza nome do contato.

**Request:**
```json
{
  "name": "João da Silva - VIP"
}
```

---

## Quick Replies (Respostas Rápidas)

### GET /quick-replies
Lista respostas rápidas.

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx7777777777",
      "shortcut": "/ola",
      "title": "Saudação",
      "content": "Olá! Seja bem-vindo. Como posso ajudá-lo hoje?"
    }
  ]
}
```

---

### POST /quick-replies
Cria resposta rápida.

**Request:**
```json
{
  "shortcut": "/preco",
  "title": "Tabela de Preços",
  "content": "Segue nossa tabela de preços atualizada..."
}
```

---

### PATCH /quick-replies/:id
Atualiza resposta rápida.

---

### DELETE /quick-replies/:id
Remove resposta rápida.

---

## WhatsApp (Evolution API)

### GET /whatsapp/instance
Status da instância WhatsApp.

**Response (200):**
```json
{
  "instanceName": "zaid-instance",
  "status": "connected",
  "phone": "+55 11 98888-8888",
  "profileName": "Empresa ZAID",
  "profilePicUrl": "https://..."
}
```

---

### POST /whatsapp/instance/connect
Inicia conexão e retorna QR Code.

**Response (200):**
```json
{
  "status": "connecting",
  "qrCode": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

### POST /whatsapp/instance/disconnect
Desconecta a instância.

---

## Webhooks (Evolution API → Backend)

### POST /webhooks/evolution
Recebe eventos da Evolution API.

**Headers:**
```
x-api-key: <EVOLUTION_WEBHOOK_SECRET>
```

**Eventos suportados:**

#### messages.upsert (Nova mensagem)
```json
{
  "event": "messages.upsert",
  "instance": "zaid-instance",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0ABC123456789"
    },
    "message": {
      "conversation": "Olá, preciso de ajuda"
    },
    "messageTimestamp": 1705579800
  }
}
```

#### messages.update (Status da mensagem)
```json
{
  "event": "messages.update",
  "instance": "zaid-instance",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "id": "3EB0ABC123456789"
    },
    "update": {
      "status": 3
    }
  }
}
```

Status: 1=PENDING, 2=SENT, 3=DELIVERED, 4=READ

#### connection.update (Status da conexão)
```json
{
  "event": "connection.update",
  "instance": "zaid-instance",
  "data": {
    "state": "open"
  }
}
```

---

## Upload de Mídia

### POST /upload
Upload de arquivo para Cloudflare R2.

**Request:** `multipart/form-data`
| Field | Tipo | Descrição |
|-------|------|-----------|
| file | File | Arquivo (max 16MB) |
| type | string | image, audio, video, document |

**Response (201):**
```json
{
  "url": "https://r2.zaid.com/media/abc123.jpg",
  "type": "image/jpeg",
  "size": 245678,
  "name": "foto.jpg"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já existe) |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error |

**Formato de erro:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| POST /auth/login | 5 req/min por IP |
| POST /messages | 60 req/min por usuário |
| Outros | 100 req/min por usuário |

---

## Pusher Events (Tempo Real)

### Canais

| Canal | Autenticação | Descrição |
|-------|--------------|-----------|
| `private-user-{userId}` | Sim | Eventos pessoais |
| `private-conversation-{id}` | Sim | Mensagens da conversa |
| `presence-inbox` | Sim | Presença online |

### Eventos Emitidos

| Evento | Canal | Payload |
|--------|-------|---------|
| `new-message` | conversation | Message object |
| `message-status` | conversation | { messageId, status } |
| `conversation-assigned` | user | Conversation object |
| `conversation-transferred` | user | { conversation, from, to } |
| `typing-start` | conversation | { userId, userName } |
| `typing-stop` | conversation | { userId } |
