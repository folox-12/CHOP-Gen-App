import { TranslationDictionary } from "../../utils/general";

export type PeopleType = Record<PeopleFieldKeysEng, string>;
export type PeopleTypeLess = Pick<
  PeopleType,
  | "dateOfBirth"
  | "dateOfAdmission"
  | "PPPeriod"
  | "category"
  | "passport"
  | "registrationAddress"
> & {
  id: string;
  fullName: string;
  YCHO: string;
};

export type PeopleFieldKeysRus =
  | "Имя"
  | "Фамилия"
  | "Отчество"
  | "Дата рожд."
  | "Дата приема"
  | "Срок ПП"
  | "Категория"
  | "Паспорт"
  | "Серия УДЧО"
  | "№ УДЧО"
  | "Адрес регистрации"
  | "Пустое свойство"
  | "ФИО"
  | "УЧО";

export type PeopleFieldKeysEng =
  | "name"
  | "lastName"
  | "middleName"
  | "dateOfBirth"
  | "dateOfAdmission"
  | "PPPeriod"
  | "category"
  | "passport"
  | "seriesYCHO"
  | "numberYCHO"
  | "registrationAddress"
  | "nothing"
  | "fullName"
  | "YCHO";

export type PeopleDictionary = TranslationDictionary<
  PeopleFieldKeysEng,
  PeopleFieldKeysRus
>;

export const DictionaryEngToRussian: PeopleDictionary = {
  name: "Имя",
  lastName: "Фамилия",
  middleName: "Отчество",
  dateOfBirth: "Дата рожд.",
  dateOfAdmission: "Дата приема",
  PPPeriod: "Срок ПП",
  category: "Категория",
  passport: "Паспорт",
  seriesYCHO: "Серия УДЧО",
  numberYCHO: "№ УДЧО",
  registrationAddress: "Адрес регистрации",
  nothing: "Пустое свойство",
  fullName: "ФИО",
  YCHO: "УЧО",
} as const satisfies PeopleDictionary;

export type DictionaryEngToRussian =
  (typeof DictionaryEngToRussian)[keyof typeof DictionaryEngToRussian];
