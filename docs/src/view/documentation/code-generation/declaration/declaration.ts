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
  codeGenerationContext: text.CodeGenerationContext,
  index: functionality.ModelIndex,
  getTypeText: types.GetSomeTypeText,
  getSignatureText: types.GetSignatureText,
): types.GetDeclarationText => {
  const { code } = codeGenerationContext;
  function getDeclarationText(
    declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  ): text.IntermediateCode {
    const textFunctionality = useFunctionality(declaration, "text");
    return typeof textFunctionality === "function"
      ? textFunctionality({
          codeGenerationContext,
          index,
          getTypeText,
          getSignatureText,
          getDeclarationText,
          declaration,
        })
      : code`${textFunctionality.getPrefixText({
          codeGenerationContext,
          declaration,
        })} ${text.ref(
          declaration.name,
          declaration.id,
        )}${text.getOptionalValueText(
          declaration.typeParameters,
          (typeParams) =>
            code`<${text.join(
              typeParams.map(
                (typeParam) =>
                  code`${text.text(typeParam.name)}${text.getOptionalValueText(
                    typeParam.type,
                    (parentType) => code` extends ${getTypeText(parentType)}`,
                  )}${text.getOptionalValueText(
                    typeParam.default,
                    (defaultValue) => code` = ${getTypeText(defaultValue)}`,
                  )}`,
              ),
              ", ",
            )}>`,
        )}${textFunctionality.getBodyText({
          codeGenerationContext,
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
