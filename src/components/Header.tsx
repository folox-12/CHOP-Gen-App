import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { Button } from "./ui/Button";
import { ChangeEvent, useRef, useState } from "react";
import { TEXTS } from "@/constants/texts";
import { read, utils } from "xlsx";
import { usePeopleStore } from "@/entity/people/usePeopleStore";
import { OrganizationId } from "@/entity/organisation/organisationTypes";
import Icon from "@mdi/react";
import { mdiTrashCanOutline } from "@mdi/js";
import { toast } from "react-toastify";
import { Modal } from "./Modal";

interface Header {
  changeCompany: (key: OrganizationId) => void;
}

export const Header = ({ changeCompany }: Header) => {
  const { selectedId, mainInfoAboutCompany } = useCompanyStore();
  const removeOrg = useCompanyStore((state) => state.removeOrg);
  const setPeople = usePeopleStore((state) => state.setPeople);
  const removePeople = usePeopleStore((state) => state.removePeople);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: OrganizationId;
    name: string;
  } | null>(null);

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(sheet);

    setPeople(selectedId, json as never);
  };

  const requestDelete = (
    e: React.MouseEvent,
    id: OrganizationId,
    name: string,
  ) => {
    e.stopPropagation();
    setPendingDelete({ id, name });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    removeOrg(pendingDelete.id);
    removePeople(pendingDelete.id);
    toast.success(TEXTS.organisation.deleted);
    setPendingDelete(null);
  };

  return (
    <div className="flex gap-3 items-center justify-between bg-blue-200 py-1.5 px-4 mb-1.5">
      <ul className="flex gap-6 shrink grow flex-wrap">
        {mainInfoAboutCompany.map(({ id, name }, index) => (
          <li key={index} className="flex items-center gap-1">
            <span
              className={`
                cursor-pointer transition-all duration-200 underline-offset-4 hover:underline hover:scale-105
                ${id === selectedId ? "font-bold underline scale-110!" : ""}
              `}
              onClick={() => changeCompany(id)}
            >
              {name}
            </span>
            <button
              className="text-red-600 hover:text-red-800 cursor-pointer flex ml-1.5"
              title={TEXTS.organisation.delete}
              onClick={(e) => requestDelete(e, id, name)}
            >
              <Icon path={mdiTrashCanOutline} size={0.8} />
            </button>
          </li>
        ))}
      </ul>
      <Button onClick={() => fileInput.current?.click()}>
        {TEXTS.header.update}
      </Button>
      <input
        ref={fileInput}
        className="hidden"
        type="file"
        onChange={handleFileUpload}
      />

      <Modal
        isOpen={!!pendingDelete}
        closeModal={() => setPendingDelete(null)}
        title={TEXTS.organisation.delete}
      >
        <div className="flex flex-col gap-5 p-2">
          <p className="text-center text-lg">
            {TEXTS.organisation.deleteConfirmStart} «{pendingDelete?.name}»{" "}
            {TEXTS.organisation.deleteConfirmEnd}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={confirmDelete}>
              {TEXTS.organisation.confirmDelete}
            </Button>
            <Button onClick={() => setPendingDelete(null)}>
              {TEXTS.common.cancel}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
