import { Box } from "@suid/material";
import { For, Match, Show, Switch } from "solid-js";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import type * as types from "./types";
import SingleLineCode from "./SingleLineCode";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function ElementDefinition(props: ElementDefinitionProps) {
  return (
    <Box>
      <SingleLineCode>
        <b>{functionality.getReflectionKindTitle(props.element.kind)}</b>{" "}
        {props.element.name}
        <Switch>
          <Match
            when={props.element.kind === functionality.ReflectionKind.Class}
          >
            <Show when={props.element.typeParameters}>
              {(typeParams) => (
                <>
                  {"<"}
                  <For each={typeParams()}>
                    {(typeParam, index) => (
                      <>
                        {typeParam.name}
                        {typeParam.type &&
                          ` extends ${getSomeTypeText(typeParam.type)}`}
                        {typeParam.default &&
                          ` = ${getSomeTypeText(typeParam.default)}`}
                        {index() === typeParams().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                  {">"}
                </>
              )}
            </Show>
            <Show when={props.element.extendedTypes}>
              {(parentTypes) => (
                <>
                  {" extends "}
                  <For each={parentTypes()}>
                    {(parentType, index) => (
                      <>
                        {getSomeTypeText(parentType)}
                        {index() === parentTypes().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                </>
              )}
            </Show>
            <Show when={props.element.implementedTypes}>
              {(implementedTypes) => (
                <>
                  {" implements "}
                  <For each={implementedTypes()}>
                    {(implementedType, index) => (
                      <>
                        {getSomeTypeText(implementedType)}
                        {index() === implementedTypes().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                </>
              )}
            </Show>
          </Match>
        </Switch>
      </SingleLineCode>
    </Box>
  );
}

export interface ElementDefinitionProps extends types.ReflectionElementProps {
  // Currently no extra properties
}

const getSomeTypeText = (type: typedoc.SomeType): string => {
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
      return `infer ${type.name}${getOptionalValueText(
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
      return `{${getOptionalValueText(
        type.readonlyModifier,
        (roMod) => ` ${onlyMinus(roMod)}readonly `,
      )}[${type.parameter} in ${getSomeTypeText(
        type.parameterType,
      )}${getOptionalValueText(
        type.nameType,
        (nameType) => ` as ${getSomeTypeText(nameType)}`,
      )}]${getOptionalValueText(
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
      return type.refersToTypeParameter
        ? type.name
        : typeof type.target === "number"
        ? `ref ${type.target}`
        : `${type.qualifiedName ?? type.name}@${type.package}`;
    case "reflection":
      return getDeclarationReferenceText(type.declaration);
    case "rest":
      return `...${getSomeTypeText(type.elementType)}`;
    case "templateLiteral":
      return `${"`"}${type.head}${type.tail
        .map(
          ([someType, strFrag]) => `\${${getSomeTypeText(someType)}}${strFrag}`,
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
};

const getDeclarationReferenceText = (
  declaration: typedoc.DeclarationReflection,
): string => {
  switch (declaration.kind) {
    case functionality.ReflectionKind.Enum:
    case functionality.ReflectionKind.EnumMember:
    case functionality.ReflectionKind.Class:
    case functionality.ReflectionKind.Interface:
      return declaration.name;
    case functionality.ReflectionKind.Function:
    case functionality.ReflectionKind.Constructor:
      return getSignatureText(ensureOneSignature(declaration.signatures));
    default:
      throw new Error(`No implementation for declaration ${declaration.kind}`);
  }
};

const getSignatureText = (signature: typedoc.SignatureReflection): string => {
  const str = getFlagsText(signature.flags);
  return `${str}${
    signature.kind === functionality.ReflectionKind.ConstructorSignature
      ? " new "
      : ""
  }(${signature.parameters?.map(
    (p) =>
      `${getParametersFlagsText(p.flags)}${p.name}: ${getSomeTypeText(
        p.type ?? functionality.doThrow("Parameter without type"),
      )}${getOptionalValueText(
        p.defaultValue,
        (defaultValue) => ` = ${defaultValue}`,
      )}`,
  )}) => ${getSomeTypeText(
    signature.type ??
      functionality.doThrow("Function signature without return type"),
  )}`;
};

const getFlagsText = (flags: typedoc.ReflectionFlags): string =>
  Object.entries(flags)
    .filter(([key, val]) => val && key !== "isExternal")
    .map(([key]) => key.substring(key.search(/[A-Z]/)).toLowerCase())
    .join(" ");

const getParametersFlagsText = (flags: typedoc.ReflectionFlags): string => {
  let retVal = "";
  if (flags.isRest) {
    retVal = `${retVal}...`;
  }
  return retVal;
};

const ensureOneSignature = (
  signatures: ReadonlyArray<typedoc.SignatureReflection> | undefined,
): typedoc.SignatureReflection =>
  (signatures?.length === 1 ? signatures[0] : undefined) ??
  functionality.doThrow(
    `Expected one signature but had ${signatures?.length}.`,
  );

function getOptionalValueText<T>(
  type: T | undefined,
  transform: (type: T) => string,
) {
  return type ? transform(type) : "";
}

function onlyMinus(str: "+" | "-") {
  return str === "-" ? str : "";
}
