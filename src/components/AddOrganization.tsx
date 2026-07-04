import { ChangeEvent, useRef, useState } from "react";
import { v4 } from "uuid";
import { read, utils } from "xlsx";
import { toast } from "react-toastify";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";
import { TEXTS } from "@/constants/texts";
import { Organization } from "@/entity/organisation/organisationTypes";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { usePeopleStore } from "@/entity/people/usePeopleStore";
import { PeopleFieldKeysRus } from "@/entity/people/peopleTypes";

type OrgForm = Omit<Organization, "id">;

const ORG_FIELDS = [
  "name",
  "ceo",
  "outgoingNumber",
  "hiringOrderNumber",
  "firingOrderNumber",
  "licenseIssueDate",
  "licenseNumber",
  "legalAddress",
  "phone",
  "email",
  "numberOfDocument",
] as const satisfies readonly (keyof OrgForm)[];

const DEFAULT_FORM: OrgForm = {
  name: "",
  ceo: "",
  outgoingNumber: "1",
  hiringOrderNumber: "1",
  firingOrderNumber: "1",
  licenseIssueDate: "",
  licenseNumber: "1",
  legalAddress: "",
  phone: "",
  email: "",
  numberOfDocument: "1",
};

const inputClass =
  "block py-0.5 px-2 outline-gray-400 outline-1 rounded-md w-full text-base text-gray-700";

export const AddOrganization = () => {
  const addOrg = useCompanyStore((state) => state.addOrg);
  const setPeople = usePeopleStore((state) => state.setPeople);

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<OrgForm>(DEFAULT_FORM);
  const [parsedPeople, setParsedPeople] = useState<
    Record<PeopleFieldKeysRus, string>[] | null
  >(null);
  const [fileName, setFileName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const close = () => {
    setIsOpen(false);
    setForm(DEFAULT_FORM);
    setParsedPeople(null);
    setFileName("");
  };

  const updateField = (key: keyof OrgForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(sheet);

    setParsedPeople(json as Record<PeopleFieldKeysRus, string>[]);
    setFileName(file.name);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(TEXTS.organisation.nameRequired);
      return;
    }

    const id = v4();
    addOrg({ id, ...form });
    if (parsedPeople) setPeople(id, parsedPeople);

    toast.success(TEXTS.organisation.created);
    close();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{TEXTS.organisation.add}</Button>

      <Modal
        isOpen={isOpen}
        closeModal={close}
        title={TEXTS.organisation.title}
      >
        <div className="flex flex-col gap-4 p-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {ORG_FIELDS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">
                  {TEXTS.organisation.fields[key]}
                </span>
                <input
                  className={inputClass}
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
            <Button onClick={() => fileInput.current?.click()}>
              {TEXTS.organisation.uploadExcel}
            </Button>
            {fileName && (
              <span className="text-sm text-gray-600">
                {TEXTS.organisation.fileChosen}: {fileName}
              </span>
            )}
            <input
              ref={fileInput}
              className="hidden"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>{TEXTS.organisation.save}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
