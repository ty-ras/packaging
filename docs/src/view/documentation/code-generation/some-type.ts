import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as types from "./types";
import * as text from "./text";

export const createGetSomeTypeText = (
  textGenerationContext: text.CodeGenerationContext,
  refToStr: (ref: typedoc.ReferenceType) => string,
  getSignatureText: types.GetSignatureText,
  getDeclarationText: types.GetDeclarationText,
): types.GetSomeTypeText => {
  function getSomeTypeText(type: typedoc.SomeType): types.Code {
    switch (type.type) {
      case "array":
        return textGenerationContext.code`Array<${getSomeTypeText(
          type.elementType,
        )}>`;
      case "conditional":
        return textGenerationContext.code`${getSomeTypeText(
          type.checkType,
        )} extends ${getSomeTypeText(type.extendsType)} ? ${getSomeTypeText(
          type.trueType,
        )} : ${getSomeTypeText(type.falseType)}`;
      case "indexedAccess":
        return textGenerationContext.code`${getSomeTypeText(
          type.objectType,
        )}[${getSomeTypeText(type.indexType)}]`;
      case "inferred":
        return textGenerationContext.code`infer ${
          type.name
        }${text.getOptionalValueText(
          type.constraint,
          (constraint) => ` extends ${getSomeTypeText(constraint)}`,
        )}`;
      case "intersection":
        return type.types.map(getSomeTypeText).join(" & ");
      case "intrinsic":
        return textGenerationContext.code`${type.name}`;
      case "literal":
        return `"${type.value}"`;
      case "mapped":
        return textGenerationContext.code`{${text.getOptionalValueText(
          type.readonlyModifier,
          (roMod) => ` ${onlyMinus(roMod)}readonly `,
        )}[${type.parameter} in ${getSomeTypeText(
          type.parameterType,
        )}${text.getOptionalValueText(
          type.nameType,
          (nameType) => ` as ${getSomeTypeText(nameType)}`,
        )}]${text.getOptionalValueText(
          type.optionalModifier,
          (optMod) => `${onlyMinus(optMod)}?`,
        )}: ${getSomeTypeText(type.templateType)}}`;
      case "namedTupleMember":
        return textGenerationContext.code`[${type.name}${
          type.isOptional ? "?" : ""
        }: ${getSomeTypeText(type.element)}]`;
      case "optional":
        return textGenerationContext.code`${getSomeTypeText(
          type.elementType,
        )}?`;
      case "predicate":
        return type.targetType
          ? textGenerationContext.code`${type.asserts ? "asserts " : ""}${
              type.name
            } is ${getSomeTypeText(type.targetType)}`
          : textGenerationContext.code`asserts ${type.name}`;
      case "query":
        return textGenerationContext.code`typeof ${getSomeTypeText(
          type.queryType,
        )}`;
      case "reference":
        return textGenerationContext.code`${
          type.refersToTypeParameter ? type.name : refToStr(type)
        }${text.getOptionalValueText(
          type.typeArguments,
          (typeArgs) => `<${typeArgs.map(getSomeTypeText)}>`,
        )}`;
      case "reflection":
        return getDeclarationReferenceText(
          type.declaration,
          getSignatureText,
          getDeclarationText,
          getSomeTypeText,
        );
      case "rest":
        return textGenerationContext.code`...${getSomeTypeText(
          type.elementType,
        )}`;
      case "templateLiteral":
        return textGenerationContext.code`${"`"}${type.head}${type.tail
          .map(
            ([someType, strFrag]) =>
              `\${${getSomeTypeText(someType)}}${strFrag}`,
          )
          .join("")}${"`"}`;
      case "tuple":
        return textGenerationContext.code`[${
          type.elements?.map(getSomeTypeText).join(", ") ?? ""
        }]`;
      case "typeOperator":
        return textGenerationContext.code`${type.operator} ${getSomeTypeText(
          type.target,
        )}`;
      case "union":
        return type.types.map(getSomeTypeText).join(" | ");
      case "unknown":
        return type.name;
      default:
        throw new Error(
          `No implementation for type ${(type as typedoc.SomeType).type}`,
        );
    }
  }
  return getSomeTypeText;
};

const getDeclarationReferenceText = (
  declaration: typedoc.DeclarationReflection,
  getSignatureText: types.GetSignatureText,
  getDeclarationText: types.GetDeclarationText,
  getSomeTypeText: types.GetSomeTypeText,
): types.Code => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Enum:
    case functionality.ReflectionKind.EnumMember:
    case functionality.ReflectionKind.Class:
    case functionality.ReflectionKind.Interface:
      return declaration.name;
    case functionality.ReflectionKind.Function:
    case functionality.ReflectionKind.Constructor:
      return getSignatureText(
        functionality.ensureOneItem(declaration.signatures),
        types.SIG_CONTEXT_TYPE,
      );
    case functionality.ReflectionKind.TypeLiteral:
      return declaration.type
        ? // This is just reference to another type
          getSomeTypeText(declaration.type)
        : declaration.signatures?.length === 1
        ? // This is function type
          getSignatureText(functionality.ensureOneItem(declaration.signatures))
        : // Inline type spec
          getDeclarationText(declaration);
    default:
      throw new Error(`No implementation for declaration ${declaration.kind}`);
  }
};

function onlyMinus(str: "+" | "-") {
  return str === "-" ? str : "";
}
