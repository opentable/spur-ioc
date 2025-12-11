# spur-ioc Library Context

## Package Overview

`spur-ioc` is the foundational dependency injection (DI) container for the Spur Framework ecosystem. It provides the core mechanism for dependency injection in Node.js applications, enabling automatic dependency discovery, name-based resolution, and composition of multiple injectors.

**Role**: Foundation package - provides the Injector API itself. This package does not register or expose external dependencies; it is the container mechanism that other packages use to register their dependencies.

For detailed information about how dependency injection works in the Spur Framework, see [spur-ioc-concepts.md](./spur-ioc-concepts.md).

## Entry Point

**Main Entry**: `src/Injector.js` (as specified in `package.json` main field)

**Import/Require**:
```javascript
const Injector = require('spur-ioc');
// or
const Injector = require('spur-ioc/src/Injector');
```

## Public API

### Static Factory Method

#### `Injector.create(name, logger?)`

Creates a new injector instance.

**Parameters:**
- `name` (string): Identifier for the injector instance
- `logger` (object, optional): Logger instance. If not provided, a default logger is created.

**Returns:** `Injector` instance

**Description:** Factory method to create a new injector. This is the primary way to instantiate an injector.

**Example:**
```javascript
const Injector = require('spur-ioc');
const ioc = Injector.create('my-app');
```

---

### Dependency Registration Methods

#### `ioc.registerDependencies(dependencies)`

Registers multiple external dependencies at once.

**Parameters:**
- `dependencies` (object): Object mapping dependency names to their implementations. Keys are dependency names, values can be:
  - External Node.js modules (e.g., `require('express')`)
  - Pre-constructed instances
  - Global objects (e.g., `console`, `process`)

**Returns:** `Injector` instance (for chaining)

**Description:** Registers external Node.js modules, global objects, or pre-constructed instances as immediate dependencies. These are available immediately without resolution.

**Behavior Notes:**
- Dependencies are registered as immediate instances (no resolution needed)
- Useful for making external libraries and globals injectable and mockable in tests
- Uses `camelCase` convention for dependency names (hyphens are not valid in JavaScript variable names)
- Emits a warning if a dependency with the same name already exists

**Example:**
```javascript
ioc.registerDependencies({
  'express': require('express'),
  'path': require('path'),
  'console': console,
  'nodeProcess': process
});
```

---

#### `ioc.registerFolders(rootDir, folderNames)`

Automatically discovers and registers modules from the file system.

**Parameters:**
- `rootDir` (string): Root directory path (typically `__dirname`)
- `folderNames` (array): Array of folder names to scan for modules

**Returns:** `Injector` instance (for chaining)

**Description:** Scans specified directories recursively for JavaScript files and registers them as resolvable dependencies. Module names are derived from filenames (without extension), maintaining original casing.

**Behavior Notes:**
- Registration is flattened by filename - directory structure is not preserved in dependency names
- Files with the same name in different directories will conflict (last one processed wins)
- All discovered modules must follow the function signature convention: `module.exports = function(Dependency1, Dependency2, ...) { ... }`
- See [spur-ioc-concepts.md](./spur-ioc-concepts.md) for detailed information on folder-based auto-discovery

**Example:**
```javascript
ioc.registerFolders(__dirname, [
  'runtime',
  'domain',
  'services'
]);
```

---

#### `ioc.addDependency(name, dependency, suppressWarning?)`

Registers a single pre-constructed dependency instance.

**Parameters:**
- `name` (string): Dependency name
- `dependency` (any): Pre-constructed instance to register
- `suppressWarning` (boolean, optional): If `true`, suppresses warning when overwriting an existing dependency

**Returns:** `Injector` instance (for chaining)

**Description:** Singular version of `registerDependencies()`. Registers a single dependency as an immediate instance.

**Behavior Notes:**
- Emits a warning if a dependency with the same name already exists (unless `suppressWarning` is `true`)
- Dependency is available immediately without resolution

**Example:**
```javascript
ioc.addDependency('config', { port: 3000 });
ioc.addDependency('console', console, true); // Suppress warning if overwriting
```

---

#### `ioc.addResolvableDependency(name, factoryFunction, suppressWarning?)`

Registers a dependency that requires resolution (factory function).

**Parameters:**
- `name` (string): Dependency name
- `factoryFunction` (function): Factory function that will be called with injected dependencies. Function parameters declare the dependencies needed.
- `suppressWarning` (boolean, optional): If `true`, suppresses warning when overwriting an existing dependency

**Returns:** `Injector` instance (for chaining)

**Description:** Registers a dependency with a factory function. The factory function's parameters are automatically parsed to determine its dependencies, which are then injected when the dependency is resolved.

**Behavior Notes:**
- Function parameters are parsed to extract dependency names
- Dependencies are resolved recursively when this dependency is first accessed
- Factory function is invoked with resolved dependencies
- Result is cached for subsequent injections

**Example:**
```javascript
ioc.addResolvableDependency('MyService', function(Logger, Database) {
  return new MyService(Logger, Database);
});
```

---

### Dependency Injection Methods

#### `ioc.inject(injectionFunction)`

Triggers dependency resolution and provides resolved dependencies to the injection function.

**Parameters:**
- `injectionFunction` (function): Function that receives resolved dependencies as parameters. Function parameters declare which dependencies to inject.

**Returns:** `DependencyResolver` instance (internal, typically not used directly)

**Description:** Main method to bootstrap the application or get dependencies. Triggers synchronous resolution of all dependencies at startup. All dependencies are resolved before the application runs.

