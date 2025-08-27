# tsconfig.json Documentation

The `tsconfig.json` file is the TypeScript compiler configuration.  
It is similar to how `pom.xml` (Maven) or `build.gradle` (Gradle) configure the Java compiler.

In Java you configure:

- Java version (`sourceCompatibility`, `targetCompatibility`)
- Source directory (`src/main/java`)
- Output directory (`target/classes`)
- Compiler flags (`-Xlint`, `-parameters`, etc.)
- Dependencies

In TypeScript, `tsconfig.json` does the same for the TypeScript compiler (`tsc`).

---

## File structure

### compilerOptions

- **target: es6**  
  Output JavaScript version (similar to `targetCompatibility` in Java).

- **module: commonjs**  
  Module system for Node.js (similar to how Java modules/packages work).

- **rootDir: src**  
  Location of TypeScript source files (like `src/main/java` in Java).

- **baseUrl: src**  
  Base directory for non-relative imports (enables cleaner imports).

- **outDir: dist**  
  Output folder for compiled JavaScript (like `target/classes` in Java).

- **strict: true**  
  Enables strict type-checking (similar to `-Xlint:all` in Java).

- **esModuleInterop: true**  
  Allows interoperability between ES modules and CommonJS modules.

- **forceConsistentCasingInFileNames: true**  
  Enforces consistent file name casing (important on Linux).

- **skipLibCheck: true**  
  Skips type checking for `.d.ts` files (like ignoring external `.jar` bytecode in Java).

- **moduleResolution: node**  
  Resolves modules the same way Node.js does.

- **resolveJsonModule: true**  
  Allows importing `.json` files as modules.

- **paths**
  - `@/*` → Path alias to `src`
  - `@types/*` → Alias for custom types under `src/@types`

- **typeRoots**  
  Defines where to look for type definitions, similar to Java classpaths:
  - `./src/@types` (project-specific types)
  - `./node_modules/@types` (external libraries)

---

### include

- `src/**/*`  
  Include all source files under `src` (like Maven compiling `src/main/java`).

---

### exclude

Folders and files excluded from compilation:

- `eslint.config.js`, `commitlint.config.js`, `jest.setup.js` → tooling configs
- `test` → test directory (like `src/test/java`)
- `node_modules` → external dependencies
- `dist` → build output directory

---

## Java vs TypeScript configuration

| Concept                  | Java (Maven/Gradle)                          | TypeScript (`tsconfig.json`)                      |
| ------------------------ | -------------------------------------------- | ------------------------------------------------- |
| Java version             | `sourceCompatibility`, `targetCompatibility` | `"target": "es6"`                                 |
| Source directory         | `src/main/java`                              | `"rootDir": "src"`                                |
| Output directory         | `target/classes`                             | `"outDir": "dist"`                                |
| Compiler flags           | `-Xlint:all`                                 | `"strict": true`                                  |
| Dependencies             | `<dependency>` in `pom.xml`                  | `node_modules` + `typeRoots`                      |
| Package import shortcuts | Not supported (must use full package name)   | `"baseUrl" + "paths"` allow aliases (`@/service`) |

---

## Summary

- `tsconfig.json` plays the same role as `pom.xml` or `build.gradle` for Java.
- It defines **input/output folders, language level, module resolution, and type-checking rules**.
- It also enables advanced features like **path aliases**, which in Java would require using a custom classpath or IDE support.
