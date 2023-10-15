export const getReflectionKindTitle = (kind: ReflectionKind): string => {
  switch (kind) {
    case ReflectionKind.Enum:
      return "enum";
    case ReflectionKind.Variable:
      return "const";
    case ReflectionKind.Function:
      return "function";
    case ReflectionKind.Class:
      return "class";
    case ReflectionKind.Interface:
      return "interface";
  }
};

// declaration: DeclarationReflection;
// param: ParameterReflection;
// project: ProjectReflection;
// reference: ReferenceReflection;
// signature: SignatureReflection;
// typeParam: TypeParameterReflection;

// We can't include this from typedoc package in browsers
// See: https://github.com/TypeStrong/typedoc/issues/1861
export enum ReflectionKind {
  Project = 0x1,
  Module = 0x2,
  Namespace = 0x4,
  Enum = 0x8,
  EnumMember = 0x10,
  Variable = 0x20,
  Function = 0x40,
  Class = 0x80,
  Interface = 0x100,
  Constructor = 0x200,
  Property = 0x400,
  Method = 0x800,
  CallSignature = 0x1000,
  IndexSignature = 0x2000,
  ConstructorSignature = 0x4000,
  Parameter = 0x8000,
  TypeLiteral = 0x10000,
  TypeParameter = 0x20000,
  Accessor = 0x40000,
  GetSignature = 0x80000,
  SetSignature = 0x100000,
  ObjectLiteral = 0x200000,
  TypeAlias = 0x400000,
  Event = 0x800000,
  Reference = 0x1000000,
}