**Behavior Notes:**
- Resolution happens synchronously at application startup
- All dependencies are resolved when `inject()` is called
- Resolution completes before the application runs
- The injector is "disposed" after resolution (for performance)
- Missing dependencies, cyclic dependencies, and resolution exceptions are detected and reported with call chains
- Function parameters are parsed to extract dependency names

**Example:**
```javascript
ioc.inject(function(WebServer, Database) {
  Database.connect().then(() => {
    WebServer.start();
  });
});
```

---

### Composition Methods

#### `ioc.merge(otherInjector, suppressWarning?)`

Combines multiple injectors into a single shared namespace.

**Parameters:**
- `otherInjector` (Injector): Another injector instance to merge into this one
- `suppressWarning` (boolean, optional): If `true`, suppresses warnings when dependencies are overwritten

**Returns:** `Injector` instance (for chaining)

**Description:** Merges all dependencies from another injector into this injector's namespace. All dependencies from both injectors become available in a single shared namespace.

**Behavior Notes:**
- Single shared namespace - all dependencies from both injectors are accessible
- Dependencies with the same name will conflict - the last one merged wins
- Emits a warning when a dependency is overwritten (unless `suppressWarning` is `true`)
- Used for combining foundation and specialized packages

**Example:**
```javascript
const coreIoc = CoreUtilitiesInjector();
const appIoc = MyAppInjector();
appIoc.merge(coreIoc);
```

---

#### `ioc.link(otherInjector)`

Links another injector and makes only its exposed dependencies available.

**Parameters:**
- `otherInjector` (Injector): Another injector instance to link

**Returns:** `Injector` instance (for chaining)

**Description:** Links another injector while maintaining namespace separation. Only dependencies explicitly exposed by the other injector are made available. Private dependencies remain isolated.

**Behavior Notes:**
- Separate namespaces per injector
- Only explicitly exposed dependencies are accessible
- Private dependencies remain isolated
- The other injector must have called `expose()` to mark which dependencies to expose
- Used for selective API exposure between packages

**Example:**
```javascript
// In CoreApisInjector
ioc.expose(['UsersAPI', 'ProjectsAPI']);

// In MyAppInjector
ioc.link(CoreApisInjector());
// Only UsersAPI and ProjectsAPI are available
```

---

#### `ioc.expose(dependencies)`

Marks which dependencies should be exposed to other injectors when using `link()`.

**Parameters:**
- `dependencies` (array|RegExp):
  - Array of dependency names to expose
  - OR a RegExp pattern to match dependency names

**Returns:** `Injector` instance (for chaining)

**Description:** Defines which dependencies are public and should be accessible when this injector is linked by another injector. All other dependencies remain private.

**Behavior Notes:**
- Only exposed dependencies are accessible when using `link()`
- Can use array for explicit list or RegExp for pattern matching
- Must be called before `link()` is used on this injector
- Used for creating package boundaries and public APIs

**Example:**
```javascript
ioc.expose(['UsersAPI', 'ProjectsAPI']); // Explicit list
ioc.expose(/.+API$/); // Pattern matching
```

---

#### `ioc.exposeAll()`

Exposes all dependencies in the injector.

**Parameters:** None

**Returns:** `Injector` instance (for chaining)

**Description:** Convenience method to expose all dependencies. Equivalent to `ioc.expose(/.+/)`.

**Behavior Notes:**
- Exposes every dependency in the injector
- Use with caution - removes namespace isolation
- Typically used for foundation packages that should expose everything

**Example:**
```javascript
ioc.exposeAll();
```

---

### Special Dependency: $injector Helper

The `$injector` is a special dependency that can be injected to provide runtime access to the dependency container.

**Available Methods:**
- `$injector.get(name)` - Get a single dependency by name (returns `null` if not found)
- `$injector.getRegex(regex)` - Get multiple dependencies matching a regex pattern
- `$injector.getMap([names])` - Get multiple dependencies by name array
- `$injector.getAll()` - Get all dependencies

**Usage Constraints:**
- Can only be used synchronously during startup resolution
- Cannot be used asynchronously after resolution completes
- Useful for optional dependencies and pattern-based discovery

**Example:**
```javascript
module.exports = function($injector) {
  const controllers = $injector.getRegex(/Controller$/);
  const statsd = $injector.get('statsd');
  if (statsd) {
    // Use statsd if available
  }
};
```

---

## Package Dependencies

The following dependencies are listed in `package.json` for reference. These are implementation dependencies used internally by spur-ioc and are **not** registered or exposed via the dependency injection system:

- `lodash.assign`: 4.2.0
- `lodash.bindall`: 4.4.0
- `require-all`: 3.0.0

## Dev Dependencies

The following dev dependencies are listed in `package.json` for reference:

- `eslint`: 8.57.0
- `jest`: 29.7.0

## What This Package Exposes

**This package is the foundation** - it provides the Injector API itself. It does not register or expose external dependencies via dependency injection.

**What it provides:**
- The `Injector` class and all its public methods
- The dependency injection container mechanism
- The foundation for other packages to build upon

**What it does NOT provide:**
- External library dependencies (express, bluebird, etc.)
- Application modules
- Wrapped or transformed dependencies

Other Spur Framework packages (such as `spur-common`, `spur-web`) use `spur-ioc` to register and expose their own dependencies. Those packages will have their own `library-context.md` files documenting what they expose.

## Related Documentation

For detailed information about:
- How dependency injection works in the Spur Framework
- Dependency discovery and registration patterns
- Dependency resolution and composition
- Package boundaries and composition patterns
- Hard vs soft dependencies
- Migration considerations

See: [spur-ioc-concepts.md](./spur-ioc-concepts.md)

