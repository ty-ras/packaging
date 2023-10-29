import * as functionality from "../../functionality";
import type * as types from "../types";
import classes from "./classes";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import type * as toTextTypes from "./types";

export const createGetDeclarationText = (
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  function getDeclarationText(declaration: functionality.IndexableModel) {
    return `${useFunctionality(declaration, "getPrefixText", {
      declaration,
    })} ${declaration.name}${functionality.getOptionalValueText(
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
    )}${useFunctionality(declaration, "getBodyText", {
      index,
      getTypeText,
      getSignatureText,
      getDeclarationText,
      declaration,
    })}`;
  }

  return getDeclarationText;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const functionalities: Record<
  functionality.ReflectionKind,
  toTextTypes.ReflectionKindFunctionality
> = {
  [functionality.ReflectionKind.Class]: classes,
  [functionality.ReflectionKind.Constructor]: constructors,
  [functionality.ReflectionKind.Property]: properties,
  [functionality.ReflectionKind.Method]: methods,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const useFunctionality = <
  TKey extends keyof toTextTypes.ReflectionKindFunctionality,
>(
  declaration: functionality.IndexableModel,
  name: TKey,
  ...args: Parameters<toTextTypes.ReflectionKindFunctionality[TKey]>
): ReturnType<toTextTypes.ReflectionKindFunctionality[TKey]> =>
  (functionalities[declaration.kind] ??
    functionality.doThrow(
      `Implement to-text functionality for ${declaration.kind}`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    ))[name](...(args as [any])) as ReturnType<
    toTextTypes.ReflectionKindFunctionality[TKey]
  >;
