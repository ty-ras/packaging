import type * as types from "./types";
import * as kind from "./reflection-kind";
import * as text from "./text";
import * as errors from "./errors";

export const createGetDeclarationText = (
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  function getDeclarationText(declaration: types.IndexableModel) {
    return `${getReflectionKindTypeScriptName(declaration.kind)} ${
      declaration.name
    }${text.getOptionalValueText(
      declaration.typeParameters,
      (typeParams) =>
        `<${typeParams
          .map(
            (typeParam) =>
              `${typeParam.name}${text.getOptionalValueText(
                typeParam.type,
                (parentType) => ` extends ${getTypeText(parentType)}`,
              )}${text.getOptionalValueText(
                typeParam.default,
                (defaultValue) => ` = ${getTypeText(defaultValue)}`,
              )}`,
          )
          .join(", ")}>${getDeclarationBodyText(
          getTypeText,
          getSignatureText,
          declaration,
        )}`,
    )}`;
  }

  return getDeclarationText;
};

export const getReflectionKindTypeScriptName = (
  reflectionKind: kind.ReflectionKind,
): string => {
  switch (reflectionKind) {
    case kind.ReflectionKind.Enum:
      return "enum";
    case kind.ReflectionKind.Variable:
      return "const";
    case kind.ReflectionKind.Function:
      return "function";
    case kind.ReflectionKind.Class:
      return "class";
    case kind.ReflectionKind.Interface:
      return "interface";
    case kind.ReflectionKind.Constructor:
      return "constructor";
    default:
      throw new Error(`Implement title name for ${reflectionKind}.`);
  }
};

const getDeclarationBodyText = (
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
  declaration: types.IndexableModel,
) => {
  switch (declaration.kind) {
    case kind.ReflectionKind.Class:
      return getClassBodyText(declaration, getTypeText);
    case kind.ReflectionKind.Function:
      return (
        declaration.signatures ?? errors.doThrow("Function without signatures?")
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
  declaration: types.IndexableModel,
  getTypeText: types.GetSomeTypeText,
) => {
  return `${text.getOptionalValueText(
    declaration.extendedTypes,
    (parentTypes) => ` extends ${parentTypes.map(getTypeText).join(", ")}`,
  )}${text.getOptionalValueText(
    declaration.implementedTypes,
    (implementedTypes) =>
      ` implements ${implementedTypes.map(getTypeText).join(", ")}`,
  )} {}`;
};
