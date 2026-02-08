import { translateIntoRussian } from "@/entity/people/peopleService";
import {
  PeopleFieldKeysEng,
  PeopleTypeLess,
} from "@/entity/people/peopleTypes";

type Props = {
  people?: PeopleTypeLess;
};

export const PersonCard = ({ people }: Props) => {
  if (!people) return null;
  return (
    <div className="flex flex-col gap-2 [&>*:not(:last-child)]:border-b-2">
      {Object.entries(people).map(([key, value]) => {
        if (key === "id") return null;
        const typedKey = key as PeopleFieldKeysEng;
        return (
          <div key={key}>
            <span className="font-bold text-lg">
              {translateIntoRussian(typedKey)}:{" "}
            </span>
            <span className="inline-block break-all">{value}</span>
          </div>
        );
      })}
    </div>
  );
};
