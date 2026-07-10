import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Icon from "@mdi/react";
import { mdiEye } from "@mdi/js";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { useObjectsStore } from "@/entity/objects/useObjectsStore";
import { useCommonDocsStore } from "@/entity/documents/useCommonDocsStore";
import documentService from "@/entity/documents/documentService";
import { saveSupervisoryFile, isPreviewable } from "@/utils/supervisoryFiles";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AddObject } from "@/components/AddObject";
import { ObjectDetailsForm } from "@/components/ObjectDetailsForm";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { TEXTS } from "@/constants/texts";

const uploadClass =
  "inline-flex items-center cursor-pointer p-1 px-2 text-white bg-cyan-500 rounded-md active:scale-95 text-sm";

export const SupervisoryCase = () => {
  const selectedId = useCompanyStore((state) => state.selectedId);
  const company = useCompanyStore((state) => state.organization);
  const storedObjects = useObjectsStore((state) => state.objects[selectedId]);
  const objects = useMemo(() => storedObjects ?? [], [storedObjects]);
  const removeObject = useObjectsStore((state) => state.removeObject);
  const commonFiles =
    useCommonDocsStore((state) => state.files[selectedId]) ?? {};
  const setCommonFile = useCommonDocsStore((state) => state.setFile);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [openedObjectId, setOpenedObjectId] = useState("");
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const customers = useMemo(
    () => [
      ...new Set(objects.map((el) => el.customer.orgName).filter(Boolean)),
    ],
    [objects],
  );

  const customerObjects = useMemo(
    () => objects.filter((el) => el.customer.orgName === selectedCustomer),
    [objects, selectedCustomer],
  );

  const openedObject = objects.find((el) => el.id === openedObjectId) ?? null;

  const openFile = useCallback(async (relativePath: string) => {
    try {
      const fullPath = await join(await appDataDir(), relativePath);
      await invoke("plugin:opener|open_path", { path: fullPath });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.openError + error.message);
      }
    }
  }, []);

  const uploadCommon = async (
    key: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !company) return;
    try {
      const path = await saveSupervisoryFile(file, company.name, "общие");
      setCommonFile(selectedId, key, path);
      toast.success(TEXTS.supervisory.uploaded);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(TEXTS.supervisory.uploadError + error.message);
      }
    }
  };

  const deleteOpenedObject = () => {
    if (!openedObject) return;
    removeObject(selectedId, openedObject.id);
    setOpenedObjectId("");
    toast.success(TEXTS.supervisory.removed);
  };

  return (
    <div className="p-10! flex flex-col gap-6 h-full min-h-0 overflow-auto">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">{TEXTS.supervisory.commonDocs}</h2>
        <ul className="flex flex-col">
          {documentService.getCommonDocuments().map((doc) => {
            const path = commonFiles[doc.key];
            return (
              <li
                key={doc.key}
                className="flex items-center justify-between gap-3 border-b border-gray-200 py-1.5"
              >
                <span
                  className={path ? "cursor-pointer hover:underline" : ""}
                  onClick={() => path && openFile(path)}
                >
                  {doc.value}
                </span>
                {path ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 truncate max-w-72">
                      {path.split("/").pop()}
                    </span>
                    {isPreviewable(path) && (
                      <Button
                        title={TEXTS.supervisory.preview}
                        onClick={() => setPreviewPath(path)}
                      >
                        <Icon path={mdiEye} size={0.9} />
                      </Button>
                    )}
                  </div>
                ) : (
                  <label className={uploadClass}>
                    {TEXTS.supervisory.upload}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => uploadCommon(doc.key, e)}
                    />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{TEXTS.supervisory.customer}</h2>
          <Select
            className="min-w-64"
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            placeholder={TEXTS.supervisory.selectCustomer}
            options={customers.map((name) => ({ value: name, label: name }))}
          />
          <AddObject orgId={selectedId} />
        </div>

        {objects.length === 0 && (
          <p className="text-gray-500">{TEXTS.supervisory.noCustomers}</p>
        )}

        {objects.length > 0 && !selectedCustomer && (
          <p className="text-gray-500">
            {TEXTS.supervisory.selectCustomerFirst}
          </p>
        )}

        {selectedCustomer && (
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">{TEXTS.supervisory.customerObjects}</h3>
            {customerObjects.length === 0 ? (
              <p className="text-gray-500">{TEXTS.supervisory.noObjects}</p>
            ) : (
              <ul className="flex flex-col">
                {customerObjects.map((object) => (
                  <li
                    key={object.id}
                    onClick={() => setOpenedObjectId(object.id)}
                    className="flex items-center justify-between gap-3 border-b border-gray-200 py-2 px-1 cursor-pointer hover:bg-gray-100 rounded-md"
                  >
                    <span>{object.address}</span>
                    <span className="text-sm text-gray-500">
                      {object.contractNumber}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <ObjectDetailsForm
        object={openedObject}
        orgId={selectedId}
        onClose={() => setOpenedObjectId("")}
        onDelete={deleteOpenedObject}
      />

      <FilePreviewModal
        path={previewPath}
        onClose={() => setPreviewPath(null)}
      />
    </div>
  );
};
