import { Throw } from "throw-expression";
import type * as codeGenTypes from "../types";
import * as kind from "../reflection-kind";
import classes from "./classes";
import interfaces from "./interfaces";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import functions from "./functions";
import typeAliases from "./type-aliases";
import typeLiterals from "./type-literals";
import variables from "./variables";
import type * as types from "./functionality.types";

export type * from "./functionality.types";

export const useFunctionality = <
  TKey extends keyof types.ReflectionKindFunctionality,
>(
  declaration: codeGenTypes.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  name: TKey,
): types.ReflectionKindFunctionality[TKey] =>
  (functionalities[declaration.kind] ??
    Throw(`Implement to-text functionality for ${declaration.kind}`))[name];

const functionalities: Partial<
  Record<kind.ReflectionKind, types.ReflectionKindFunctionality>
> = {
  [kind.ReflectionKind.Variable]: variables,
  [kind.ReflectionKind.Function]: functions,
  [kind.ReflectionKind.Class]: classes,
  [kind.ReflectionKind.Interface]: interfaces,
  [kind.ReflectionKind.Constructor]: constructors,
  [kind.ReflectionKind.Property]: properties,
  [kind.ReflectionKind.Method]: methods,
  [kind.ReflectionKind.TypeLiteral]: typeLiterals,
  [kind.ReflectionKind.TypeAlias]: typeAliases,
};
