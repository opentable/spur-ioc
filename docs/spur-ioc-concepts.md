# Dependency Injection in Spur Framework

## Overview

This document explains how dependency injection (DI) works in the Spur Framework ecosystem. Dependency injection is a design pattern where objects receive their dependencies from an external source rather than creating them internally. This pattern enables modular, testable, and maintainable code by decoupling components and their dependencies.

## What is Dependency Injection?

Dependency Injection (DI), also known as Inversion of Control (IoC), is a pattern where:

1. **Dependencies are declared, not created**: Components declare what they need through function parameters or constructor arguments
2. **Dependencies are provided externally**: A container or injector is responsible for providing dependencies
3. **Dependencies are resolved by name**: The injector matches dependency names to registered implementations

### Benefits

- **Modularity**: Components are loosely coupled and can be easily replaced
- **Testability**: Dependencies can be easily mocked or substituted in tests
- **Maintainability**: Changes to dependencies don't require changes to dependent code
- **Clarity**: Dependencies are explicit and visible in function signatures

## How spur-ioc Implements Dependency Injection

`spur-ioc` is the foundational dependency injection container for the Spur Framework. It provides:

- **Automatic dependency discovery** from file system structure
- **Name-based dependency resolution** by parsing function arguments
- **Lazy resolution** - dependencies are resolved only when needed
- **Composition patterns** for combining multiple injectors
- **Error detection** for missing or cyclic dependencies

## Dependency Discovery

### Folder-Based Auto-Discovery

The primary mechanism for discovering dependencies is through folder registration. When you register folders, `spur-ioc`:

1. **Scans specified directories** recursively for JavaScript files
2. **Extracts module names** from filenames (without extension), maintaining the original casing
3. **Registers modules** as resolvable dependencies
4. **Flattens registration by filename** - all files are registered by their filename only, regardless of directory structure

**Important**: Registration is **flattened by filename**, meaning the directory structure is **not** preserved in dependency names. All files are registered using only their filename (without extension).

**Example Structure:**
```
src/
  runtime/
    WebServer.js      → registered as "WebServer"
    Database.js       → registered as "Database"
  domain/
    Book.js           → registered as "Book"
    mappers/
      BookMapper.js   → registered as "BookMapper"
  utils/
    webServer.js      → registered as "webServer" (different from "WebServer"!)
```

**Casing is preserved**: Because casing is maintained, `WebServer.js` and `webServer.js` are registered as **different dependencies** (`"WebServer"` vs `"webServer"`). This allows you to have multiple files with similar names that differ only in casing, though this is generally not recommended for clarity.

**Nested folders are flattened:**
```
src/
  runtime/
    WebServer.js      → registered as "WebServer"
  overrides/
    WebServer.js      → registered as "WebServer" (conflict - same name!)
```

### Name Conflicts and Overwrites

Conflicts can occur in two scenarios: **within a single injector** (folder registration) and **when merging injectors**.

#### Conflicts Within a Single Injector

Because registration is flattened by filename, **files with the same name in different directories will conflict**:

- Only **one dependency** with a given name can exist in the injector
- When multiple files share the same filename (including casing), the **last one processed** wins
- The processing order depends on the order folders are registered
- A **console warning** is emitted when a dependency is overwritten
- **Casing matters**: `WebServer.js` and `webServer.js` are different dependencies and will not conflict

**Example conflict within injector:**
```javascript
// Registering these folders:
ioc.registerFolders(__dirname, [
  'runtime',    // WebServer.js registered first
  'overrides'   // WebServer.js overwrites the first one (with warning)
]);
```

#### Conflicts When Merging Injectors

Conflicts also occur **when merging multiple injectors** that register dependencies with the same name:

- When two packages both register a dependency with the same name, merging them will cause a conflict
- The **last injector merged** wins - its dependency overwrites the previous one
- A **console warning** is emitted when a dependency is overwritten during merge
- The merge order determines which dependency survives

