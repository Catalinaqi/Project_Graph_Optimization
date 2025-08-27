# Graph Optimization Backend

## Introduction
This backend system is designed to manage the **creation, execution, and evaluation of graph optimization models**.  
It supports authenticated user contributions for updating edge weights, simulating a **crowd-sourcing model** where users collaboratively refine optimization data.  

The system uses **Dijkstra’s shortest path algorithm** for graph optimization.  
All API endpoints are **secured with JWT authentication**.  

---

## Project Objective
- Enable users to **create graph optimization models** with node and edge weights.  
- Execute shortest path queries between nodes and return results with cost and execution time.  
- Provide a mechanism for **weight change requests**, which require model owner approval/rejection.  
- Support **version tracking** of graph models and their weights.  
- Allow **simulation of weight variations** to study the impact of incremental changes.  
- Implement a **token-based economy**, where each action consumes credits, managed via JWT-authenticated users.  
- Include **Admin functionality** to recharge tokens.  

---

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with RS256 algorithm  
  - Role-based access control (**User/Admin**)  
  - Secure password hashing with bcrypt  

- **Graph Model Management**
  - Create, retrieve, update, and delete graph models  
  - Token-based cost system:  
    - `0.20` per node  
    - `0.01` per edge  
  - Execution of shortest path queries using **Dijkstra**  
  - Automatic execution time tracking  

- **Weight Change Requests**
  - Submit edge weight updates (state: **Pending, Approved, Rejected**)  
  - Approval by model owner with **exponential smoothing**:  
    ```
    p(i,j) = α * p(i,j) + (1 - α) * p_new(i,j)
    ```
  - Configurable `α` in `.env` (default: 0.9)  

- **Model Versions**
  - Multiple versions tracked per model  
  - Filtering by modification date, node count, or edge count  

- **Simulations**
  - Simulate weight changes across a range with incremental steps  
  - Return full set of results + best configuration  
  - Validate inputs and ranges  

- **Token Management**
  - Users start with initial tokens (`INIT_USER_TOKENS`, default 100)  
  - Token costs apply to creation and execution  
  - Unauthorized requests when balance is insufficient  
  - **Admin-only token recharge route**  

- **Database & Persistence**
  - PostgreSQL with Sequelize ORM  
  - Transaction logging (`graph_token_transactions`)  
  - Seeder scripts with:  
    - At least 2 graph models  
    - Minimum 10 nodes & 15 edges each  
    - Multiple versions preloaded  

- **API Documentation**
  - Swagger/OpenAPI specification
    - Interactive API documentation is available at:
    - http://localhost:3000/api/docs/
  - Postman-ready endpoints  

---

## Technology Stack
- **Node.js** + **Express** – API framework  
- **TypeScript** – Type safety and maintainability  
- **Sequelize** – ORM for PostgreSQL  
- **PostgreSQL** – Relational database  
- **JWT (RS256)** – Authentication & authorization  
- **node-dijkstra** – Graph optimization algorithm  
- **Docker & Docker Compose** – Containerization  
- **Jest + Supertest** – Unit and integration testing  

---

## Installation

### Prerequisites
- Node.js >= 18  
- Docker & Docker Compose  
- PostgreSQL (optional if not using Docker)  

### Local Setup
```bash
npm install
npm run build
npm run start
````

### Environment Setup

Copy `.env.example` into `.env` and configure values:

* `INIT_USER_TOKENS=100`
* `ALPHA=0.9`
* Database connection settings
* JWT keys

### Generate JWT Keys

```bash
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key
```

### Docker Setup

```bash
docker-compose up --build
```

### Development Mode

```bash
npm run dev
```

---

## API Documentation

### Authentication

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/api/auth/register`  | Register a new user        |
| POST   | `/api/auth/login`     | Login user                 |
| GET    | `/api/users/me`       | Get user profile           |
| POST   | `/api/users/recharge` | Admin recharge user tokens |

