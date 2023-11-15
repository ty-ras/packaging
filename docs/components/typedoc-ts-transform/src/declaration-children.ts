import * as declarations from "./declarations";

export const getDeclarationChildren: declarations.GetChildren = (args) =>
  declarations.useFunctionality(args.declaration, "getChildren")(args);
