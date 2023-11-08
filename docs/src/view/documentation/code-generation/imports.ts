import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as text from "./text";

export const createRegisterImport = (
  { code }: text.CodeGenerationContext,
  importContext: ImportContext,
): RegisterImport => {
  function registerImport(
    { package: typePackage, name }: Omit<typedoc.ReferenceType, "target">,
    target: typedoc.ReflectionSymbolId,
  ): text.IntermediateCode {
    const packageName =
      typePackage ??
      functionality.doThrow(`Reference type did not specify package name.`);
    const isGlobal = importContext.globals.has(packageName);
    if (!isGlobal) {
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
        importContext.imports[packageName] = createImportInfo(
          kind,
          packageName,
          name,
          target,
        );
      }
    }
    return code`${isGlobal ? text.text(name) : text.ref(name, target)}`;
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
  importedElements: Array<{ name: string; ref: typedoc.ReflectionSymbolId }>;
}

export type RegisterImport = (
  refType: Omit<typedoc.ReferenceType, "target">,
  target: typedoc.ReflectionSymbolId,
) => text.IntermediateCode;

const getImportAlias = (name: string, qualifiedName: string) =>
  qualifiedName.substring(0, qualifiedName.indexOf(`.${name}`));

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
