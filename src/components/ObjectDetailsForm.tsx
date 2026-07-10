import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Icon from "@mdi/react";
import { mdiPencil, mdiEye, mdiTrayArrowDown } from "@mdi/js";
import { saveFileDialog } from "@/utils/saveLocation";
import documentService, {
  DocumentOfOrganisationType,
} from "@/entity/documents/documentService";
import { generateDocx } from "@/utils/generateDocx";
import { Modal } from "./Modal";
import { FilePreviewModal } from "./FilePreviewModal";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { TEXTS } from "@/constants/texts";
import { OrganizationId } from "@/entity/organisation/organisationTypes";
import { useObjectsStore } from "@/entity/objects/useObjectsStore";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { ObjectFiles, SecuredObject } from "@/entity/objects/objectTypes";
import {
  saveSupervisoryFile,
  downloadSupervisoryFile,
  isPreviewable,
} from "@/utils/supervisoryFiles";

type Props = {
  object: SecuredObject | null;
  orgId: OrganizationId;
  onClose: () => void;
  onDelete: () => void;
};

type ObjectForm = {
  address: string;
  orgName: string;
  signatory: string;
  position: string;
  contractNumber: string;
  contractDate: string;
};

const EMPTY_FORM: ObjectForm = {
  address: "",
  orgName: "",
  signatory: "",
  position: "",
  contractNumber: "",
  contractDate: "",
};

const TEXT_FIELDS = [
  { key: "signatory", label: TEXTS.supervisory.fields.signatory },
  { key: "position", label: TEXTS.supervisory.fields.position },
  { key: "contractNumber", label: TEXTS.supervisory.fields.contractNumber },
  { key: "contractDate", label: TEXTS.supervisory.fields.contractDate },
] as const satisfies readonly { key: keyof ObjectForm; label: string }[];

const UPLOADS = [
  { type: "contract", label: TEXTS.supervisory.uploadContract },
  { type: "instruction", label: TEXTS.supervisory.uploadInstruction },
  { type: "scheme", label: TEXTS.supervisory.uploadScheme },
  { type: "olrrNotice", label: TEXTS.supervisory.uploadOlrrNotice },
] as const satisfies readonly { type: keyof ObjectFiles; label: string }[];

const DETAIL_FIELDS = [
  {
    label: TEXTS.supervisory.fields.orgName,
    get: (o: SecuredObject) => o.customer.orgName,
  },
  {
    label: TEXTS.supervisory.fields.signatory,
    get: (o: SecuredObject) => o.customer.signatory,
  },
  {
    label: TEXTS.supervisory.fields.position,
    get: (o: SecuredObject) => o.customer.position,
  },
  {
    label: TEXTS.supervisory.fields.contractNumber,
    get: (o: SecuredObject) => o.contractNumber,
  },
  {
    label: TEXTS.supervisory.fields.contractDate,
    get: (o: SecuredObject) => o.contractDate,
  },
] as const;

const DUTY_SCHEDULE_KEY = "dutySchedule";

const MONTH_OPTIONS = TEXTS.supervisory.months.map((label, index) => ({
  value: String(index + 1),
  label,
}));

const inputClass =
  "block py-0.5 px-2 outline-gray-400 outline-1 rounded-md w-full text-base text-gray-700";

const uploadClass =
  "inline-flex items-center cursor-pointer p-1 px-2 text-white bg-cyan-500 rounded-md active:scale-95 text-sm";

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800">{value || "—"}</span>
  </div>
);

