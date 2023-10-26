import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as kind from "./reflection-kind";
import * as errors from "./errors";
import * as text from "./text";
import type * as types from "./types";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export const createGetSomeTypeText = (
  refToStr: (ref: typedoc.ReferenceType) => string,
  getSignatureText: types.GetSignatureText,
): types.GetSomeTypeText => {
  function getSomeTypeText(type: typedoc.SomeType): string {
    switch (type.type) {
      case "array":
        return `Array<${getSomeTypeText(type.elementType)}>`;
      case "conditional":
        return `${getSomeTypeText(type.checkType)} extends ${getSomeTypeText(
          type.extendsType,
        )} ? ${getSomeTypeText(type.trueType)} : ${getSomeTypeText(
          type.falseType,
        )}`;
      case "indexedAccess":
        return `${getSomeTypeText(type.objectType)}[${getSomeTypeText(
          type.indexType,
        )}]`;
      case "inferred":
        return `infer ${type.name}${text.getOptionalValueText(
          type.constraint,
          (constraint) => ` extends ${getSomeTypeText(constraint)}`,
        )}`;
      case "intersection":
        return type.types.map(getSomeTypeText).join(" & ");
      case "intrinsic":
        return type.name;
      case "literal":
        return `"${type.value}"`;
      case "mapped":
        return `{${text.getOptionalValueText(
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
        return `[${type.name}${type.isOptional ? "?" : ""}: ${getSomeTypeText(
          type.element,
        )}]`;
      case "optional":
        return `${getSomeTypeText(type.elementType)}?`;
      case "predicate":
        return type.targetType
          ? `${type.asserts ? "asserts " : ""}${type.name} is ${getSomeTypeText(
              type.targetType,
            )}`
          : `asserts ${type.name}`;
      case "query":
        return `typeof ${getSomeTypeText(type.queryType)}`;
      case "reference":
        return `${
          type.refersToTypeParameter ? type.name : refToStr(type)
        }${text.getOptionalValueText(
          type.typeArguments,
          (typeArgs) => `<${typeArgs.map(getSomeTypeText)}>`,
        )}`;
      case "reflection":
        return getDeclarationReferenceText(type.declaration, getSignatureText);
      case "rest":
        return `...${getSomeTypeText(type.elementType)}`;
      case "templateLiteral":
        return `${"`"}${type.head}${type.tail
          .map(
            ([someType, strFrag]) =>
              `\${${getSomeTypeText(someType)}}${strFrag}`,
          )
          .join("")}${"`"}`;
      case "tuple":
        return `[${type.elements?.map(getSomeTypeText).join(", ") ?? ""}]`;
      case "typeOperator":
        return `${type.operator} ${getSomeTypeText(type.target)}`;
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
): string => {
  switch (declaration.kind) {
    case kind.ReflectionKind.Enum:
    case kind.ReflectionKind.EnumMember:
    case kind.ReflectionKind.Class:
    case kind.ReflectionKind.Interface:
      return declaration.name;
    case kind.ReflectionKind.Function:
    case kind.ReflectionKind.Constructor:
      return getSignatureText(ensureOneSignature(declaration.signatures), "=>");
    default:
      throw new Error(`No implementation for declaration ${declaration.kind}`);
  }
};

const ensureOneSignature = (
  signatures: ReadonlyArray<typedoc.SignatureReflection> | undefined,
): typedoc.SignatureReflection =>
  (signatures?.length === 1 ? signatures[0] : undefined) ??
  errors.doThrow(`Expected one signature but had ${signatures?.length}.`);

function onlyMinus(str: "+" | "-") {
  return str === "-" ? str : "";
}
