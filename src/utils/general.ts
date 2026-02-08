export type MappingExtends = string | number | symbol;

export type TranslationDictionary<
  From extends string,
  To extends string,
> = Record<From, To>;

export function reverseKeys<T extends MappingExtends, U extends MappingExtends>(
  obj: Record<T, string>,
  dictionary: any,
): Record<U, string> {
  const mapping = Object.entries(dictionary);

  const foundedObject = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const typeset = key as T;
      const typesetValue = value as string;

      const fondedObject = mapping.find(([_, value]) => value === typeset);

      if (fondedObject?.length) {
        return [fondedObject[0], typesetValue];
      } else {
        return ["nothing" as U, typesetValue];
      }
    }),
  ) as Record<U, string>;

  return foundedObject;
}
