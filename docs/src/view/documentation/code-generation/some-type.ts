import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as types from "./types";
import * as text from "./text";

export const createGetSomeTypeText = (
  { code }: text.CodeGenerationContext,
  refToStr: (ref: typedoc.ReferenceType) => text.IntermediateCode,
  getSignatureText: types.GetSignatureText,
  getDeclarationText: types.GetDeclarationText,
): types.GetSomeTypeText => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function getSomeTypeText(type: typedoc.SomeType): text.IntermediateCode {
    switch (type.type) {
      case "array":
        return code`Array<${getSomeTypeText(type.elementType)}>`;
      case "conditional":
        return code`${getSomeTypeText(
          type.checkType,
        )} extends ${getSomeTypeText(type.extendsType)} ? ${getSomeTypeText(
          type.trueType,
        )} : ${getSomeTypeText(type.falseType)}`;
      case "indexedAccess":
        return code`${getSomeTypeText(type.objectType)}[${getSomeTypeText(
          type.indexType,
        )}]`;
      case "inferred":
        return code`infer ${text.text(type.name)}${text.getOptionalValueText(
          type.constraint,
          (constraint) => code` extends ${getSomeTypeText(constraint)}`,
        )}`;
      case "intersection":
        return code`${text.join(type.types.map(getSomeTypeText), " & ")}`;
      case "intrinsic":
        return code`${text.text(type.name)}`;
      case "literal":
        return code`${
          typeof type.value === "string"
            ? code`"${text.text(type.value)}"`
            : isBigInt(type.value)
            ? code`${type.value}`
            : type.value
        }`;
      case "mapped":
        return code`{${text.getOptionalValueText(
          type.readonlyModifier,
          (roMod) => code` ${onlyMinus(roMod)}readonly `,
        )}[${text.text(type.parameter)} in ${getSomeTypeText(
          type.parameterType,
        )}${text.getOptionalValueText(
          type.nameType,
          (nameType) => code` as ${getSomeTypeText(nameType)}`,
        )}]${text.getOptionalValueText(
          type.optionalModifier,
          (optMod) => code`${onlyMinus(optMod)}?`,
        )}: ${getSomeTypeText(type.templateType)}}`;
      case "namedTupleMember":
        return code`[${text.text(type.name)}${text.text(
          type.isOptional ? "?" : "",
        )}: ${getSomeTypeText(type.element)}]`;
      case "optional":
        return code`${getSomeTypeText(type.elementType)}?`;
      case "predicate":
        return type.targetType
          ? code`${text.text(type.asserts ? "asserts " : "")}${text.text(
              type.name,
            )} is ${getSomeTypeText(type.targetType)}`
          : code`asserts ${text.text(type.name)}`;
      case "query":
        return code`typeof ${getSomeTypeText(type.queryType)}`;
      case "reference":
        return code`${
          type.refersToTypeParameter ? text.text(type.name) : refToStr(type)
        }${text.getOptionalValueText(
          type.typeArguments,
          (typeArgs) =>
            code`<${text.join(typeArgs.map(getSomeTypeText), ", ")}>`,
        )}`;
      case "reflection":
        return getDeclarationReferenceText(
          type.declaration,
          getSignatureText,
          getDeclarationText,
          getSomeTypeText,
        );
      case "rest":
        return code`...${getSomeTypeText(type.elementType)}`;
      case "templateLiteral":
        return code`${text.text("`")}${text.text(type.head)}${text.join(
          type.tail.map(
            ([someType, strFrag]) =>
              code`\${${getSomeTypeText(someType)}}${text.text(strFrag)}`,
          ),
          "",
        )}${text.text("`")}`;
      case "tuple":
        return code`[${text.join(
          type.elements?.map(getSomeTypeText) ?? [],
          ", ",
        )}]`;
      case "typeOperator":
        return code`${text.text(type.operator)} ${getSomeTypeText(
          type.target,
        )}`;
      case "union":
        return text.join(type.types.map(getSomeTypeText), " | ");
      case "unknown":
        return code`${text.text(type.name)}`;
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
): text.IntermediateCode => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Enum:
    case functionality.ReflectionKind.EnumMember:
    case functionality.ReflectionKind.Class:
    case functionality.ReflectionKind.Interface:
      return [text.ref(declaration.name, declaration.id)];
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

function onlyMinus(str: "+" | "-"): text.JustText {
  return text.text(str === "-" ? str : "");
}

const isBigInt = (
  val: text.LiteralValue,
): val is { value: string; negative: boolean } =>
  typeof val === "object" && !!val && "value" in val && "negative" in val;
