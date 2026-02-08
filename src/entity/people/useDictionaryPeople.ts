import { MappingExtends } from "../../utils/general";
import { reverseKeys } from "../../utils/general";
import { DictionaryEngToRussian } from "./peopleTypes";

export function mapDictionaryPeople<
  T extends MappingExtends,
  U extends MappingExtends,
>(data: Record<T, string>[]): Record<U, string>[] {
  if (!data || data.length === 0) return [];

  return data.map((el) => reverseKeys<T, U>(el, DictionaryEngToRussian));
}
