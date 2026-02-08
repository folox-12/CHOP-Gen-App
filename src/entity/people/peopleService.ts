import { TEXTS } from "@/constants/texts";
import {
  PeopleFieldKeysRus,
  PeopleFieldKeysEng,
  DictionaryEngToRussian,
  PeopleType,
  PeopleTypeLess,
} from "@/entity/people/peopleTypes";
import { v4 } from "uuid";

export function translateIntoRussian(
  title: PeopleFieldKeysEng,
): PeopleFieldKeysRus {
  return DictionaryEngToRussian[title];
}

export function createPeopleViewModel(people: PeopleType[]): PeopleTypeLess[] {
  return people.map((employer) => {
    const passportSplitted = employer.passport.split(" ");
    return {
      id: v4(),
      fullName: `${employer.lastName} ${employer.name} ${employer.middleName}`,
      dateOfBirth: employer.dateOfBirth,
      dateOfAdmission: employer.dateOfAdmission,
      PPPeriod: employer.PPPeriod,
      category: employer.category,
      passport: !!passportSplitted[0]
        ? `${passportSplitted[0]} №${passportSplitted[1]}`
        : TEXTS.common.expired,
      YCHO: !!employer.seriesYCHO
        ? `${employer.seriesYCHO} №${employer.numberYCHO}`
        : TEXTS.common.expired,
      registrationAddress: employer.registrationAddress,
    };
  });
}
