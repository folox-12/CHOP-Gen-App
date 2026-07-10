import { TEXTS } from "@/constants/texts";
import {
  DictionaryEngToRussian,
  PeopleType,
  PeopleTypeLess,
} from "@/entity/people/peopleTypes";

export function translateIntoRussian(title: string): string {
  return (
    DictionaryEngToRussian[title as keyof typeof DictionaryEngToRussian] ??
    title
  );
}

function makePersonId(employee: PeopleType): string {
  return [
    employee.lastName,
    employee.name,
    employee.middleName,
    employee.passport,
    employee.dateOfBirth,
  ].join("|");
}

export function createPeopleViewModel(people: PeopleType[]): PeopleTypeLess[] {
  return people.map((employee) => {
    const passportSplitted = employee.passport.split(" ");
    return {
      id: makePersonId(employee),
      fullName: `${employee.lastName} ${employee.name} ${employee.middleName}`,
      dateOfBirth: employee.dateOfBirth,
      dateOfAdmission: employee.dateOfAdmission,
      PPPeriod: employee.PPPeriod,
      category: employee.category,
      passport: passportSplitted[0]
        ? `${passportSplitted[0]} №${passportSplitted[1]}`
        : TEXTS.common.expired,
      YCHO: employee.seriesYCHO
        ? `${employee.seriesYCHO} №${employee.numberYCHO}`
        : TEXTS.common.expired,
      registrationAddress: employee.registrationAddress,
    };
  });
}
