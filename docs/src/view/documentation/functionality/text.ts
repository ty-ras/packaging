export function getOptionalValueText<T>(
  type: T | undefined,
  transform: (type: T) => string,
) {
  return type ? transform(type) : "";
}
