import { Throw } from "throw-expression";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as text from "./text";
import type * as types from "./types";

export const createRegisterImport = (
  { code }: text.CodeGenerationContext,
  importContext: ImportContext,
): types.RegisterImport => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function registerImport(
    { package: typePackage, name }: Omit<typedoc.ReferenceType, "target">,
    target: typedoc.ReflectionSymbolId,
  ): text.IntermediateCode {
    const packageName = importContext.getVisiblePackageName(
      typePackage ?? Throw(`Reference type did not specify package name.`),
      target,
    );
    const isGlobal = importContext.globals.has(packageName);
    let retVal: text.IntermediateCode;
    if (isGlobal) {
      retVal = code`${text.text(name)}`;
    } else {
      const kind = target.qualifiedName === name ? "individual" : "named";
      let currentImport = importContext.imports[packageName];
      if (currentImport) {
        if (currentImport.import !== kind) {
          throw new Error(
            `Deduced conflicting import kinds for package ${packageName}.`,
          );
        }
        switch (currentImport.import) {
          case "individual":
            currentImport.importedElements.push({
              name: target.qualifiedName,
              ref: target,
            });
            break;
          case "named":
            // Nothing to do;
            break;
          default:
            throw new Error("Implement functionality for new import kind");
        }
      } else {
        importContext.imports[packageName] = currentImport = createImportInfo(
          kind,
          packageName,
          name,
          target,
        );
      }
      retVal =
        currentImport.import === "individual"
          ? code`${text.ref(name, target)}`
          : code`${text.text(`${currentImport.alias}.`)}${text.ref(
              getTypeName(name, currentImport.alias),
              target,
            )}`;
    }
    return retVal;
  }
  return registerImport;
};

export interface ImportContext {
  imports: Record<string, ImportInfo>;
  globals: Set<string>;
  getVisiblePackageName: (
    packageName: string,
    target: typedoc.ReflectionSymbolId,
  ) => string;
}

export type ImportInfo = ImportInfoNamed | ImportInfoIndividual;

export interface ImportInfoBase {
  packageName: string;
}
export interface ImportInfoNamed extends ImportInfoBase {
  import: "named";
  alias: string;
}

export interface ImportInfoIndividual extends ImportInfoBase {
  import: "individual";
  importedElements: Array<{ name: string; ref: typedoc.ReflectionSymbolId }>;
}

const getImportAlias = (name: string, qualifiedName: string) => {
  let idx = qualifiedName.indexOf(`.${name}`);
  if (idx < 1) {
    idx = name.indexOf(".");
    if (idx < 1) {
      throw new Error(
        `Failed to get import alias from name "${name}", qualified name "${qualifiedName}".`,
      );
    }
    qualifiedName = name;
  }
  return qualifiedName.substring(0, idx);
};

const createImportInfo = (
  kind: ImportInfo["import"],
  packageName: string,
  name: string,
  target: typedoc.ReflectionSymbolId,
): ImportInfo =>
  kind === "individual"
    ? {
        import: kind,
        packageName,
        importedElements: [{ name: target.qualifiedName, ref: target }],
      }
    : {
        import: "named",
        packageName,
        alias: getImportAlias(name, target.qualifiedName),
      };

const getTypeName = (name: string, importAlias: string) => {
  if (!name.startsWith(`${importAlias}.`)) {
    throw new Error(
      `Name "${name}" did not start with import alias "${importAlias}".`,
    );
  }
  return name.substring(importAlias.length + 1);
};