**Example conflict during merge:**
```javascript
// Package 1's injector
const package1Ioc = Package1Injector();
// Registers: WebServer, Database, Logger

// Package 2's injector
const package2Ioc = Package2Injector();
// Also registers: WebServer (different implementation)

// Application injector
const appIoc = ApplicationInjector();
appIoc.merge(package1Ioc);  // WebServer from package1 registered
appIoc.merge(package2Ioc);  // WebServer from package2 overwrites package1 (with warning)
// Result: Only package2's WebServer exists
```

**Implications:**
- All registered files must have **unique filenames** across all registered directories
- When merging packages, ensure they don't register conflicting dependency names
- Directory structure is for organization only, not for dependency namespacing
- Use descriptive, unique filenames to avoid conflicts
- Be aware of merge order when combining multiple package injectors

### Module Signature Convention

All auto-discovered modules must follow a specific pattern:

```javascript
module.exports = function(Dependency1, Dependency2, ...) {
  // Module implementation
  return {
    // Exported functionality
  };
}
```

The function parameters declare the module's dependencies. The injector will:
- Parse the function signature to extract dependency names
- Resolve each dependency by matching names
- Invoke the function with resolved dependencies
- Cache the result for subsequent injections

## Dependency Registration

Dependencies can be registered in three ways:

### 1. External Dependencies

External Node.js modules, global objects, or pre-constructed instances:

```javascript
ioc.registerDependencies({
  'express': require('express'),
  'path': require('path'),
  'console': console,
  'nodeProcess': process
});
```

These are registered as **immediate instances** - they're available immediately without resolution.

### 2. Folder Auto-Discovery

