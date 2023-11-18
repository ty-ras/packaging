import { Throw } from "throw-expression";
import type * as typedoc from "typedoc";
import * as text from "./text";
import type * as types from "./types";

export const createRegisterImport = (
  { code }: text.CodeGenerationContext,
  importContext: ImportContext,
  forceToIndividual: boolean,
): types.RegisterImport => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function registerImport(
    {
      package: typePackage,
      name,
    }: Omit<typedoc.JSONOutput.ReferenceType, "target">,
    target: typedoc.JSONOutput.ReflectionSymbolId,
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
      let qName = target.qualifiedName;
      let kind: ImportInfo["import"] = qName === name ? "individual" : "named";
      if (kind === "named" && forceToIndividual) {
        kind = "individual";
        qName = name;
      }
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
              name: qName,
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
          qName,
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
    target: typedoc.JSONOutput.ReflectionSymbolId,
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
  importedElements: Array<{
    name: string;
    ref: typedoc.JSONOutput.ReflectionSymbolId;
  }>;
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
  target: typedoc.JSONOutput.ReflectionSymbolId,
  qName: string,
): ImportInfo =>
  kind === "individual"
    ? {
        import: kind,
        packageName,
        importedElements: [{ name: qName, ref: target }],
      }
    : {
        import: kind,
        packageName,
        alias: getImportAlias(name, qName),
      };

const getTypeName = (name: string, importAlias: string) => {
  let substringStart: number | undefined;
  if (name.startsWith(`${importAlias}.`)) {
    substringStart = importAlias.length + 1;
  } else if (name.indexOf(".") >= 0) {
    throw new Error(
      `Name "${name}" did not start with import alias "${importAlias}".`,
    );
  }
  return substringStart === undefined ? name : name.substring(substringStart);
};
