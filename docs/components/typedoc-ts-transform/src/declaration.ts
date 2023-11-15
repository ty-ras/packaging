import type * as types from "./types";
import * as text from "./text";
import * as declarations from "./declarations";

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
    const textFunctionality = declarations.useFunctionality(
      declaration,
      "text",
    );
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
