import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as types from "./types";
import * as someType from "./some-type";
import * as signature from "./signature";

export class CodeGenerator {
  private readonly _typeToText: (type: typedoc.SomeType) => string;
  private readonly _sigToText: (sig: typedoc.SignatureReflection) => string;
  public constructor(private readonly index: types.ModelIndex) {
    // Don't save these to class fields immediately, to catch any situations where the callbacks passed to
    // someType.createGetSomeTypeText and signature.createGetSignatureText would get invoked immediately.
    const typeToText = someType.createGetSomeTypeText(
      (type) =>
        typeof type.target === "number"
          ? `ref ${type.target}`
          : `${type.qualifiedName ?? type.name}@${type.package}`,
      (sig) => this._sigToText(sig),
    );
    const sigToText = signature.createGetSignatureText((type) =>
      this._typeToText(type),
    );

    this._typeToText = typeToText;
    this._sigToText = sigToText;
  }

  public getTypeText(type: typedoc.SomeType) {
    return this._typeToText(type);
  }

  public getSignatureText(sig: typedoc.SignatureReflection) {
    return this._sigToText(sig);
  }
}