Automatic registration of modules from file system (see [Dependency Discovery](#dependency-discovery) for detailed information):

```javascript
ioc.registerFolders(__dirname, [
  'runtime',
  'domain',
  'services'
]);
```

These are registered as **resolvable dependencies** - they require resolution when first accessed.

### 3. Manual Registration

Explicit registration of individual dependencies:

```javascript
// Pre-constructed instance
ioc.addDependency('MyService', myServiceInstance);

// Resolvable function
ioc.addResolvableDependency('MyService', function(Dependency1, Dependency2) {
  return new MyService(Dependency1, Dependency2);
});
```

## Dependency Resolution

### Resolution Process

When a dependency is requested (through injection), the resolver:

1. **Checks the dependency registry** for the named dependency
2. **Validates existence** - throws error if missing
3. **Checks for cached instance** - returns if already resolved
4. **Detects cycles** - prevents infinite recursion
5. **Resolves dependencies recursively** - resolves all dependencies of the dependency
6. **Invokes the factory function** - calls the module function with resolved dependencies
7. **Caches the result** - stores the instance for future use
8. **Returns the instance** - provides the resolved dependency

### Name-Based Matching

Dependencies are matched by **exact name** between:
- Function parameter names in module signatures
- Registered dependency names in the container

**Example:**
```javascript
// Registered as "BookMapper"
module.exports = function(Book, Database) {
  // Book and Database must be registered with those exact names
}
```

### Resolution Timing

Dependency resolution happens **synchronously at application startup**:

- All dependencies are resolved when `inject()` is called
- Resolution completes before the application runs
- The injector is "disposed" after resolution (for performance)
- This means `$injector` helper can only be used synchronously during startup

### Error Detection

The resolver detects and reports:

- **Missing Dependencies**: When a required dependency isn't registered
- **Cyclic Dependencies**: When dependencies form circular references
- **Resolution Exceptions**: When factory functions throw errors

Errors include call chains showing the dependency path, making debugging easier.

## Dependency Composition

### How Dependencies Are Stitched Together

The injector creates a **dependency graph** where:

1. **Root dependencies** are requested in `inject()` calls
2. **Dependency chains** are built by following function parameters
3. **Shared dependencies** are resolved once and reused
4. **Dependency order** is determined by the resolution algorithm

**Example Flow:**
```
inject(WebServer)
  → WebServer needs Database, Router
    → Database needs ConnectionPool
      → ConnectionPool needs Config
    → Router needs Routes, Middleware
      → Routes needs RouteBuilder
```

All dependencies are resolved in the correct order, with each dependency receiving its required dependencies.

### Dependency Lifecycle

1. **Registration Phase**: Dependencies are registered in the container
2. **Resolution Phase**: Dependencies are resolved when first accessed
3. **Caching Phase**: Resolved instances are cached
4. **Usage Phase**: Application code uses resolved instances

Dependencies are **singletons by default** - each dependency name resolves to a single instance that is reused throughout the application.

## Multiple Injectors and Module Composition

### Injector Isolation

Each injector maintains its own:
- Dependency registry
- Resolution state
- Namespace

This allows creating **modular injectors** that can be composed together.

### Composition Patterns

#### 1. Merge Pattern

Combines multiple injectors into a single namespace:

```javascript
const coreIoc = CoreUtilitiesInjector();
const appIoc = MyAppInjector();

appIoc.merge(coreIoc);
// All dependencies from both injectors are now in appIoc
```

**Characteristics:**
- Single shared namespace
- Dependencies can overwrite each other (with warnings)
- All dependencies are accessible to all modules

#### 2. Link + Expose Pattern

Links injectors while maintaining namespace separation:

```javascript
// In CoreApisInjector
ioc.expose(['UsersAPI', 'ProjectsAPI']);

// In MyAppInjector
ioc.link(CoreApisInjector());
// Only UsersAPI and ProjectsAPI are available
```

**Characteristics:**
- Separate namespaces per injector
- Only explicitly exposed dependencies are accessible
- Private dependencies remain isolated
- Supports selective API exposure

### Exposure Mechanisms

Dependencies can be exposed using:

- **Array**: `ioc.expose(['Dep1', 'Dep2'])` - explicit list
- **Regex**: `ioc.expose(/.+API$/)` - pattern matching
- **All**: `ioc.exposeAll()` - expose everything

### Use Cases

- **Library Packages**: Expose public APIs while keeping internals private
- **Modular Applications**: Compose features from separate injectors
- **Shared Utilities**: Merge common utilities into application injectors
- **Plugin Systems**: Link plugin injectors with controlled exposure

## Package Boundaries and Composition Patterns

Understanding how packages compose together is crucial for working with the Spur Framework ecosystem. This section explains the conceptual boundaries, dependency relationships, and patterns used when building layered applications.

### Package Boundaries

Each Spur package defines a **boundary** - a clear separation of responsibilities and dependencies. Packages can be categorized by their role and how they relate to other packages through **hard** or **soft dependencies**.

#### Foundation Packages

**Foundation packages** provide base functionality that other packages build upon:

- **Purpose**: Provide fundamental utilities, wrappers, and common dependencies
- **Dependencies**: Typically only external Node.js modules and system dependencies
- **Pattern**: Use **merge pattern** - all dependencies are available
- **Example**: A package that provides logging, HTTP clients, and system utilities

**Characteristics:**
- No dependencies on other Spur packages (or minimal)
- Provides reusable utilities
- Wraps external libraries (promisification, API enhancements)
- Acts as a foundation layer
- **Dependency Type**: Typically have **hard dependencies** on external Node.js modules only

#### Specialized Packages

**Specialized packages** build on foundation packages to provide domain-specific functionality:

- **Purpose**: Provide specialized features (web frameworks, database layers, etc.)
- **Dependencies**: Have **soft dependencies** on foundation packages
- **Pattern**: Use **merge pattern** but assume foundation dependencies exist
- **Example**: A package that provides web server infrastructure, assuming logging and utilities exist

**Characteristics:**
- **Soft dependencies** on foundation packages (see [Hard vs Soft Dependencies](#hard-vs-soft-assumed-dependencies) below)
- Modules use dependencies from foundation packages
- Extends or wraps foundation functionality
- Provides domain-specific abstractions
- Do not merge foundation packages internally - assume application will merge them first

#### Application Code

**Application code** uses both foundation and specialized packages:

- **Purpose**: Implements business logic and application-specific functionality
- **Dependencies**: Merges both foundation and specialized packages
- **Pattern**: Uses **merge pattern** to combine all packages
- **Example**: Controllers, services, and business logic modules

**Characteristics:**
- Merges multiple package injectors
- Implements application-specific logic
- Extends base classes from specialized packages
- Uses dependencies from all merged packages

### Layered Composition Pattern

The most common pattern in Spur applications is **layered composition**, where packages are merged in a specific order to build up functionality:

```
┌─────────────────────────────────────┐
│     Application Injector            │
│  (Merges all layers)                │
├─────────────────────────────────────┤
│  Layer 3: Application Modules      │
│  - Controllers                      │
│  - Services                         │
│  - Business Logic                   │
├─────────────────────────────────────┤
│  Layer 2: Specialized Packages      │
│  - Web Framework                    │
│  - Database Layer                   │
│  (Soft depends on Layer 1)           │
├─────────────────────────────────────┤
│  Layer 1: Foundation Packages       │
│  - Common Utilities                 │
│  - HTTP Clients                     │
│  - Logging                          │
└─────────────────────────────────────┘
```

**Composition Flow:**
```javascript
// Layer 1: Foundation
const foundationIoc = FoundationPackage();
// Registers: Logger, HTTPClient, Utils, Promise, etc.

// Layer 2: Specialized (assumes Layer 1 exists)
const specializedIoc = SpecializedPackage();
// Modules use: Logger, Promise from Layer 1
// Registers: WebServer, BaseController, etc.

// Layer 3: Application (uses both)
const appIoc = ApplicationInjector();
appIoc.merge(foundationIoc);      // Merge foundation first
appIoc.merge(specializedIoc);     // Then specialized
appIoc.registerFolders(__dirname, ['app']); // Then app modules
```

### Dependency Flow Across Boundaries

When packages are merged, dependencies flow across boundaries:

**Foundation Package:**
```javascript
// Foundation package registers dependencies
ioc.registerDependencies({
  'Logger': loggerInstance,
  'Promise': bluebird
});

ioc.registerFolders(__dirname, ['utils']);
// Registers: Logger, Promise, Utils
```

**Specialized Package (assumes foundation exists):**
```javascript
// Specialized package modules use foundation dependencies
module.exports = function(Logger, Promise, BaseUtility) {
  // Uses Logger and Promise from foundation
  // Uses BaseUtility from foundation
  return {
    // Specialized functionality
  };
};
```

**Application (merges both):**
```javascript
// Application merges both, creating shared namespace
ioc.merge(foundationIoc);    // Foundation dependencies available
ioc.merge(specializedIoc);   // Specialized can use foundation deps
ioc.registerFolders(__dirname, ['app']); // App can use both
```

### Boundary Responsibilities

Each package boundary has clear responsibilities:

#### Foundation Package Responsibilities

- **Register external libraries**: Make Node.js modules injectable
- **Provide wrappers**: Wrap external libraries with enhancements
- **System dependencies**: Register system globals (console, process, etc.)
- **Common utilities**: Provide reusable utility modules
- **No assumptions**: Should not assume other Spur packages exist

#### Specialized Package Responsibilities

- **Extend foundation**: Build on foundation package dependencies
- **Domain abstractions**: Provide domain-specific base classes
- **Convention patterns**: Implement convention-based discovery
- **Soft dependencies**: Assume foundation packages are merged first
- **Clear boundaries**: Should not merge dependencies internally

#### Application Responsibilities

- **Compose packages**: Merge foundation and specialized packages
- **Order matters**: Merge in correct order (foundation → specialized → app)
- **Business logic**: Implement application-specific functionality
- **Extend base classes**: Extend base classes from specialized packages
- **Use all dependencies**: Access dependencies from all merged packages

### Real-World Pattern Example

While keeping this conceptual, here's how the pattern manifests:

**Foundation Package (like spur-common):**
- Provides: Logger, HTTP clients, system utilities, promise wrappers
- Registers: External libraries (bluebird, superagent, etc.)
- No dependencies on other Spur packages

**Specialized Package (like spur-web):**
- Provides: Web server base classes, controllers, middleware
- Assumes: Logger, Promise, utilities from foundation exist
- Registers: Express ecosystem dependencies
- Soft dependency on foundation package

**Application:**
- Merges: Foundation → Specialized → Application modules
- Uses: All dependencies from merged packages
- Implements: Controllers extending base classes, business logic

### Hard vs Soft (Assumed) Dependencies

When analyzing how Spur Framework packages relate to each other, it's important to understand the distinction between **hard dependencies** and **soft (assumed) dependencies**.

#### Hard Dependencies

A **hard dependency** is a package that is:
- Listed in `package.json` `dependencies` (not `devDependencies`)
- Required at runtime for the package to function
- Automatically installed when the package is installed
- The package may merge or use the dependency's injector internally

**Example:**
```javascript
// Package A's package.json
{
  "dependencies": {
    "spur-common": "^4.0.0"  // Hard dependency
  }
}

// Package A's injector.js
const spurCommon = require('spur-common');

module.exports = function() {
  const ioc = spur.create('package-a');
  ioc.merge(spurCommon());  // Merges internally
  return ioc;
};
```

#### Soft (Assumed) Dependencies

A **soft dependency** (also called an **assumed dependency**) is a package that:
- Is **not** listed in `package.json` `dependencies` (typically in `devDependencies`)
- Is expected to be provided by the consuming application at runtime
- Must be merged by the application **before** the package that assumes it
- The package's modules use dependencies from the assumed package, but don't merge it themselves
- **In `devDependencies` for testing**: The soft dependency is included in `devDependencies` so the package can execute during tests (tests need to merge the assumed package to run)

**Example:**
```javascript
// Package B's package.json
{
  "devDependencies": {
    "spur-common": "^4.0.0"  // In devDependencies = soft dependency
    // Needed here so Package B's tests can merge spur-common and execute
  }
  // Note: NOT in dependencies (application must provide it at runtime)
}

// Package B's modules use spur-common dependencies
module.exports = function(Logger, Promise) {
  // Uses Logger and Promise from spur-common
  // But assumes they're already in the injector
};

// Application must merge in correct order
const ioc = spur.create('app');
ioc.merge(spurCommon());  // Must merge first
ioc.merge(packageB());    // Then merge package B
```

#### Identifying Soft Dependencies

**Key indicators:**
1. **Check `package.json`**: If a related package is in `devDependencies` (or not listed at all), it's likely a soft dependency
2. **Usage pattern**: If applications are required to merge packages in a specific order, the later package likely has soft dependencies on the earlier ones
3. **Module dependencies**: If a package's modules use dependencies from another package but don't merge that package internally, it's a soft dependency

**Example from Spur Framework:**
- `spur-web` has `spur-common` as a soft dependency
- Applications must merge `spurCommon()` before `spurWeb()`
- `spur-web` modules use `Logger`, `Promise`, etc. from `spur-common`
- But `spur-web` doesn't merge `spur-common` internally

### Key Principles

1. **Boundary Clarity**: Each package has a clear boundary and responsibility
2. **Dependency Direction**: Dependencies flow downward (specialized → foundation)
3. **Merge Order**: Foundation packages must be merged before specialized packages
4. **Shared Namespace**: Merged packages share a single namespace
5. **Soft Dependencies**: Specialized packages assume foundation dependencies exist
6. **No Circular Dependencies**: Foundation packages don't depend on specialized packages

### Migration Implications

Understanding package boundaries and dependency relationships helps with migration:

1. **Identify layers**: Determine which layer each package belongs to (foundation vs specialized)
2. **Map dependencies**: Understand which dependencies flow across boundaries
3. **Identify dependency types**: Determine which packages are hard vs soft dependencies
4. **Understand merge order**: Soft dependencies must be merged before packages that assume them
5. **Track dependency chains**: If Package A assumes Package B, and Package B assumes Package C, merge order is: C → B → A
6. **Replace in order**: When migrating, replace from bottom-up (foundation packages first, then specialized)
7. **Maintain boundaries**: Keep clear separation when migrating to new patterns
8. **Track assumptions**: Identify soft dependencies that need to be addressed

**Example dependency chain:**
```
Application
  ├─ merges spur-common (foundation)
  ├─ merges spur-web (assumes spur-common)
  └─ merges application modules (assumes both)
```

## The $injector Helper

The `$injector` is a special dependency that provides runtime access to the dependency container:

### Available Methods

- `$injector.get(name)` - Get a single dependency by name
- `$injector.getRegex(regex)` - Get multiple dependencies matching a pattern
- `$injector.getMap([names])` - Get multiple dependencies by name array
- `$injector.getAll()` - Get all dependencies

### Usage Constraints

- **Synchronous only**: Can only be used during startup resolution
- **Optional dependencies**: Useful for conditionally available dependencies
- **Pattern matching**: Enables convention-based dependency discovery

**Example:**
```javascript
module.exports = function($injector) {
  // Get all controllers matching pattern
  const controllers = $injector.getRegex(/Controller$/);

  // Get optional dependency
  const statsd = $injector.get('statsd');
  if (statsd) {
    // Use statsd if available
  }
}
```

## Key Concepts Summary

1. **Dependency Declaration**: Dependencies are declared as function parameters
2. **Name-Based Resolution**: Dependencies are matched by exact name
3. **Automatic Discovery**: File system structure drives dependency registration
4. **Lazy Resolution**: Dependencies are resolved when first accessed
5. **Singleton Pattern**: Each dependency name resolves to one instance
6. **Composition Support**: Multiple injectors can be merged or linked
7. **Startup Resolution**: All resolution happens synchronously at startup
8. **Error Detection**: Missing and cyclic dependencies are detected early

## Analyzing Spur Packages for Migration

When analyzing a Spur Framework package for migration, use the following checklist:

### Package Structure Analysis

1. **Injector Definition**: Locate the package's injector definition (typically `injector.js` or similar)
2. **Dependency Registration**: Identify which dependencies are registered:
   - External Node.js modules (via `registerDependencies()`)
   - Auto-discovered modules (via `registerFolders()`)
   - Manually registered dependencies (via `addDependency()` or `addResolvableDependency()`)
3. **Dependency Exposure**: If using `link()` pattern, identify which dependencies are exposed
4. **Dependency Wrapping**: Note any external libraries that are wrapped or transformed before exposure
5. **Promisification**: Identify callback-based dependencies that are promisified

### Dependency Relationship Analysis

1. **Hard vs Soft Dependencies**: Check `package.json` to identify:
   - Hard dependencies in `dependencies` section
   - Soft dependencies in `devDependencies` section
2. **Merge Order**: Determine the required merge order based on soft dependencies
3. **Dependency Chains**: Map the full dependency chain (e.g., Application → spur-web → spur-common)
4. **Package Layer**: Classify the package as foundation or specialized

### Migration Considerations

- **Phase 1 - Remove DI**: Replace DI with standard JavaScript imports and constructor patterns
- **Phase 2 - Framework Migration**: Migrate to Fastify (or other target framework)
- **Dependency Mapping**: Map each injected dependency to its standard import equivalent
- **Initialization Order**: Understand the resolution order to maintain correct initialization sequence
- **Singleton Pattern**: Note that spur-ioc dependencies are singletons - may need to adjust in new pattern

