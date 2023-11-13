import type * as types from "./types";
import * as functionality from "@typedoc-2-ts/transform";
import SmallHeader, { type SmallHeaderProps } from "./SmallHeader";

export default function Title(props: TitleProps) {
  return (
    // <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", width: "auto" }}>
    <SmallHeader headerLevel={props.headerLevel}>
      {getReflectionKindTypeScriptName(props.element.kind)} {props.element.name}
    </SmallHeader>
    // </Box>
  );
}

export interface TitleProps
  extends types.ReflectionElementProps,
    SmallHeaderProps {}

const getReflectionKindTypeScriptName = (
  reflectionKind: functionality.ReflectionKind,
): string => {
  switch (reflectionKind) {
    case functionality.ReflectionKind.Enum:
      return "enum";
    case functionality.ReflectionKind.Variable:
      return "const";
    case functionality.ReflectionKind.Function:
      return "function";
    case functionality.ReflectionKind.Class:
      return "class";
    case functionality.ReflectionKind.Interface:
      return "interface";
    case functionality.ReflectionKind.Constructor:
      return "constructor";
    case functionality.ReflectionKind.Property:
      return "property";
    case functionality.ReflectionKind.Method:
      return "method";
    default:
      throw new Error(`Implement TS name for ${reflectionKind}.`);
  }
};
