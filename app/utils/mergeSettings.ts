export function mergeSettings<T extends Record<string, any>>(
  base: T,
  override: Partial<T>,
): T {
  const result = { ...base };

  for (const key of Object.keys(override) as (keyof T)[]) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (
      isPlainObject(baseValue) &&
      isPlainObject(overrideValue)
    ) {
      result[key] = mergeSettings(
        baseValue,
        overrideValue,
      ) as T[keyof T];
    } else {
      result[key] = overrideValue as T[keyof T];
    }
  }

  return result;
}

function isPlainObject(
  value: unknown,
): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}