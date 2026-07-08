import { ChangeEvent, useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { TEXTS } from "@/constants/texts";
import { OrganizationId } from "@/entity/organisation/organisationTypes";
import { useObjectsStore } from "@/entity/objects/useObjectsStore";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { ObjectFiles } from "@/entity/objects/objectTypes";
import { saveSupervisoryFile } from "@/utils/supervisoryFiles";

type Props = {
  orgId: OrganizationId;
};

type ObjectForm = {
  address: string;
  orgName: string;
  signatory: string;
  fullName: string;
  position: string;
  contractNumber: string;
  contractDate: string;
};

const DEFAULT_FORM: ObjectForm = {
  address: "",
  orgName: "",
  signatory: "",
  fullName: "",
  position: "",
  contractNumber: "",
  contractDate: "",
};

const TEXT_FIELDS = [
  { key: "signatory", label: TEXTS.supervisory.fields.signatory },
  { key: "fullName", label: TEXTS.supervisory.fields.fullName },
  { key: "position", label: TEXTS.supervisory.fields.position },
  { key: "contractNumber", label: TEXTS.supervisory.fields.contractNumber },
  { key: "contractDate", label: TEXTS.supervisory.fields.contractDate },
] as const satisfies readonly { key: keyof ObjectForm; label: string }[];

const UPLOADS = [
  { type: "contract", label: TEXTS.supervisory.uploadContract },
  { type: "instruction", label: TEXTS.supervisory.uploadInstruction },
  { type: "scheme", label: TEXTS.supervisory.uploadScheme },
] as const satisfies readonly { type: keyof ObjectFiles; label: string }[];

const inputClass =
  "block py-0.5 px-2 outline-gray-400 outline-1 rounded-md w-full text-base text-gray-700";

const uploadClass =
  "inline-flex items-center cursor-pointer p-1 px-2 text-white bg-cyan-500 rounded-md active:scale-95 text-sm";

export const AddObject = ({ orgId }: Props) => {
  const addObject = useObjectsStore((state) => state.addObject);
  const company = useCompanyStore((state) => state.organization);
  const orgs = useCompanyStore((state) => state.mainInfoAboutCompany);

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ObjectForm>(DEFAULT_FORM);
  const [files, setFiles] = useState<ObjectFiles>({});

  const close = () => {
    setIsOpen(false);
    setForm(DEFAULT_FORM);
    setFiles({});
  };

  const update = (key: keyof ObjectForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (
    type: keyof ObjectFiles,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !company) return;
    if (!form.orgName.trim()) {
      toast.error(TEXTS.supervisory.customerRequired);
      return;
    }
    try {
      const path = await saveSupervisoryFile(company.name, form.orgName, file);
      setFiles((prev) => ({ ...prev, [type]: path }));
      toast.success(TEXTS.supervisory.uploaded);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.uploadError + error.message);
      }
    }
  };

  const save = () => {
    const hasEmptyField = (Object.keys(form) as (keyof ObjectForm)[]).some(
      (key) => !form[key].trim(),
    );
    if (hasEmptyField) {
      toast.error(TEXTS.supervisory.fillAllFields);
      return;
    }
    addObject(orgId, {
      id: v4(),
      address: form.address,
      contractNumber: form.contractNumber,
      contractDate: form.contractDate,
      customer: {
        orgName: form.orgName,
        signatory: form.signatory,
        fullName: form.fullName,
        position: form.position,
      },
      files,
    });
    toast.success(TEXTS.supervisory.created);
    close();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {TEXTS.supervisory.addObject}
      </Button>

      <Modal
        isOpen={isOpen}
        closeModal={close}
        title={TEXTS.supervisory.objectTitle}
      >
        <div className="flex flex-col gap-4 p-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">
                {TEXTS.supervisory.fields.address}
              </span>
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">
                {TEXTS.supervisory.fields.orgName}
              </span>
              <Select
                value={form.orgName}
                onChange={(value) => update("orgName", value)}
                placeholder={TEXTS.supervisory.selectCustomer}
                options={orgs.map((el) => ({ value: el.name, label: el.name }))}
              />
            </label>

            {TEXT_FIELDS.map(({ key, label }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">{label}</span>
                <input
                  className={inputClass}
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
            <div className="flex gap-3 flex-wrap">
              {UPLOADS.map(({ type, label }) => (
                <label key={type} className={uploadClass}>
                  {label}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUpload(type, e)}
                  />
                </label>
              ))}
            </div>
            {UPLOADS.some(({ type }) => files[type]) && (
              <ul className="text-sm text-gray-600 flex flex-col gap-0.5">
                {UPLOADS.filter(({ type }) => files[type]).map(
                  ({ type, label }) => (
                    <li key={type}>
                      {label}: {files[type]?.split("/").pop()}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>{TEXTS.supervisory.save}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