### Graph Models

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| POST   | `/api/models`             | Create new model    |
| POST   | `/api/models/:id/execute` | Execute model query |
| GET    | `/api/models/:id`         | Get model details   |

### Weight Change Requests

| Method | Endpoint                                                          | Description                   |
| ------ | ----------------------------------------------------------------- | ----------------------------- |
| POST   | `/api/models/:id/weight-change`                                   | Submit weight change request  |
| GET    | `/api/models/:id/weight-change?state=pending&fromDate=YYYY-MM-DD` | Filter requests by state/date |
| PATCH  | `/api/models/:id/weight-change/:requestId/approve`                | Approve request               |
| PATCH  | `/api/models/:id/weight-change/:requestId/reject`                 | Reject request                |

### Model Versions

| Method | Endpoint                                             | Description           |
| ------ | ---------------------------------------------------- | --------------------- |
| GET    | `/api/models/:id/versions?nodeCount=12&edgeCount=20` | Filter model versions |

### Simulations

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | `/api/models/:id/simulate` | Run simulation on edges |

---

## Example Requests

### Create Model

```http
POST /api/models
```

```json
{
  "name": "City_Routes",
  "nodes": ["A", "B", "C"],
  "edges": {
    "A": { "B": 1, "C": 2 },
    "B": { "C": 1 }
  }
}
```

### Execute Model

```http
POST /api/models/1/execute
```

```json
{
  "start": "A",
  "goal": "C"
}
```

### Simulation

```http
POST /api/models/1/simulate
```

```json
{
  "from": "A",
  "to": "B",
  "start": 1,
  "stop": 2,
  "step": 0.1,
  "origin": "A",
  "goal": "C"
}
```

---

## Database Structure

Entities include:

* **Users** – with roles and tokens
* **Graph Models** – nodes, edges, versions
* **Weight Change Requests** – pending/approved/rejected
* **Simulations** – simulation runs and results
* **Token Transactions** – track token balance history

Seeders provide:

* 1 Admin user, multiple standard users
* Initial graph models (≥ 10 nodes, ≥ 15 edges)
* At least 2 versions each

---

## Layered Architecture

The system follows a **layered architecture** with strict separation of concerns:

```
+-----------------+        ← Route definitions
|     Router      |
+-----------------+
|   Controllers   |        ← Request handling
+-----------------+
|    Services     |        ← Business logic (tokens, Dijkstra, validation)
+-----------------+
|  Repositories   |        ← Data access abstraction
+-----------------+
|       DAO       |        ← Database operations
+-----------------+
|     Models      |        ← Data schema and structures
+-----------------+
```

**Workflow**

1. **Router** – Maps API endpoints.
2. **Controllers** – Handle HTTP input/output.
3. **Services** – Apply business rules (token deduction, graph execution).
4. **Repositories** – Abstract persistence logic.
5. **DAO** – Perform database queries/transactions.
6. **Models** – Sequelize schemas.

---

## Design Patterns

* **Repository Pattern**
  Abstracts database access, isolating business logic from Sequelize.

* **Factory Pattern**
  Used for dynamic initialization (e.g., JWT strategy, services).

* **Command Pattern**
  Encapsulates requests like **model creation, execution, weight updates**, ensuring consistent handling.

* **Middleware Pattern**
  Provides reusable layers for authentication, error handling, validation, and logging.

---

## Design

### Actors

* **User** – Creates/executes models, submits weight changes, runs simulations.
* **Admin** – Manages tokens, approves/rejects requests.
* **System** – Executes shortest path algorithm, manages versions and persistence.

### Use Cases

* Register/login user
* Create graph model
* Execute model (Dijkstra shortest path)
* Submit weight change request
* Approve/reject weight change
* Run simulations
* Admin recharge tokens

### Sequence Diagrams

* User authentication flow
* Model creation + token deduction
* Execution of shortest path with Dijkstra
* Weight change request lifecycle
* Simulation workflow