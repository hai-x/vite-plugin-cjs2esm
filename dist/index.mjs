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
import path from "path";
var isCommonJs = (source) => {
  return COMMON_JS_REG.test(source);
};
var skipTransform = (source, id) => {
  if (!DEFAULT_EXTENSIONS.includes(path.extname(id)))
    return true;
  else if (VITE_REG.test(id))
    return true;
  else if (!isCommonJs(source))
    return true;
  return false;
};

// src/transform.ts
import MagicString from "magic-string";
import { parse } from "acorn";

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
import { ancestor } from "acorn-walk";

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
    ast = parse(source, {
      sourceType: "module",
      ecmaVersion: 2020
    });
  } catch (error) {
    return source;
  }
  ancestor(ast, {
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
  const ms = new MagicString(source);
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
import fs from "fs/promises";
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
          source = await fs.readFile(id, "utf8");
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
export {
  src_default as default,
  esbuildPlugin,
  vitePlugin
};
