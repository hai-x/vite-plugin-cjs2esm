"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default,
  esbuildPlugin: () => esbuildPlugin,
  vitePlugin: () => vitePlugin
});
module.exports = __toCommonJS(src_exports);

// src/contants.ts
var DEFAULT_EXTENSIONS = [
  ".mjs",
  ".js",
  ".mts",
  ".ts",
  ".jsx",
  ".tsx",
  ".json"
];
var VITE_REG = /.vite/;
var COMMON_JS_REG = /\b(module\.exports|exports\.\w+|exports\s*=\s*|exports\s*\[.*\]\s*=\s*)/;

// src/utils.ts
var import_node_path = __toESM(require("path"), 1);
var isCommonJs = (source) => {
  return COMMON_JS_REG.test(source);
};
var skipTransform = (source, id) => {
  if (!DEFAULT_EXTENSIONS.includes(import_node_path.default.extname(id)))
    return true;
  else if (VITE_REG.test(id))
    return true;
  else if (!isCommonJs(source))
    return true;
  return false;
};

// src/transform.ts
var import_magic_string = __toESM(require("magic-string"), 1);
var import_acorn = require("acorn");

// src/importer.ts
var resolveImporters = (importers) => {
  let index = 0;
  return importers.map((importer) => {
    const name = `__IMPORTER_${index++}__`;
    const from = importer?.arguments?.[0]?.value;
    return {
      ...importer,
      prepend: `import * as ${name} from "${from}";`,
      overwrite: `${name}.default || ${name}`
    };
  });
};

// src/transform.ts
var import_acorn_walk = require("acorn-walk");

// src/exporter.ts
var resolveExporters = (exporters) => {
  let index = 0;
  return exporters.map((exporter) => {
    const name = `__EXPORTER_${index++}__`;
    let overwrite;
    let append;
    if (exporter.left.type === "MemberExpression") {
      if (exporter.left.object.name === "exports") {
        const propertyName = exporter.left.property.name;
        overwrite = `export const ${propertyName}`;
      } else if (exporter.left.object.name === "module" && exporter.left.property.name === "exports") {
        overwrite = `const ${name}`;
        append = `export default ${name};`;
      }
    }
    return {
      ...exporter,
      start: exporter.left.start,
      end: exporter.left.end,
      overwrite,
      append
    };
  });
};

// src/transform.ts
var transform = (source, id) => {
  let ast;
  const importers = [];
  const exporters = [];
  try {
    ast = (0, import_acorn.parse)(source, {
      sourceType: "module",
      ecmaVersion: 2020
    });
  } catch (error) {
    return source;
  }
  (0, import_acorn_walk.ancestor)(ast, {
    CallExpression(node, ancestors) {
      const isCjsImporter = node.callee.name === "require";
      isCjsImporter && importers.push({
        ...node,
        ancestors
      });
    },
    AssignmentExpression(node) {
      const isCjsExporter = node.left.type === "MemberExpression" && (node.left.object.name === "exports" || node.left.object.name === "module" && node.left.property.name === "exports");
      isCjsExporter && exporters.push(node);
    }
  });
  const ms = new import_magic_string.default(source);
  for (const importer of resolveImporters(importers)) {
    const { prepend, overwrite, start, end } = importer;
    overwrite && ms.overwrite(start, end, overwrite);
    prepend && ms.prepend(`${prepend}
`);
  }
  for (const exporter of resolveExporters(exporters)) {
    const { append, overwrite, start, end } = exporter;
    overwrite && ms.overwrite(start, end, overwrite);
    append && ms.append(`${append}
`);
  }
  return ms.toString();
};
var transform_default = transform;

// src/plugin.ts
var import_promises = __toESM(require("fs/promises"), 1);
var defaultOptions = {
  filter: /.*/
};
var vitePlugin = (options) => {
  const _options = Object.assign({}, defaultOptions, options);
  const { filter } = _options;
  return {
    apply: "serve",
    name: "vite:cjs2esm",
    transform(source, id) {
      if (!skipTransform(source, id) && filter.test(id)) {
        const _source = transform_default(source, id);
        console.log(_source);
        return {
          code: _source,
          map: null,
          warnings: null
        };
      }
      return null;
    }
  };
};
var esbuildPlugin = (options) => {
  const _options = Object.assign({}, defaultOptions, options);
  const { filter } = _options;
  return {
    name: "esbuild:cjs2esm",
    setup(build) {
      build.onLoad({ filter }, async (args) => {
        const { path: id } = args;
        let source;
        try {
          source = await import_promises.default.readFile(id, "utf8");
        } catch (error) {
          return null;
        }
        if (!skipTransform(source, id)) {
          source = transform_default(source, id);
          return {
            contents: source,
            loader: "js"
          };
        }
        return null;
      });
    }
  };
};

// src/index.ts
var src_default = vitePlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  esbuildPlugin,
  vitePlugin
});
