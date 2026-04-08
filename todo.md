# Grupo GAB - Sistema de Gestão Operacional

## Setup & Infraestrutura
- [x] Design system (cores, tipografia, tokens)
- [x] Schema do banco de dados completo (15 tabelas)
- [x] Migrações aplicadas
- [x] Layout principal com sidebar (DashboardLayout)
- [x] Autenticação e controle de acesso por role

## Dashboard
- [x] Cards de resumo (financeiro, projetos, CRM)
- [x] Botões funcionais com navegação direta
- [x] Gráficos de desempenho

## Financeiro - Contas a Pagar
- [x] Listagem com colunas: A Pagar / Em Aberto / Pago
- [x] Lançamento de pagamento com recorrência
- [x] Lançamento com parcelamento (informar quantidade de parcelas)
- [x] Centro de custo por obra/serviço
- [x] Filtros e busca

## Financeiro - Contas a Receber
- [x] Listagem com status
- [x] Lançamento com recorrência
- [x] Centro de custo por obra/serviço

## Financeiro - Centro de Custo
- [x] Cadastro de centros de custo (obras/serviços)
- [x] Relatório por centro de custo

## Clientes
- [x] Cadastro de clientes
- [x] Importação via planilha (CSV)

## Ordem de Compras
- [x] Cadastro de ordem de compras
- [x] Campo: pessoa responsável
- [x] Campo: setor destinado
- [x] Listagem e filtros

## CRM
- [x] Funil de vendas com estágios: 1ª tentativa / 2ª tentativa / 3ª tentativa / etc.
- [x] Kanban de leads por estágio
- [x] Cadastro e edição de leads

## Chat Interno
- [x] Lista de participantes para seleção
- [x] Envio e recebimento de mensagens
- [x] Histórico de conversas

## Agenda
- [x] Criação de compromissos por usuário
- [x] Visualização por usuário (cada um vê só os seus)
- [x] Calendário mensal/semanal

## Engenharia / Projetos
- [x] Aba dedicada de Engenharia/Projetos
- [x] Kanban de acompanhamento de fases da obra
- [x] Campos: fase, responsável, status, prazo

## Documentos
- [x] Upload e anexo de documentos
- [x] Vinculação a clientes, projetos, ordens de compra
- [x] Listagem e download

## Importação de Planilhas
- [x] Importação de clientes (CSV)
- [x] Importação de contas a pagar (CSV)
- [x] Importação de contas a receber (CSV)

## Relatórios
- [x] KPIs financeiros consolidados
- [x] Gráficos de contas a pagar/receber
- [x] Resumo de projetos por status

## Testes
- [ ] Testes unitários dos routers principais

## Painel de Administrador
- [x] Tabela de logs de atividade no banco de dados
- [x] Middleware de registro automático de ações
- [x] Router admin: listar/editar/bloquear usuários
- [x] Router admin: gerenciar permissões por role
- [x] Router admin: visualizar logs de atividade com filtros
- [x] Router admin: estatísticas do sistema (usuários ativos, ações recentes)
- [x] Página Admin: visão geral com KPIs de uso
- [x] Página Admin: tabela de usuários com ações (promover/rebaixar/bloquear)
- [x] Página Admin: logs de atividade com filtros e busca
- [x] Proteção de rota: apenas admins acessam o painel
- [x] Testes unitários do router admin

## Upload de Arquivos, Recorrências, Parcelamentos e Importação por Planilha
- [ ] Tabela de anexos (attachments) vinculada a contas a pagar/receber
- [ ] Tabela de recorrências (recurrences) para contas a pagar/receber
- [ ] Tabela de parcelas (installments) para contas a pagar/receber
- [ ] Router: upload de arquivo para S3 e salvar referência no banco
- [ ] Router: CRUD de recorrências (diária, semanal, mensal, anual)
- [ ] Router: CRUD de parcelamentos (N parcelas com datas calculadas)
- [ ] UI: componente de upload de arquivos em Contas a Pagar
- [ ] UI: componente de upload de arquivos em Contas a Receber
- [ ] UI: formulário de recorrência em Contas a Pagar
- [ ] UI: formulário de parcelamento em Contas a Pagar
- [ ] UI: formulário de recorrência em Contas a Receber
- [ ] UI: formulário de parcelamento em Contas a Receber
- [ ] Importação por planilha com modelo CSV para download: Contas a Pagar
- [ ] Importação por planilha com modelo CSV para download: Contas a Receber
- [ ] Importação por planilha com modelo CSV para download: Clientes
- [ ] Importação por planilha com modelo CSV para download: Ordem de Compras
- [ ] Importação por planilha com modelo CSV para download: CRM Leads
- [ ] Importação por planilha com modelo CSV para download: Agenda
