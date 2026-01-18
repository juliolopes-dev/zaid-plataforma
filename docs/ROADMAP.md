# Roadmap - Plataforma Multiatendimento WhatsApp

## Visão Geral

Evolução planejada do produto em 3 fases: MVP → V1 → V2

---

## MVP (Minimum Viable Product)

**Objetivo:** Sistema funcional de multiatendimento básico
**Prazo estimado:** 4-6 semanas
**Prioridade:** 🔴 Crítico

### Funcionalidades

| Feature | Descrição | Status |
|---------|-----------|--------|
| **Conexão WhatsApp** | QR Code via Evolution API | ⬜ Pendente |
| **Autenticação** | Login/logout com JWT | ⬜ Pendente |
| **Inbox unificado** | Lista de todas as conversas | ⬜ Pendente |
| **Chat em tempo real** | Enviar/receber mensagens (texto) | ⬜ Pendente |
| **Atribuição de conversa** | Atendente assume conversa | ⬜ Pendente |
| **Transferência** | Passar conversa para outro atendente | ⬜ Pendente |
| **Status da conversa** | Pendente, Em atendimento, Finalizado | ⬜ Pendente |
| **Múltiplos atendentes** | 2+ atendentes simultâneos | ⬜ Pendente |

### Telas MVP

```
1. Login
2. Dashboard/Inbox (lista de conversas)
3. Chat (conversa individual)
4. Modal de transferência
```

### Entregáveis Técnicos

- [ ] Setup do monorepo (pnpm workspaces)
- [ ] Backend NestJS com módulos básicos
- [ ] Frontend Next.js com páginas principais
- [ ] Integração Evolution API (webhook + envio)
- [ ] Integração Pusher (tempo real)
- [ ] Docker Compose para desenvolvimento
- [ ] Deploy inicial na VPS

---

## V1 (Versão 1.0)

**Objetivo:** Produto completo para uso comercial
**Prazo estimado:** 4-6 semanas após MVP
**Prioridade:** 🟡 Alta

### Funcionalidades

| Feature | Descrição | Status |
|---------|-----------|--------|
| **Mídia** | Enviar/receber imagens, áudios, documentos | ⬜ Pendente |
| **Respostas rápidas** | Templates de mensagens (/ola, /preco) | ⬜ Pendente |
| **Perfil do contato** | Visualizar/editar dados do cliente | ⬜ Pendente |
| **Histórico** | Buscar conversas anteriores | ⬜ Pendente |
| **Notificações** | Notificação de nova mensagem (browser) | ⬜ Pendente |
| **Indicador de digitação** | "Fulano está digitando..." | ⬜ Pendente |
| **Status de mensagem** | Enviado, entregue, lido (✓✓) | ⬜ Pendente |
| **Gestão de usuários** | CRUD de atendentes (Admin) | ⬜ Pendente |
| **Roles** | Admin, Supervisor, Atendente | ⬜ Pendente |

### Telas V1

```
1. Todas do MVP +
2. Configurações
3. Gestão de usuários
4. Respostas rápidas
5. Perfil do contato (sidebar)
6. Histórico de conversas
```

### Melhorias Técnicas

- [ ] Upload de mídia para Cloudflare R2
- [ ] Cache com Redis
- [ ] Paginação com cursor
- [ ] Logs estruturados
- [ ] Tratamento de erros robusto
- [ ] Testes unitários (cobertura 60%+)

---

## V2 (Versão 2.0)

**Objetivo:** Features avançadas e escalabilidade
**Prazo estimado:** 6-8 semanas após V1
**Prioridade:** 🟢 Média

### Funcionalidades

