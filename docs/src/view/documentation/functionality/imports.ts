import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as errors from "./errors";

export const createRegisterImport = (
  importContext: ImportContext,
): RegisterImport => {
  function registerImport(
    { package: typePackage, name }: Omit<typedoc.ReferenceType, "target">,
    target: typedoc.ReflectionSymbolId,
  ): string {
    const packageName =
      typePackage ??
      errors.doThrow(`Reference type did not specify package name.`);
    if (!importContext.globals.has(packageName)) {
      const kind = target.qualifiedName === name ? "individual" : "named";
      const currentImport = importContext.imports[packageName];
      if (currentImport) {
        if (currentImport.import !== kind) {
          throw new Error(
            `Deduced conflicting import kinds for package ${packageName}.`,
          );
        }
        switch (currentImport.import) {
          case "individual":
            currentImport.importedElements.push(target.qualifiedName);
            break;
          case "named":
            // Nothing to do;
            break;
          default:
            throw new Error("Implement functionality for new import kind");
        }
      } else {
        importContext.imports[packageName] = createImportInfo(
          kind,
          packageName,
          name,
          target,
        );
      }
    }
    return name;
  }
  return registerImport;
};

export interface ImportContext {
  imports: Record<string, ImportInfo>;
  globals: Set<string>;
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
  importedElements: Array<string>;
}

export type RegisterImport = (
  refType: Omit<typedoc.ReferenceType, "target">,
  target: typedoc.ReflectionSymbolId,
) => string;

const getImportAlias = (name: string, qualifiedName: string) =>
  name.substring(0, name.indexOf(qualifiedName));

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
        importedElements: [target.qualifiedName],
      }
    : {
        import: "named",
        packageName,
        alias: getImportAlias(name, target.qualifiedName),
      };
