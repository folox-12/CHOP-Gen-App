import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { useObjectsStore } from "@/entity/objects/useObjectsStore";
import documentService from "@/entity/documents/documentService";
import { generateDocx } from "@/utils/generateDocx";
import { List } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AddObject } from "@/components/AddObject";
import { TEXTS } from "@/constants/texts";
import { SecuredObject, ObjectFiles } from "@/entity/objects/objectTypes";

const UPLOAD_KEYS = ["contract", "instruction", "scheme"] as const;

const isUploadKey = (key: string): key is keyof ObjectFiles =>
  (UPLOAD_KEYS as readonly string[]).includes(key);

export const SupervisoryCase = () => {
  const selectedId = useCompanyStore((state) => state.selectedId);
  const company = useCompanyStore((state) => state.organization);
  const objects = useObjectsStore((state) => state.objects[selectedId]) ?? [];
  const removeObject = useObjectsStore((state) => state.removeObject);

  const [selectedObjectId, setSelectedObjectId] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const selectedObject = objects.find((el) => el.id === selectedObjectId);

  const generate = useCallback(
    async (key: string, object?: SecuredObject) => {
      if (!company) return;
      setIsDisabled(true);
      const outputName = documentService.getDocumentByKeys(key);
      try {
        await generateDocx(
          `/documents/${key}.docx`,
          {
            org: { ...company },
            object: object
              ? {
                  address: object.address,
                  contractNumber: object.contractNumber,
                  contractDate: object.contractDate,
                  ...object.customer,
                }
              : undefined,
            date: new Date().toLocaleDateString(),
            year: new Date().getFullYear(),
          },
          outputName,
        );
        toast.success(`${TEXTS.app.fileCreated} - ${outputName}`);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(TEXTS.app.fileError + error.message);
        }
      }
      setTimeout(() => setIsDisabled(false), 3000);
    },
    [company],
  );

  const commonList = useMemo(
    () =>
      documentService.getCommonDocuments().map((doc) => ({
        ...doc,
        event: () => generate(doc.key),
      })),
    [generate],
  );

  const openObjectFile = useCallback(async (relativePath: string) => {
    try {
      const fullPath = await join(await appDataDir(), relativePath);
      await invoke("plugin:opener|open_path", { path: fullPath });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.openError + error.message);
      }
    }
  }, []);

  const objectList = useMemo(
    () =>
      documentService.getObjectDocuments().map((doc) => ({
        ...doc,
        event: () => {
          if (isUploadKey(doc.key)) {
            const path = selectedObject?.files[doc.key];
            if (path) openObjectFile(path);
            else toast.info(TEXTS.supervisory.fileNotUploaded);
            return;
          }
          generate(doc.key, selectedObject);
        },
      })),
    [generate, selectedObject, openObjectFile],
  );

  const deleteSelectedObject = () => {
    if (!selectedObject) return;
    removeObject(selectedId, selectedObject.id);
    setSelectedObjectId("");
    toast.success(TEXTS.supervisory.removed);
  };

  return (
    <div className="p-10! flex flex-col gap-6 h-full min-h-0 overflow-auto">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">{TEXTS.supervisory.commonDocs}</h2>
        <List data={commonList} disabled={isDisabled} />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{TEXTS.supervisory.objects}</h2>
          <Select
            className="min-w-64"
            value={selectedObjectId}
            onChange={setSelectedObjectId}
            placeholder={TEXTS.supervisory.selectObject}
            options={objects.map((el) => ({ value: el.id, label: el.address }))}
          />
          <AddObject orgId={selectedId} />
          {selectedObject && (
            <Button onClick={deleteSelectedObject}>
              {TEXTS.supervisory.removeObject}
            </Button>
          )}
        </div>

        {objects.length === 0 && (
          <p className="text-gray-500">{TEXTS.supervisory.noObjects}</p>
        )}

        {selectedObject && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">
              {TEXTS.supervisory.customer}: {selectedObject.customer.orgName},{" "}
              {selectedObject.customer.fullName} —{" "}
              {selectedObject.customer.position}
            </p>
            <h3 className="font-bold">{TEXTS.supervisory.objectDocs}</h3>
            <List data={objectList} disabled={isDisabled} />
          </div>
        )}
      </section>
    </div>
  );
};
