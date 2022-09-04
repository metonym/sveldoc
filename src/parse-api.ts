import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { preprocess, walk, parse } from "svelte/compiler";
import { typescript } from "svelte-preprocess";

type TypeName = string;
interface TypeImport {
  kind: "type import";
  raw: string;
}

interface TypeDeclaration {
  kind: "type declaration";
  type: string;
  raw: string;
}

interface TypeInterfaceDeclaration {
  kind: "type interface";
  raw: string;
}

type TypeAlias = TypeImport | TypeDeclaration | TypeInterfaceDeclaration;

interface SharedProps {
  prop_name: string;
  prop_types: any[];
  comments: null | string;
  references_type: boolean;
}

interface ComponentProp extends SharedProps {
  prop_type_inferred?: any;
  default_value?: any;
  is_accessor: boolean;
  is_arrow_function: boolean;
  is_const: boolean;
  is_function_declaration: boolean;
  is_let: boolean;
  is_required: boolean;
}

interface ComponentEventDispatched extends SharedProps {
  event_type: "dispatched";
}

interface ComponentEventForwarded {
  event_type: "forwarded";
  event_name: string;
  event_modifiers: string[];
  element_type: "Element" | "InlineComponent";
}

type ComponentEvent = ComponentEventDispatched | ComponentEventForwarded;

interface ComponentSlotProp extends SharedProps {}

interface ComponentSlot extends Omit<SharedProps, "prop_types" | "prop_name"> {
  slot_name: string;
  slot_props: ComponentSlotProp[];
  is_default: boolean;
  is_named: boolean;
}

interface ParseApiOptions {
  source: string;
  filename: string;
}

const getComments = (node: ts.Node): null | string => {
  /**
   * Use the `getFullText` and `getLeadingTriviaWidth`
   * methods to get the leading comments for a node.
   * @see https://quramy.medium.com/manipulate-comments-with-typescript-api-73d5f1d43d7f
   */
  return (
    node.getFullText().slice(0, node.getLeadingTriviaWidth()).trim() || null
  );
};

const getPropertyName = (name: ts.StringLiteral | ts.Identifier) => {
  return (name.text || (name as ts.Identifier).escapedText) ?? "";
};

/**
 * TODO:
 * - parse module types
 * - get $$restProps
 * - get forwarded events
 * - strip TS from Svelte source
 */
