import * as codeGen from "@typedoc-2-ts/transform";
import SmallHeader, { type SmallHeaderProps } from "./SmallHeader";
import type * as functionality from "@typedoc-2-ts/browser";

export default function Title(props: TitleProps) {
  return (
    // <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", width: "auto" }}>
    <SmallHeader headerLevel={props.headerLevel}>
      {getReflectionKindTypeScriptName(props.element.kind)} {props.element.name}
    </SmallHeader>
    // </Box>
  );
}

export interface TitleProps extends SmallHeaderProps {
  element: functionality.IndexableModel;
}

const getReflectionKindTypeScriptName = (
  reflectionKind: codeGen.ReflectionKind,
): string => {
  switch (reflectionKind) {
    case codeGen.ReflectionKind.Enum:
      return "enum";
    case codeGen.ReflectionKind.Variable:
      return "const";
    case codeGen.ReflectionKind.Function:
      return "function";
    case codeGen.ReflectionKind.Class:
      return "class";
    case codeGen.ReflectionKind.Interface:
      return "interface";
    case codeGen.ReflectionKind.Constructor:
      return "constructor";
    case codeGen.ReflectionKind.Property:
      return "property";
    case codeGen.ReflectionKind.Method:
      return "method";
    default:
      throw new Error(`Implement TS name for ${reflectionKind}.`);
  }
};
