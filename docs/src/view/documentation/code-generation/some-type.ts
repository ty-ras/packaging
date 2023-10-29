import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as types from "./types";

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
        return `infer ${type.name}${functionality.getOptionalValueText(
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
        return `{${functionality.getOptionalValueText(
          type.readonlyModifier,
          (roMod) => ` ${onlyMinus(roMod)}readonly `,
        )}[${type.parameter} in ${getSomeTypeText(
          type.parameterType,
        )}${functionality.getOptionalValueText(
          type.nameType,
          (nameType) => ` as ${getSomeTypeText(nameType)}`,
        )}]${functionality.getOptionalValueText(
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
        }${functionality.getOptionalValueText(
          type.typeArguments,
          (typeArgs) => `<${typeArgs.map(getSomeTypeText)}>`,
        )}`;
      case "reflection":
        return getDeclarationReferenceText(
          type.declaration,
          getSignatureText,
          getSomeTypeText,
        );
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
  getSomeTypeText: types.GetSomeTypeText,
): string => {
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
        ? getSomeTypeText(declaration.type)
        : getSignatureText(functionality.ensureOneItem(declaration.signatures));
    default:
      throw new Error(`No implementation for declaration ${declaration.kind}`);
  }
};

function onlyMinus(str: "+" | "-") {
  return str === "-" ? str : "";
}
