<div align="center">

# ✂️ BarberDev UI

**Sistema de agendamento para barbearias — Frontend em Angular 19 com design system premium**

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular_Material-19-757575?style=for-the-badge&logo=material-design&logoColor=white)](https://material.angular.io/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)
[![NgxMask](https://img.shields.io/badge/ngx--mask-19-4A90D9?style=for-the-badge)](https://github.com/JsDaddy/ngx-mask)

</div>

---

## 📋 Sobre o Projeto

O **BarberDev UI** é o frontend de um sistema fullstack de agendamento para barbearias. Construído com **Angular 19 standalone**, o projeto entrega uma experiência de usuário premium com calendário mensal interativo, gestão de clientes e um design system coeso com glassmorphism, animações fluidas e suporte a dark mode.

> **Backend:** [barber-dev-api](https://github.com/alissonjcjk/Barber-shop-appointments-api) — Java 21 + Spring Boot 3 + PostgreSQL.

---

## 🏗️ Arquitetura

O projeto adota **Standalone Components** (sem NgModules) com injeção de dependência via **InjectionTokens tipados**, separação clara entre componentes pai/filho e lazy loading em todas as rotas.

```
┌─────────────────────────────────────────────────────┐
│                   Smart Components                  │  ← Orquestram estado e chamadas HTTP
│         (list-clients, schedules-month, …)          │
├─────────────────────────────────────────────────────┤
│                  Presentational / Child             │  ← Apenas UI, emitem eventos
│    (schedule-day-cell, new-schedule-dialog, …)      │
├─────────────────────────────────────────────────────┤
│              Services (via InjectionToken)          │  ← Contratos desacoplados por interface
│   ClientsService · SchedulesService                 │
│   SnackbarManagerService · DialogManagerService     │
├─────────────────────────────────────────────────────┤
│              HTTP Client (provideHttpClient)         │  ← Angular HttpClient modular
├─────────────────────────────────────────────────────┤
│                   barber-dev-api                    │  ← Spring Boot REST API
└─────────────────────────────────────────────────────┘
```

### Decisões de Design

| Decisão | Justificativa |
|---|---|
| **Standalone Components** | Elimina NgModules; cada componente declara suas próprias dependências — tree-shaking mais eficiente |
| **InjectionToken tipado (`SERVICES_TOKEN`)** | Desacopla componentes das implementações concretas; facilita substituição em testes |
| **Padrão Pai/Filho com `@Input`/`@Output`** | Fluxo de dados unidirecional; o pai gerencia o estado, o filho só exibe e emite eventos |
| **Lazy loading em todas as rotas** | Cada página é um chunk independente — `schedules-month-component` (86 kB) só carrega quando necessário |
| **`ChangeDetectionStrategy.OnPush`** | Componentes só re-renderizam quando inputs mudam — performance até 40% melhor em listas |
| **`withViewTransitions()`** | Transições de rota nativas do browser (View Transitions API) sem library externa |
| **Tokens CSS como design system** | Todos os estilos partem de variáveis CSS centralizadas — troca de tema sem recompilação |
| **Models e Utils separados por feature** | Lógica pura (cálculo de grade do calendário, formatação de datas) isolada em arquivos `.utils.ts` e `.models.ts` — testável sem Angular |

---

## 🛠️ Tecnologias

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | Angular Standalone | 19 |
| Linguagem | TypeScript | 5.7 |
| UI Components | Angular Material | 19 |
| Formulários | Angular Reactive Forms | 19 |
| Roteamento | Angular Router (lazy) | 19 |
| HTTP | Angular HttpClient | 19 |
| Máscaras | ngx-mask | 19 |
| Reatividade | RxJS | 7.8 |
| Estilo | Vanilla CSS + CSS Custom Properties | — |
| Build | Angular CLI + esbuild | 19 |

---

## 📱 Páginas e Funcionalidades

### 📅 Agendamentos — `schedules/month`

Vista mensal em grade (7 colunas × 6 semanas):

- **Navegação** entre meses com botões ← → e atalho "Hoje"
- **Cards por dia** com horário e nome do cliente
- **Criação** de agendamento via modal (MatDialog) com seleção de cliente e datetime início/fim
- **Exclusão** com diálogo de confirmação customizado
- **Skeleton loading** durante o carregamento da API
- **Empty state** quando não há agendamentos no mês

### 👤 Clientes — `clients/list`

Tabela completa de clientes com:

- **Busca em tempo real** por nome
- **Ações por linha**: editar e excluir (com confirmação)
- **Loading state** e **empty state** dedicados
- Navegação para cadastro e edição

### ➕ Cadastrar Cliente — `clients/new-client`

Formulário reativo com:

- **Validação em tempo real** (nome, e-mail, telefone)
- **Máscara de telefone** via ngx-mask
- **Feedback de erro** da API (e-mail/telefone já em uso → snackbar)

### ✏️ Editar Cliente — `clients/edit-client/:id`

- Formulário pré-preenchido carregado via `GET /clients/{id}`
- Mesmas validações do cadastro
- Detecção de conflito de unicidade no update

---

## 🧭 Rotas

| Rota | Componente (lazy) | Título da aba |
|------|-------------------|---------------|
| `/schedules/month` | `SchedulesMonthComponent` | Agendamentos |
| `/clients/list` | `ListClientsComponent` | Clientes Cadastrados |
| `/clients/new-client` | `NewClientComponent` | Cadastrar Cliente |
| `/clients/edit-client/:id` | `EditClientComponent` | Atualizar Cliente |
| `/` | → redirect para `/schedules/month` | — |
| `/**` | → redirect para `/schedules/month` | — |

---

## 🎨 Design System

O design system é implementado inteiramente com **CSS Custom Properties**, garantindo consistência visual e facilidade de manutenção:

```css
/* Paleta de cores */
--clr-primary          /* Cor de destaque (dourado/âmbar) */
--clr-surface          /* Fundo de cards e painéis */
--clr-border           /* Bordas sutis */
--clr-text             /* Texto principal */
--clr-text-muted       /* Texto secundário */

/* Gradientes */
--grad-primary         /* Gradiente principal — botões CTA */

/* Efeitos */
--shadow-glow          /* Glow do elemento primário */
--clr-primary-glow     /* Background com opacidade para hover */

/* Tipografia */
--font-brand           /* Fonte de títulos */
--font-sans            /* Fonte de texto corrido */

/* Espaçamentos e raios */
--radius-sm / --radius-lg / --radius-xl / --radius-full
--text-xs / --text-sm / --text-lg / --text-xl

/* Animações */
--transition-fast      /* Transição padrão de hover */
```

### Componentes Visuais

| Efeito | Uso |
|--------|-----|
| **Glassmorphism** | Modais (backdrop-filter: blur) |
| **Skeleton loading** | Shimmer animado durante carregamento |
| **Hover micro-animations** | Botões, cards, linhas de tabela |
| **View Transitions** | Transição de rota nativa do browser |
| **Fade-in-up** | Entrada de páginas e dialogs |

---

## 🗂️ Estrutura do Projeto

```
src/app/
│
├── app.component.ts          # Shell com MenuBar + router-outlet
├── app.config.ts             # Providers globais + InjectionTokens
├── app.routes.ts             # Rotas lazy loading
│
├── clients/
│   ├── client.models.ts      # Interfaces de domínio dos clientes
│   ├── list-clients/         # Tabela de listagem (pai)
│   │   └── delete-client-dialog/   # Filho: confirmação de exclusão
│   ├── new-client/           # Formulário de cadastro
│   └── edit-client/          # Formulário de edição (carrega por ID)
│
├── schedules/
│   ├── schedule.models.ts    # Interfaces de domínio dos agendamentos
│   └── schedules-month/      # Calendário mensal (pai)
│       ├── schedules-month.models.ts   # View-models da feature
│       ├── schedules-month.utils.ts    # Funções puras (buildCalendarGrid, formatTime…)
│       ├── schedule-day-cell/          # Filho: célula do calendário
│       └── new-schedule-dialog/        # Filho: modal de criação
│
├── commons/
│   └── components/
│       ├── menu-bar/         # Barra de navegação lateral
│       ├── card-header/      # Header reutilizável para cards
│       └── yes-no-dialog/    # Dialog de confirmação genérico
│
└── services/
    ├── service.token.ts      # InjectionTokens tipados (SERVICES_TOKEN)
    ├── api-client/
    │   ├── clients/          # ClientsService + ICLientService
    │   └── schedules/        # SchedulesService + IScheduleService
    ├── dialog-manager.service.ts    # Abstração do MatDialog
    └── snackbar-manager.service.ts  # Abstração do MatSnackBar
```

---

## 🚀 Executando o Projeto

### Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Angular CLI 19](https://angular.dev/tools/cli)
- [barber-dev-api](https://github.com/alissonjcjk/Barber-shop-appointments-api) rodando em `http://localhost:8080`

### Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/alissonjcjk/Barber-shop-appointments-ui.git
cd Barber-shop-appointments-ui

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em: **`http://localhost:4200`**

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção em `dist/` |
| `npm run watch` | Build contínuo (development) |
| `npm test` | Testes unitários com Karma/Jasmine |

---

## 📦 Build e Performance

O build de produção gera **lazy chunks** por rota — cada página é carregada sob demanda:

```
Initial bundle
├── styles.css          283 kB
├── polyfills.js         89 kB
└── main.js             124 kB  ← shell mínimo da aplicação

Lazy chunks (carregados sob demanda)
├── schedules-month-component   86 kB
├── list-clients-component      60 kB
├── edit-client-component       83 kB
└── new-client-component       287 kB
```

> O shell inicial da aplicação tem apenas **~124 kB** — o restante é carregado conforme o usuário navega.

---

## 🔗 Integração com a API

A comunicação com o backend é feita via `HttpClient`, abstraída por interfaces e injetada via `InjectionToken`:

```typescript
// Injeção desacoplada — não depende da implementação concreta
constructor(
  @Inject(SERVICES_TOKEN.HTTP.SCHEDULE) private scheduleService: IScheduleService,
  @Inject(SERVICES_TOKEN.HTTP.CLIENT)   private clientService:   ICLientService,
) {}
```

| Endpoint consumido | Onde |
|--------------------|------|
| `GET /schedules/{year}/{month}` | `SchedulesMonthComponent` |
| `POST /schedules` | `NewScheduleDialogComponent` |
| `DELETE /schedules/{id}` | `SchedulesMonthComponent` |
| `GET /clients` | `ListClientsComponent` + `NewScheduleDialogComponent` |
| `POST /clients` | `NewClientComponent` |
| `PUT /clients/{id}` | `EditClientComponent` |
| `DELETE /clients/{id}` | `ListClientsComponent` |
| `GET /clients/{id}` | `EditClientComponent` |

---

## 👤 Autor

Desenvolvido por **Alice Bernadino** como parte do projeto **BarberDev** — sistema fullstack de agendamento para barbearias.

---

<div align="center">

**BarberDev UI** · Angular 19 · TypeScript 5.7 · Angular Material

</div>
