import * as functionality from "../../functionality";
import type * as types from "../types";
import * as text from "../text";
import classes from "./classes";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import functions from "./functions";
import type * as toTextTypes from "./types";

export const createGetDeclarationText = (
  textGenerationContext: text.CodeGenerationContext,
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  function getDeclarationText(
    declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  ): types.Code {
    const textFunctionality = useFunctionality(declaration, "text");
    return typeof textFunctionality === "function"
      ? textFunctionality({
          index,
          getTypeText,
          getSignatureText,
          getDeclarationText,
          declaration,
        })
      : textGenerationContext.code`${textFunctionality.getPrefixText({
          declaration,
        })} ${declaration.name}${text.getOptionalValueText(
          declaration.typeParameters,
          (typeParams) =>
            `<${typeParams
              .map(
                (typeParam) =>
                  textGenerationContext.code`${
                    typeParam.name
                  }${text.getOptionalValueText(
                    typeParam.type,
                    (parentType) => ` extends ${getTypeText(parentType)}`,
                  )}${text.getOptionalValueText(
                    typeParam.default,
                    (defaultValue) => ` = ${getTypeText(defaultValue)}`,
                  )}`,
              )
              .join(", ")}>`,
        )}${textFunctionality.getBodyText({
          index,
          getTypeText,
          getSignatureText,
          getDeclarationText,
          declaration,
        })}`;
  }

  return getDeclarationText;
};

const functionalities: Partial<
  Record<functionality.ReflectionKind, toTextTypes.ReflectionKindFunctionality>
> = {
  [functionality.ReflectionKind.Class]: classes,
  [functionality.ReflectionKind.Constructor]: constructors,
  [functionality.ReflectionKind.Property]: properties,
  [functionality.ReflectionKind.Method]: methods,
  [functionality.ReflectionKind.Function]: functions,
};

export const useFunctionality = <
  TKey extends keyof toTextTypes.ReflectionKindFunctionality,
>(
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  name: TKey,
): toTextTypes.ReflectionKindFunctionality[TKey] =>
  (functionalities[declaration.kind] ??
    functionality.doThrow(
      `Implement to-text functionality for ${declaration.kind}`,
    ))[name];
