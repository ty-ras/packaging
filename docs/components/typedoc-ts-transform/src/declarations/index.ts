import { Throw } from "throw-expression";
import type * as types from "../types";
import * as kind from "../reflection-kind";
import classes from "./classes";
import interfaces from "./interfaces";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import functions from "./functions";
import typeAliases from "./type-aliases";
import typeLiterals from "./type-literals";
import type * as toTextTypes from "./types";

export type * from "./types";

export const useFunctionality = <
  TKey extends keyof toTextTypes.ReflectionKindFunctionality,
>(
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  name: TKey,
): toTextTypes.ReflectionKindFunctionality[TKey] =>
  (functionalities[declaration.kind] ??
    Throw(`Implement to-text functionality for ${declaration.kind}`))[name];

const functionalities: Partial<
  Record<kind.ReflectionKind, toTextTypes.ReflectionKindFunctionality>
> = {
  [kind.ReflectionKind.Function]: functions,
  [kind.ReflectionKind.Class]: classes,
  [kind.ReflectionKind.Interface]: interfaces,
  [kind.ReflectionKind.Constructor]: constructors,
  [kind.ReflectionKind.Property]: properties,
  [kind.ReflectionKind.Method]: methods,
  [kind.ReflectionKind.TypeLiteral]: typeLiterals,
  [kind.ReflectionKind.TypeAlias]: typeAliases,
};
