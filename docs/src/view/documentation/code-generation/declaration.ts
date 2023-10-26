import type * as types from "./types";
import * as functionality from "../functionality";

export const createGetDeclarationText = (
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  function getDeclarationText(declaration: functionality.IndexableModel) {
    return `${getReflectionKindTypeScriptName(declaration.kind)} ${
      declaration.name
    }${functionality.getOptionalValueText(
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
    )}${getDeclarationBodyText(getTypeText, getSignatureText, declaration)}`;
  }

  return getDeclarationText;
};

export const getReflectionKindTypeScriptName = (
  reflectionKind: functionality.ReflectionKind,
): string => {
  switch (reflectionKind) {
    case functionality.ReflectionKind.Enum:
      return "enum";
    case functionality.ReflectionKind.Variable:
      return "const";
    case functionality.ReflectionKind.Function:
      return "function";
    case functionality.ReflectionKind.Class:
      return "class";
    case functionality.ReflectionKind.Interface:
      return "interface";
    case functionality.ReflectionKind.Constructor:
      return "constructor";
    default:
      throw new Error(`Implement title name for ${reflectionKind}.`);
  }
};

const getDeclarationBodyText = (
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
  declaration: functionality.IndexableModel,
) => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Class:
      return getClassBodyText(declaration, getTypeText);
    case functionality.ReflectionKind.Function:
      return (
        declaration.signatures ??
        functionality.doThrow("Function without signatures?")
      )
        .map(
          (sig) =>
            `export declare function ${sig.name}${getSignatureText(sig, ":")}`,
        )
        .join(";\n");
    default:
      throw new Error(
        `Implement declaration body text support for ${declaration.kind}`,
      );
  }
};

const getClassBodyText = (
  declaration: functionality.IndexableModel,
  getTypeText: types.GetSomeTypeText,
) => {
  return `${functionality.getOptionalValueText(
    declaration.extendedTypes,
    (parentTypes) => ` extends ${parentTypes.map(getTypeText).join(", ")}`,
  )}${functionality.getOptionalValueText(
    declaration.implementedTypes,
    (implementedTypes) =>
      ` implements ${implementedTypes.map(getTypeText).join(", ")}`,
  )} {}`;
};