export const parseApi = async (options: ParseApiOptions) => {
  const { source, filename } = options;

  let script_module = "";
  let script_instance = "";
  let script_type: null | "module" | "instance" = null;

  const getStaticValue = (node: ts.Node) => {
    return script_instance.slice(node.pos, node.end).trim();
  };

  for (let line of source.split("\n")) {
    let line_trimmed = line.trim();

    if (/<\/script>/.test(line_trimmed)) {
      script_type = null;
    }

    if (script_type === "module") {
      script_module += line_trimmed + "\n";
    } else if (script_type === "instance") {
      script_instance += line_trimmed + "\n";
    }

    if (/<script /.test(line_trimmed)) {
      script_type = /context=module/.test(line_trimmed.replace(/("|')/, ""))
        ? "module"
        : "instance";
    } /*  else if (/<\/script>/.test(line_trimmed)) {
      script_type = null;
    } */
  }

  const ast_instance = ts.createSourceFile(
    filename,
    script_instance,
    ts.ScriptTarget.ESNext,
    true
  );

  const type_aliases = new Map<TypeName, TypeAlias>();

  const props: ComponentProp[] = [];
  const events: ComponentEvent[] = [];
  const slots: ComponentSlot[] = [];

  const colletImports = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      if (node.importClause?.isTypeOnly) {
        // @ts-expect-error
        const elements = node.importClause.namedBindings?.elements;
        const element = elements?.find((element: any) => element.name);

        const name = element.name.escapedText as string;
        type_aliases.set(name, {
          kind: "type import",
          raw: getStaticValue(node),
        });
      }
    } else if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.escapedText!;
      type_aliases.set(name, {
        kind: "type declaration",
        type: getStaticValue(node.type),
        raw: getStaticValue(node),
      });
    } else if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.escapedText!;
      type_aliases.set(name, {
        kind: "type interface",
        raw: getStaticValue(node),
      });
    }
  };

  ast_instance.forEachChild((node) => {
    colletImports(node);

    const is_export =
      ts.getModifiers(node as ts.HasModifiers)?.[0].kind ===
      ts.SyntaxKind.ExportKeyword;

    if (is_export) {
      // @ts-expect-error
      const declaration_list = node.declarationList as any;
      const declaration = declaration_list?.declarations[0];
      const declaration_list_text =
        declaration_list && getStaticValue(declaration_list);
      const is_let = /^let/.test(declaration_list_text);
      const is_const = /^const/.test(declaration_list_text);

      let prop_name = declaration?.name.escapedText;
      let is_accessor = false;
      let comments: string | null = null;
      let is_required = false;
      let default_value: any = undefined;
      let prop_types: any[] = [];

      let references_type = false;
      let is_function_declaration = ts.isFunctionDeclaration(node);
      let is_arrow_function = false;

      // if prop doesn't have an explicity type annotation, guess
      let prop_type_inferred: any = undefined;

      if (node.kind === ts.SyntaxKind.VariableStatement) {
        comments = getComments(node);
        is_accessor = is_const && ts.isArrowFunction(declaration.initializer);
        is_required = declaration.initializer === undefined;
        default_value = declaration.initializer?.text;

        is_arrow_function =
          declaration.initializer &&
          ts.isArrowFunction(declaration.initializer);

        if (
          declaration.initializer &&
          ts.isArrowFunction(declaration.initializer)
        ) {
          default_value = getStaticValue(declaration.initializer);
        }

        references_type =
          declaration.type?.kind === ts.SyntaxKind.TypeReference;

        if (references_type) {
          const type_name = declaration.type.typeName.escapedText;
          prop_types.push(type_name);
        } else {
          if (declaration.type) {
            declaration.type.types?.forEach((type: any) => {
              const type_name = type.typeName?.escapedText?.trim();

              if (type_name) {
                references_type = type_name !== undefined;
                prop_types.push(type_name);
              } else {
                let prop_type = getStaticValue(type);
                prop_types.push(prop_type);
              }
            });
          } else {
            // no type annotation; infer the type, default to "any"
            // `undefined` should be "any"
            // TODO: other primitive types
            if (declaration.initializer?.kind === ts.SyntaxKind.NullKeyword) {
              prop_type_inferred = "null";
            } else if (
              declaration.initializer?.kind === ts.SyntaxKind.StringLiteral
            ) {
              prop_type_inferred === "string";
            } else if (
              declaration.initializer?.kind === ts.SyntaxKind.NumericLiteral
            ) {
              prop_type_inferred = "number";
            }
          }
        }
      }

      if (ts.isFunctionDeclaration(node)) {
        is_accessor = true;
        prop_name = node.name?.escapedText;
      }

      props.push({
        prop_name,
        prop_types,
        prop_type_inferred,
        references_type,

        is_let,
        is_const,
        is_arrow_function,
        is_function_declaration,

        is_accessor,
        is_required,
        comments,
        default_value,
      });

      // Note: accessors do not need a default value
      // Note: do not fully write default value for an arrow function
    }

    if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.escapedText;

      if (name === "$$Slots") {
        node.members.forEach((member) => {
          // @ts-ignore
          let slot_name = getPropertyName(member.name);
          let is_default = slot_name === "default";
          let is_named = !is_default;
          let references_type = false;

          const comments = getComments(member);
          const slot_props: any[] = [];

          // @ts-ignore
          member.type.members.forEach((member) => {
            const member_property_name = getPropertyName(member.name);
            let references_type = false;
            const comments = getComments(member);

            let prop_types: any[] = [];

            if (member.type.types) {
              // @ts-ignore
              member.type.types?.forEach((type) => {
                const type_name = type.typeName?.escapedText?.trim();
                references_type = type_name !== undefined;

                if (references_type) {
                  prop_types.push(type_name);
                }
              });
            } else {
              let prop_type = getStaticValue(member.type);
              prop_types.push(prop_type);
            }

            const slot_prop_metadata = {
              prop_name: member_property_name,
              prop_types,
              references_type,
              comments,
            };

            slot_props.push(slot_prop_metadata);
          });

          slots.push({
            slot_name,
            slot_props,
            comments,
            is_default,
            is_named,
            references_type,
          });
        });
      }
    }

    if (ts.isVariableStatement(node)) {
      const initializer = node.declarationList.declarations[0].initializer;

      if (
        initializer &&
        ts.isCallExpression(initializer) &&
        ts.isIdentifier(initializer.expression)
      ) {
        const expression_name = initializer.expression.escapedText;

        if (expression_name === "createEventDispatcher") {
          const type_arguments = initializer.typeArguments?.[0];

          if (type_arguments && ts.isTypeLiteralNode(type_arguments)) {
            type_arguments.members.forEach((member) => {
              // @ts-ignore
              const member_property_name = getPropertyName(member.name);
              const comments = getComments(member);

              let prop_types: any[] = [];
              let references_type = false;

              // @ts-ignore
              if (member.type.types) {
                // @ts-ignore
                member.type.types?.forEach((type) => {
                  let prop_type = type.typeName?.escapedText?.trim();

                  references_type = prop_type !== undefined;

                  if (!references_type) {
                    prop_type = getStaticValue(type);
                  }

                  prop_types.push(prop_type);
                });
              } else {
                // @ts-ignore
                let prop_type = getStaticValue(member.type);
                prop_types.push(prop_type);
              }

              const event_metadata: ComponentEvent = {
                event_type: "dispatched",
                prop_name: member_property_name,
                prop_types,
                references_type,
                comments,
              };

              events.push(event_metadata);
            });
          }
        }
      }
    }
  });

  const ast_module = ts.createSourceFile(
    filename,
    script_module,
    ts.ScriptTarget.ESNext,
    true
  );

  ast_module.forEachChild((node) => {
    colletImports(node);

    const is_export =
      ts.getModifiers(node as ts.HasModifiers)?.[0].kind ===
      ts.SyntaxKind.ExportKeyword;

    if (is_export) {
      console.log("export");
    }

    // TODO: named exports (e.g., `export { a, b }`)
  });

  const createdFiles: any = {};
  const compilerOptions = {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    declaration: true,
    emitDeclarationOnly: true,
    outDir: "dist",
  };

  const temp_script_module = path.resolve(
    filename.replace(".svelte", ".module.ts")
  );
  fs.writeFileSync(temp_script_module, script_module);
  const host = ts.createCompilerHost(compilerOptions);

  let script_module_types = "export {};";

  host.writeFile = (fileName: string, contents: string) => {
    script_module_types = contents;
  };

  // Prepare and emit the d.ts files
  const program = ts.createProgram([temp_script_module], compilerOptions, host);
  program.emit();

  console.log("->", script_module_types);

  // TODO: use TS compiler instead of needing to preprocess it
  const result = await preprocess(
    source,
    [
      typescript({
        compilerOptions: {
          module: "esnext",
          preserveValueImports: true,
        },
      }),
    ],
    { filename }
  );
  const code = result.code.replace(/ lang=("|')ts("|')/g, "");
  const ast = parse(code, { filename });

  interface RestProps {
    element: string;
    element_type: "Element" | "InlineComponent";
  }

  let rest_props: null | RestProps = null;

  interface ImportMetadata {
    import_name: string;
    is_alias: boolean;
    is_default_export: boolean;
    source: string;
    source_resolved: string;
  }
  const imports = new Map<ImportMetadata["import_name"], ImportMetadata>();

  walk(ast, {
    enter(node, parent) {
      if (node.type === "ImportDeclaration") {
        node.specifiers.forEach((specifier: any) => {
          const import_name = specifier?.local?.name;
          const import_metadata = {
            import_name,
            is_alias: import_name !== specifier?.imported?.name,
            is_default_export: specifier.type === "ImportDefaultSpecifier",
            source: node.source?.value,
            source_resolved: path.resolve(
              path.dirname(filename),
              node.source?.value
            ),
          };

          imports.set(import_name, import_metadata);
        });
      }

      if (node.type === "Spread" && node.expression.name === "$$restProps") {
        rest_props = {
          element: parent.name,
          element_type: parent.type,
        };
      }

      /**
       * Forwarded event
       * Non-forwarded events have an expression object
       */
      if (node.type === "EventHandler" && node.expression === null) {
        const event_metadata: ComponentEventForwarded = {
          event_type: "forwarded",
          event_name: node.name,
          event_modifiers: node.modifiers,
          element_type: parent.type,
        };

        events.push(event_metadata);
      }
    },
  });

  if (
    rest_props !== null &&
    (rest_props as RestProps).element_type === "InlineComponent"
  ) {
    const resolved_import = imports.get((rest_props as RestProps).element);

    if (resolved_import) {
      // resolve forwarded props
    }
  }

  const referenced_type_aliases = new Set<TypeAlias | undefined>();

  const addTypeAlias = (metadata: SharedProps) => {
    if (!metadata.references_type) return;
    metadata.prop_types.forEach((type) => {
      referenced_type_aliases.add(type_aliases.get(type));
    });
  };

  props.forEach(addTypeAlias);
  events.forEach((event) => {
    if (event.event_type === "dispatched") addTypeAlias(event);
  });
  slots.forEach(({ slot_props }) => slot_props.forEach(addTypeAlias));

  return {
    props,
    events,
    slots,
    rest_props,
    referenced_type_aliases: [...referenced_type_aliases].filter(Boolean),
    code,
    types: "",
  };
};
