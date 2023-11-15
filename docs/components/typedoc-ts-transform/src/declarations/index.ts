import { Throw } from "throw-expression";
import type * as types from "../types";
import * as kind from "../reflection-kind";
import classes from "./classes";
import constructors from "./constructors";
import properties from "./properties";
import methods from "./methods";
import functions from "./functions";
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
  [kind.ReflectionKind.Class]: classes,
  [kind.ReflectionKind.Constructor]: constructors,
  [kind.ReflectionKind.Property]: properties,
  [kind.ReflectionKind.Method]: methods,
  [kind.ReflectionKind.Function]: functions,
};
