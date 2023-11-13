import { Throw } from "throw-expression";
import type * as types from "../types";
import * as text from "../text";
import * as kind from "../reflection-kind";
import classes from "./classes";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import functions from "./functions";
import type * as toTextTypes from "./types";

export const createGetDeclarationText = (
  codeGenerationContext: text.CodeGenerationContext,
  index: types.ModelIndex,
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
  Record<kind.ReflectionKind, toTextTypes.ReflectionKindFunctionality>
> = {
  [kind.ReflectionKind.Class]: classes,
  [kind.ReflectionKind.Constructor]: constructors,
  [kind.ReflectionKind.Property]: properties,
  [kind.ReflectionKind.Method]: methods,
  [kind.ReflectionKind.Function]: functions,
};

export const useFunctionality = <
  TKey extends keyof toTextTypes.ReflectionKindFunctionality,
>(
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  name: TKey,
): toTextTypes.ReflectionKindFunctionality[TKey] =>
  (functionalities[declaration.kind] ??
    Throw(`Implement to-text functionality for ${declaration.kind}`))[name];