export const ObjectDetailsForm = ({
  object,
  orgId,
  onClose,
  onDelete,
}: Props) => {
  const company = useCompanyStore((state) => state.organization);
  const objects = useObjectsStore((state) => state.objects[orgId]) ?? [];
  const updateObject = useObjectsStore((state) => state.updateObject);

  const [isEditing, setIsEditing] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  // Месяц и количество дней для генерации графика несения службы
  const [duty, setDuty] = useState<{ month: string; days: number }>({
    month: "",
    days: 0,
  });
  const [form, setForm] = useState<ObjectForm>(EMPTY_FORM);
  const [files, setFiles] = useState<ObjectFiles>({});
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  useEffect(() => {
    if (!object) return;
    setIsEditing(false);
    setForm({
      address: object.address,
      orgName: object.customer.orgName,
      signatory: object.customer.signatory,
      position: object.customer.position,
      contractNumber: object.contractNumber,
      contractDate: object.contractDate,
    });
    setFiles(object.files);
  }, [object]);

  const selectDutyMonth = (month: string) => {
    const days = month
      ? new Date(new Date().getFullYear(), Number(month), 0).getDate()
      : 0;
    setDuty({ month, days });
  };

  const generate = useCallback(
    async (key: string) => {
      if (!company || !object) return;
      if (key === DUTY_SCHEDULE_KEY && !duty.month) {
        toast.error(TEXTS.supervisory.monthRequired);
        return;
      }
      const outputName = documentService.getDocumentByKeys(key);
      const dest = await saveFileDialog(`${outputName}.docx`, [
        { name: "Word", extensions: ["docx"] },
      ]);
      if (!dest) return;
      setIsDisabled(true);
      try {
        await generateDocx(
          `/documents/${key}.docx`,
          {
            org: { ...company },
            object: {
              address: object.address,
              contractNumber: object.contractNumber,
              contractDate: object.contractDate,
              ...object.customer,
            },
            date: new Date().toLocaleDateString(),
            year: new Date().getFullYear(),
            ...(key === DUTY_SCHEDULE_KEY && {
              month: TEXTS.supervisory.months[Number(duty.month) - 1],
              days: duty.days,
            }),
          },
          outputName,
          dest,
        );
        toast.success(TEXTS.supervisory.savedToDevice + dest);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(TEXTS.app.fileError + error.message);
        }
      }
      setTimeout(() => setIsDisabled(false), 3000);
    },
    [company, object, duty],
  );

  const downloadFile = async (path: string) => {
    try {
      const dest = await downloadSupervisoryFile(path);
      if (!dest) return;
      toast.success(TEXTS.supervisory.savedToDevice + dest);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.saveError + error.message);
      }
    }
  };

  const renderDocAction = (doc: DocumentOfOrganisationType) => {
    if (documentService.isUploadKey(doc.key)) {
      const path = object?.files[doc.key as keyof ObjectFiles];
      if (!path) {
        return (
          <span className="text-sm text-gray-400">
            {TEXTS.supervisory.fileNotUploaded}
          </span>
        );
      }
      return (
        <div className="flex items-center gap-2">
          {isPreviewable(path) && (
            <Button
              title={TEXTS.supervisory.preview}
              onClick={() => setPreviewPath(path)}
            >
              <Icon path={mdiEye} size={0.9} />
            </Button>
          )}
          <Button
            title={TEXTS.supervisory.download}
            onClick={() => downloadFile(path)}
          >
            <Icon path={mdiTrayArrowDown} size={0.9} />
          </Button>
        </div>
      );
    }
    if (doc.key === DUTY_SCHEDULE_KEY) {
      return (
        <div className="flex items-center gap-2">
          <Select
            className="min-w-40"
            value={duty.month}
            onChange={selectDutyMonth}
            placeholder={TEXTS.supervisory.selectMonth}
            options={MONTH_OPTIONS}
          />
          <Button disabled={isDisabled} onClick={() => generate(doc.key)}>
            {TEXTS.supervisory.generate}
          </Button>
        </div>
      );
    }
    return (
      <Button disabled={isDisabled} onClick={() => generate(doc.key)}>
        {TEXTS.supervisory.generate}
      </Button>
    );
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
      const path = await saveSupervisoryFile(file, company.name, form.orgName);
      setFiles((prev) => ({ ...prev, [type]: path }));
      toast.success(TEXTS.supervisory.uploaded);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.uploadError + error.message);
      }
    }
  };

  const save = () => {
    if (!object) return;
    const hasEmptyField = (Object.keys(form) as (keyof ObjectForm)[]).some(
      (key) => !form[key].trim(),
    );
    if (hasEmptyField) {
      toast.error(TEXTS.supervisory.fillAllFields);
      return;
    }
    updateObject(orgId, {
      ...object,
      address: form.address,
      contractNumber: form.contractNumber,
      contractDate: form.contractDate,
      customer: {
        orgName: form.orgName,
        signatory: form.signatory,
        position: form.position,
      },
      files,
    });
    toast.success(TEXTS.supervisory.updated);
    setIsEditing(false);
  };

  return (
    <>
      <Modal
        isOpen={!!object}
        closeModal={onClose}
        title={isEditing ? TEXTS.supervisory.editObjectTitle : object?.address}
      >
        {object &&
          (isEditing ? (
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
                    editable
                    value={form.orgName}
                    onChange={(value) => update("orgName", value)}
                    placeholder={TEXTS.supervisory.selectCustomer}
                    options={[
                      ...new Set(
                        objects
                          .map((el) => el.customer.orgName)
                          .filter(Boolean),
                      ),
                    ].map((name) => ({ value: name, label: name }))}
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

              <div className="flex justify-end gap-2">
                <Button onClick={() => setIsEditing(false)}>
                  {TEXTS.common.cancel}
                </Button>
                <Button onClick={save}>{TEXTS.supervisory.save}</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              <div className="flex justify-end">
                <Button
                  title={TEXTS.supervisory.edit}
                  onClick={() => setIsEditing(true)}
                >
                  <Icon path={mdiPencil} size={0.9} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {DETAIL_FIELDS.map(({ label, get }) => (
                  <Detail key={label} label={label} value={get(object)} />
                ))}
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                <h3 className="font-bold">{TEXTS.supervisory.objectDocs}</h3>
                <ul className="flex flex-col">
                  {documentService.getObjectDocuments().map((doc) => (
                    <li
                      key={doc.key}
                      className="flex items-center justify-between gap-3 border-b border-gray-200 py-1.5"
                    >
                      <span>{doc.value}</span>
                      {renderDocAction(doc)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={onDelete}>
                  {TEXTS.supervisory.removeObject}
                </Button>
              </div>
            </div>
          ))}
      </Modal>

      <FilePreviewModal
        path={previewPath}
        onClose={() => setPreviewPath(null)}
      />
    </>
  );
};
