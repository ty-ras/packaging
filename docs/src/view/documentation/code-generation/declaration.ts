import * as functionality from "../functionality";
import type * as types from "./types";
import * as flags from "./flags";

export const createGetDeclarationText = (
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  function getDeclarationText(declaration: functionality.IndexableModel) {
    return `${getDeclarationPrefixText(
      declaration,
    )}${functionality.getOptionalValueText(
      declaration.typeParameters,
      (typeParams) =>
        `<${typeParams
          .map(
            (typeParam) =>
              `${typeParam.name}${functionality.getOptionalValueText(
                typeParam.type,
                (parentType) => ` extends ${getTypeText(parentType)}`,
              )}${functionality.getOptionalValueText(
                typeParam.default,
                (defaultValue) => ` = ${getTypeText(defaultValue)}`,
              )}`,
          )
          .join(", ")}>`,
    )}${getDeclarationBodyText(
      index,
      getTypeText,
      getSignatureText,
      getDeclarationText,
      declaration,
    )}`;
  }

  return getDeclarationText;
};

const getDeclarationPrefixText = (
  declaration: functionality.IndexableModel,
) => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Class:
      return `export declare class ${declaration.name}`;
    case functionality.ReflectionKind.Function:
      return `export declare function ${declaration.name}`;
    default:
      return "";
  }
};

const getDeclarationBodyText = (
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
  getDeclarationText: types.GetDeclarationText,
  declaration: functionality.IndexableModel,
) => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Class:
      return getClassBodyText(
        index,
        getTypeText,
        getDeclarationText,
        declaration,
      );
    case functionality.ReflectionKind.Function:
      return (
        declaration.signatures ??
        functionality.doThrow("Function without signatures?")
      )
        .map(
          (sig) =>
            `export declare function ${sig.name}${getSignatureText(sig)}`,
        )
        .join(";\n");
    case functionality.ReflectionKind.Constructor:
      return `${flags.getFlagsText(
        declaration.flags,
      )} constructor ${getSignatureText(
        functionality.ensureOneItem(declaration.signatures),
      )};`;
    case functionality.ReflectionKind.Property:
      return `${flags.getFlagsText(declaration.flags)} ${
        declaration.name
      }: ${getTypeText(
        declaration.type ?? functionality.doThrow("Property without type?"),
      )};`;
    case functionality.ReflectionKind.Method:
      return `${flags.getFlagsText(declaration.flags)} ${
        declaration.name
      }${getSignatureText(
        functionality.ensureOneItem(declaration.signatures),
      )};`;
    default:
      throw new Error(
        `Implement declaration body text support for ${declaration.kind}`,
      );
  }
};

const getClassBodyText = (
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getDeclarationText: types.GetDeclarationText,
  declaration: functionality.IndexableModel,
) => {
  return `${functionality.getOptionalValueText(
    declaration.extendedTypes,
    (parentTypes) => ` extends ${parentTypes.map(getTypeText).join(", ")}`,
  )}${functionality.getOptionalValueText(
    declaration.implementedTypes,
    (implementedTypes) =>
      ` implements ${implementedTypes.map(getTypeText).join(", ")}`,
  )} {
${
  declaration.children
    ?.map((childId) =>
      getDeclarationText(
        index[childId] ??
          functionality.doThrow(`Failed to find declaration child ${childId}`),
      ),
    )
    .join("\n") ?? ""
}
  }`;
};
