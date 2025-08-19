# package.json Documentation

This file explains the purpose of each section inside `package.json`.

---

## Metadata
- **name**: Project name
- **version**: Project version
- **main**: Entry point for Node.js runtime

---

## Scripts
Automation tasks used during development and deployment:

- **migrate** → Run database migrations
- **migrate:undo** → Undo last migration
- **db:seed-admin** → Seed initial admin user into the database
- **db:seed:all** → Run all seeders
- **db:seed:undo:all** → Undo all seeds
- **lint** → Run ESLint check
- **lint:fix** → Fix linting issues automatically
- **format** → Format code with Prettier
- **format:check** → Verify code formatting
- **test** → Run unit tests with Jest
- **keys** → Generate JWT keys
- **keys:force** → Force regenerate JWT keys
- **dev** → Start development server with hot reload
- **build** → Compile TypeScript and fix path aliases
- **prestart** → Generate keys before starting the app
- **start** → Start production server

---

## Dependencies
Libraries required for the application to run:

- **dotenv** → Load environment variables
- **express** → Web framework
- **http-status-codes** → Standard HTTP status codes
- **jsonwebtoken** → JWT authentication
- **node-dijkstra** → Graph optimization algorithms
- **pg** / **pg-hstore** → PostgreSQL driver and serializer
- **sequelize** → ORM for PostgreSQL
- **swagger-jsdoc** / **swagger-ui-express** → API documentation
- **uuid** → Generate unique IDs
- **zod** → Data validation

---

## DevDependencies
Libraries required only during development and testing:

- **@types/...** → TypeScript type definitions
- **@typescript-eslint/...** → ESLint support for TypeScript
- **bcrypt** → Password hashing
- **cors** → CORS middleware for Express
- **eslint** → Code linting
- **eslint-plugin-import** → Rules for import statements
- **jest** → Testing framework
- **joi** → Data validation (alternative to Zod)
- **prettier** → Code formatter
- **sequelize-cli** → CLI tool for Sequelize
- **supertest** → HTTP assertions for testing
- **ts-jest** → Jest + TypeScript integration
- **ts-node** → Run TypeScript directly
- **ts-node-dev** → Development server with hot reload
- **tsc-alias** / **tsconfig-paths** → Support for TypeScript path aliases
- **winston** → Logging library

---