| Feature | Descrição | Status |
|---------|-----------|--------|
| **Setores/Departamentos** | Vendas, Suporte, Financeiro | ⬜ Pendente |
| **Filas de atendimento** | Distribuição automática | ⬜ Pendente |
| **Chatbot inicial** | Mensagem automática de boas-vindas | ⬜ Pendente |
| **Tags** | Categorizar conversas | ⬜ Pendente |
| **Notas internas** | Anotações visíveis só para atendentes | ⬜ Pendente |
| **Dashboard métricas** | Tempo de resposta, atendimentos/dia | ⬜ Pendente |
| **Relatórios** | Exportar dados (CSV, PDF) | ⬜ Pendente |
| **Múltiplos números** | Conectar mais de um WhatsApp | ⬜ Pendente |
| **Horário de atendimento** | Mensagem fora do horário | ⬜ Pendente |
| **Avaliação** | Cliente avalia o atendimento | ⬜ Pendente |

### Telas V2

```
1. Todas anteriores +
2. Dashboard de métricas
3. Relatórios
4. Configuração de setores
5. Configuração de chatbot
6. Gerenciamento de múltiplos números
```

### Melhorias Técnicas

- [ ] Queue com Bull para processamento assíncrono
- [ ] Horizontal scaling (múltiplas instâncias)
- [ ] Read replicas PostgreSQL
- [ ] Monitoramento (Sentry, Prometheus)
- [ ] CI/CD completo
- [ ] Testes E2E (Playwright)
- [ ] Documentação API (Swagger)

---

## Backlog Futuro (V3+)

| Feature | Descrição |
|---------|-----------|
| **Integração CRM** | Sincronizar com Hubspot, Pipedrive |
| **API pública** | Permitir integrações externas |
| **Webhooks outbound** | Notificar sistemas externos |
| **IA/GPT** | Sugestões de resposta, resumo de conversa |
| **Campanhas** | Envio em massa (com opt-in) |
| **Multi-tenant** | SaaS para múltiplas empresas |
| **App mobile** | React Native para atendentes |
| **Agendamento** | Agendar envio de mensagens |
| **Kanban** | Visualização de conversas em board |

---

## Cronograma Visual

```
Semana 1-2:  [████████████████████] Setup + Auth + Conexão WhatsApp
Semana 3-4:  [████████████████████] Inbox + Chat + Tempo Real
Semana 5-6:  [████████████████████] Transferência + Deploy MVP
             ─────────────────────────────────────────────────
             🎯 MVP ENTREGUE
             ─────────────────────────────────────────────────
Semana 7-8:  [████████████████████] Mídia + Respostas Rápidas
Semana 9-10: [████████████████████] Gestão Usuários + Roles
Semana 11-12:[████████████████████] Polimento + Testes + V1
             ─────────────────────────────────────────────────
             🎯 V1 ENTREGUE
             ─────────────────────────────────────────────────
Semana 13+:  [████████████████████] Features V2...
```

---

## Métricas de Sucesso

### MVP
- [ ] 2+ atendentes conseguem usar simultaneamente
- [ ] Mensagens chegam em < 2 segundos
- [ ] Zero perda de mensagens
- [ ] Transferência funciona corretamente

### V1
- [ ] Tempo médio de resposta < 1 minuto
- [ ] Uptime > 99%
- [ ] Suporte a 100+ conversas/dia
- [ ] Feedback positivo de atendentes

### V2
- [ ] Suporte a 1000+ conversas/dia
- [ ] Métricas de atendimento disponíveis
- [ ] Múltiplos setores funcionando
- [ ] Tempo de onboarding < 30 min

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Evolution API instável | Alto | Implementar retry + fallback |
| Pusher limite de conexões | Médio | Monitorar uso, upgrade plano |
| WhatsApp banir número | Alto | Seguir boas práticas, não spam |
| Performance com muitas msgs | Médio | Paginação, índices, cache |
| Perda de mensagens | Alto | Queue persistente, logs |

---

## Decisões Técnicas Pendentes

| Decisão | Opções | Status |
|---------|--------|--------|
| State management frontend | Zustand vs Jotai vs Context | ⬜ Decidir |
| Validação de forms | React Hook Form + Zod | ✅ Definido |
| Estilo de código | ESLint + Prettier | ✅ Definido |
| Testes | Vitest + Testing Library | ✅ Definido |
| Monorepo tool | pnpm workspaces | ✅ Definido |
