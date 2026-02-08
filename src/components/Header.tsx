import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { Button } from "./ui/Button";
import { ChangeEvent, useRef } from "react";
import { TEXTS } from "@/constants/texts";
import { read, utils } from "xlsx";
import { usePeopleStore } from "@/entity/people/usePeopleStore";
import { OrganizationId } from "@/entity/organisation/organisationTypes";
interface Header {
  changeCompany: (key: OrganizationId) => void;
}

export const Header = ({ changeCompany }: Header) => {
  const { selectedId, mainInfoAboutCompany } = useCompanyStore();
  const setPeople = usePeopleStore((state) => state.setPeople);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(sheet);

    setPeople(selectedId, json as any);
  };
  return (
    <div className="flex gap-3 items-center justify-between bg-blue-200 py-1.5 px-4 mb-1.5">
      <ul className="flex gap-5.5 shrink grow">
        {mainInfoAboutCompany.map(({ id, name }, index) => {
          return (
            <li
              className={`
                cursor-pointer transition-all duration-200  underline-offset-4 hover:underline hover:scale-105 
                ${id === selectedId ? "font-bold underline scale-110!" : ""}
                `}
              key={index}
              onClick={() => changeCompany(id)}
            >
              {name}
            </li>
          );
        })}
      </ul>
      <Button
        onClick={() => {
          return fileInput.current?.click();
        }}
      >
        {TEXTS.header.update}
      </Button>
      <input
        ref={fileInput}
        className="hidden"
        type="file"
        onChange={handleFileUpload}
      />
    </div>
  );
};
