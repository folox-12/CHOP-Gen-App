import { useState, ChangeEvent, useCallback, useMemo, useEffect } from "react";
import { Table } from "@/components/Table";
import { PeopleTypeLess } from "@/entity/people/peopleTypes";
import {
  translateIntoRussian,
  createPeopleViewModel,
} from "@/entity/people/peopleService";
import { usePeopleStore } from "@/entity/people/usePeopleStore";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { List } from "@/components/ui/List";
import { NumberSetting } from "@/components/ui/NumberSetting";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import documentService, {
  HIRING_DOCS,
  FIRING_DOCS,
  needsOutgoingNumber,
} from "@/entity/documents/documentService";
import { toast } from "react-toastify";
import { TEXTS } from "@/constants/texts";
import { generateDocx } from "@/utils/generateDocx";
import { saveFileDialog, pickDirectory } from "@/utils/saveLocation";
import { pluralize } from "@/utils/pluralize";
import { parseDDMMYYYY, daysUntil } from "@/utils/dateUtils";

export const Employees = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isModalPeopleOpen, setIsModalPeopleOpen] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isModalDocumentOpen, setIsModalDocumentOpen] =
    useState<boolean>(false);
  const [isModalSettingsOpen, setIsModalSettingsOpen] =
    useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<PeopleTypeLess[]>();
  const [pendingDocKey, setPendingDocKey] = useState<string | null>(null);
  const [onlyErrors, setOnlyErrors] = useState<boolean>(false);

  const selectedId = useCompanyStore((state) => state.selectedId);
  const orgPeople = usePeopleStore((state) => state.people[selectedId]);
  const company = useCompanyStore((state) => state.organization);
  const changeOutgoingNumber = useCompanyStore(
    (state) => state.changeOutgoingNumber,
  );
  const changeHiringOrderNumber = useCompanyStore(
    (state) => state.changeHiringOrderNumber,
  );
  const changeFiringOrderNumber = useCompanyStore(
    (state) => state.changeFiringOrderNumber,
  );

  const { getDocuments, getDocumentByKeys, generateDocsInfoFromPersonData } =
    documentService;
  const documents = getDocuments();

  const peopleLess = useMemo(
    () => createPeopleViewModel(orgPeople ?? []),
    [orgPeople],
  );

  const getOnePersonById = useCallback(
    (id: string) => peopleLess.find((person) => person.id === id),
    [peopleLess],
  );

  const updateFilter = (e: ChangeEvent<HTMLInputElement>): void => {
    setSelectedPerson(undefined);
    setSearchValue(e.target.value);
  };

  const choosePeople = (item: PeopleTypeLess): void => {
    setSelectedPerson((prev) => {
      if (!prev?.length) return [item];
      const isPersonSelected = prev.some(({ id }) => id === item.id);
      if (isPersonSelected) {
        return prev.filter(({ id }) => id !== item.id);
      }
      return [...prev, item];
    });
  };

  const openPeopleCard = (id: string) => {
    const person = getOnePersonById(id);
    if (!person) return;
    setSelectedPerson([person]);
    setIsModalPeopleOpen(true);
  };

  useEffect(() => {
    setSelectedPerson(undefined);
  }, [selectedId]);

  const isSelected = useCallback(
    (id: string) => selectedPerson?.some((person) => person.id === id) ?? false,
    [selectedPerson],
  );

  const generateDocs = useCallback(
    async (people: PeopleTypeLess[] | undefined, typeFile: string) => {
      if (!people || !company) return;
      const outputName = getDocumentByKeys(typeFile);
      const dest = await saveFileDialog(`${outputName}.docx`, [
        { name: "Word", extensions: ["docx"] },
      ]);
      if (!dest) return;
      setIsDisabled(true);
      try {
        await generateDocx(
          `/documents/${typeFile}.docx`,
          generateDocsInfoFromPersonData(people, company),
          outputName,
          dest,
        );
        if (needsOutgoingNumber(typeFile)) {
          changeOutgoingNumber(Number(company!.outgoingNumber) + 1);
        }
        setPendingDocKey(null);
        toast.success(`${TEXTS.app.fileCreated} - ${outputName}`);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(TEXTS.app.fileError + error.message);
        }
      }
      setTimeout(() => setIsDisabled(false), 5000);
    },
    [
      company,
      getDocumentByKeys,
      generateDocsInfoFromPersonData,
      changeOutgoingNumber,
    ],
  );

  const generatePackage = useCallback(
    async (docKeys: readonly string[], onOrderUpdate: () => void) => {
      if (!selectedPerson || !company) return;

      const dir = await pickDirectory();
      if (!dir) return;

      setIsDisabled(true);

      const data = generateDocsInfoFromPersonData(selectedPerson, company);
      let count = 0;
      let outgoingCount = 0;

      for (const key of docKeys) {
        try {
          const outputName = getDocumentByKeys(key);
          await generateDocx(
            `/documents/${key}.docx`,
            data,
            outputName,
            `${dir}/${outputName}.docx`,
          );
          count++;
          if (needsOutgoingNumber(key)) outgoingCount++;
        } catch (e) {
          if (e instanceof Error) toast.error(TEXTS.app.fileError + e.message);
        }
      }

      if (count > 0) {
        if (outgoingCount > 0) {
          changeOutgoingNumber(Number(company!.outgoingNumber) + outgoingCount);
        }
        onOrderUpdate();
        toast.success(
          `${count} ${pluralize(count, "файл", "файла", "файлов")} ${TEXTS.app.packageCreated}`,
        );
      }

      setTimeout(() => setIsDisabled(false), 5000);
    },
    [
      selectedPerson,
      company,
      getDocumentByKeys,
      generateDocsInfoFromPersonData,
      changeOutgoingNumber,
    ],
  );

  const generateHiringPackage = useCallback(
    () =>
      generatePackage(HIRING_DOCS, () =>
        changeHiringOrderNumber(Number(company!.hiringOrderNumber) + 1),
      ),
    [generatePackage, company, changeHiringOrderNumber],
  );

  const generateFiringPackage = useCallback(
    () =>
      generatePackage(FIRING_DOCS, () =>
        changeFiringOrderNumber(Number(company!.firingOrderNumber) + 1),
      ),
    [generatePackage, company, changeFiringOrderNumber],
  );

  const formattedDocument = useMemo(
    () =>
      documents.map((el) => ({
        ...el,
        event: () => setPendingDocKey(el.key),
      })),
    [documents],
  );

  const formatCell = useCallback((person: PeopleTypeLess, key: string) => {
    if (key === "PPPeriod") {
      const ppDate = parseDDMMYYYY(person.PPPeriod);
      if (ppDate && daysUntil(ppDate) <= 30) return false;
    }
    if (key === "passport") {
      if (person.passport === TEXTS.common.expired) return false;
    }
    return true;
  }, []);

  const hasError = useCallback(
    (person: PeopleTypeLess) =>
      Object.keys(person).some(
        (key) => key !== "id" && !formatCell(person, key),
      ),
    [formatCell],
  );

  const visiblePeople = useMemo(
    () => (onlyErrors ? peopleLess.filter(hasError) : peopleLess),
    [onlyErrors, peopleLess, hasError],
  );

  return (
    <div className="p-10! flex flex-col gap-2.5 h-full min-h-0">
      <div className="flex gap-1.5">
        <input
          type="text"
          className="
            shrink grow basis-9/12
            bg-gray-200! block
            py-0.5! px-2!
            ring-0 rounded-md
            hover:ring-2 hover:ring-blue-400
            focus:ring-2 focus:ring-blue-400
            transition-all duration-100 ease-in-out
            disabled:ring-0 disabled:hover:ring-0 disabled:focus:ring-0
            disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={TEXTS.app.searchPlaceholder}
          value={searchValue}
          onChange={updateFilter}
        />
        <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={onlyErrors}
            onChange={(e) => setOnlyErrors(e.target.checked)}
          />
          {TEXTS.app.onlyWithErrors}
        </label>
        <Button
          onClick={() => setIsModalDocumentOpen(true)}
          disabled={!selectedPerson?.length && isDisabled}
        >
          {TEXTS.app.generateDocuments}
        </Button>
        <Button onClick={() => setIsModalSettingsOpen(true)}>
          {TEXTS.app.settings}
        </Button>
      </div>
      <span className="text-sm">
        {TEXTS.app.selectedCount}{" "}
        <b className="text-base text-gray-600">{selectedPerson?.length ?? 0}</b>{" "}
        {TEXTS.app.people}
      </span>
      <div className="flex-1 min-h-0 overflow-auto">
        <Table<PeopleTypeLess>
          data={visiblePeople}
          isSelected={isSelected}
          toggleSelect={choosePeople}
          translateTitle={translateIntoRussian}
          filter={searchValue}
          onDoubleClick={openPeopleCard}
          format={formatCell}
        />
      </div>

      <Modal
        title={company?.name ?? ""}
        isOpen={isModalPeopleOpen && !!selectedPerson?.length}
        closeModal={() => setIsModalPeopleOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <PersonCard people={selectedPerson?.[0]} />
          <Button
            onClick={() => setIsModalDocumentOpen(true)}
            disabled={isDisabled}
          >
            {TEXTS.app.generateDocument}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalDocumentOpen}
        closeModal={() => setIsModalDocumentOpen(false)}
        title={TEXTS.app.chooseDocuments}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 border-b border-gray-200 pb-3">
            <Button onClick={generateHiringPackage} disabled={isDisabled}>
              {TEXTS.app.hirePackage}
            </Button>
            <Button onClick={generateFiringPackage} disabled={isDisabled}>
              {TEXTS.app.firePackage}
            </Button>
          </div>
          <List data={formattedDocument} disabled={isDisabled} />
        </div>
      </Modal>

      <Modal
        isOpen={pendingDocKey !== null}
        closeModal={() => setPendingDocKey(null)}
        title={pendingDocKey ? getDocumentByKeys(pendingDocKey) : ""}
      >
        <div className="flex flex-col gap-4 p-2">
          {pendingDocKey && needsOutgoingNumber(pendingDocKey) && (
            <NumberSetting
              label={TEXTS.settings.outgoingNumber}
              value={company?.outgoingNumber}
              onChange={changeOutgoingNumber}
            />
          )}
          {pendingDocKey && documentService.isHiringDoc(pendingDocKey) && (
            <NumberSetting
              label={TEXTS.settings.hiringOrderNumber}
              value={company?.hiringOrderNumber}
              onChange={changeHiringOrderNumber}
            />
          )}
          {pendingDocKey && documentService.isFiringDoc(pendingDocKey) && (
            <NumberSetting
              label={TEXTS.settings.firingOrderNumber}
              value={company?.firingOrderNumber}
              onChange={changeFiringOrderNumber}
            />
          )}
          <Button
            onClick={() => generateDocs(selectedPerson, pendingDocKey!)}
            disabled={isDisabled}
          >
            {TEXTS.app.generateDocument}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalSettingsOpen}
        closeModal={() => setIsModalSettingsOpen(false)}
        title={TEXTS.app.settingsTitle}
        size="small"
      >
        <div className="flex flex-col items-center justify-center gap-2 h-4/5">
          <NumberSetting
            label={TEXTS.settings.outgoingNumber}
            value={company?.outgoingNumber}
            onChange={changeOutgoingNumber}
          />
          <NumberSetting
            label={TEXTS.settings.hiringOrderNumber}
            value={company?.hiringOrderNumber}
            onChange={changeHiringOrderNumber}
          />
          <NumberSetting
            label={TEXTS.settings.firingOrderNumber}
            value={company?.firingOrderNumber}
            onChange={changeFiringOrderNumber}
          />
        </div>
      </Modal>
    </div>
  );
};
