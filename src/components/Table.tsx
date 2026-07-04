import { getDataByProperty } from "@/utils/filterUtils";
import { mdiArrowDown, mdiArrowUp, mdiAlert } from "@mdi/js";
import Icon from "@mdi/react";
import { useMemo, useState } from "react";
import { TEXTS } from "@/constants/texts";

type TableData = {
  id: string;
};

interface Props<T> {
  isSelected: (index: string) => boolean | undefined;
  toggleSelect: (item: T) => void;
  translateTitle: (title: string) => string;
  data?: (TableData & T)[];
  filter?: string;
  onDoubleClick?: (index: string) => void;
  format?: (item: TableData & T, key: string) => boolean;
}

export const Table = <T,>({
  data,
  isSelected,
  toggleSelect,
  translateTitle,
  filter,
  onDoubleClick = () => {
    null;
  },
  format,
}: Props<T>) => {
  const [sortKey, setSortKey] = useState<keyof (T & TableData) | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const dataToRender = useMemo<(T & TableData)[]>(() => {
    if (!data?.length) return [];
    const filtered = getDataByProperty<TableData & T>(data, filter);
    if (!filtered.length) return [];

    if (sortKey) {
      return [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;

        const result = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? result : -result;
      });
    }

    return filtered;
  }, [data, filter, sortKey, sortDirection]);

  const thHeadClass =
    "border-b border-gray-200 p-2 w-8 sticky top-0 bg-white z-10";
  const tdBodyClass = "border-b border-gray-200 p-2 text-center";

  const sortByProperty = (key: keyof (T & TableData)) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };
  return !!dataToRender?.length && !!data?.length ? (
    <>
      <span className="inline-block mt-2!">
        {TEXTS.table.totalRecords}: {dataToRender.length}
      </span>
      <table className="min-w-200 table-auto">
        <thead>
          <tr>
            <th className={thHeadClass}></th>
            <th className={thHeadClass}>№</th>
            {Object.keys(dataToRender[0])
              .filter((el) => el != "id")
              .map((key, index) => {
                const typedKey = key as keyof (T & TableData);

                return (
                  <th
                    key={index}
                    className="border-b border-gray-200 p-2 text-left whitespace-nowrap cursor-pointer sticky top-0 bg-white z-10"
                    onClick={() => sortByProperty(typedKey)}
                  >
                    {translateTitle(key)}
                    {!!sortKey && sortKey === key ? (
                      sortDirection === "asc" ? (
                        <Icon
                          className="inline-block"
                          path={mdiArrowUp}
                          size={0.7}
                        />
                      ) : (
                        <Icon
                          className="inline-block"
                          path={mdiArrowDown}
                          size={0.7}
                        />
                      )
                    ) : null}
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {dataToRender.map((item, index) => {
            const invalidKeys = format
              ? Object.keys(item).filter(
                  (key) => key !== "id" && !format(item, key),
                )
              : [];
            const isInvalid = invalidKeys.length > 0;
            const firstColumnKey = Object.keys(item).find(
              (key) => key !== "id",
            );
            return (
              <tr
                key={index}
                className={
                  isSelected(item.id)
                    ? "bg-gray-400"
                    : isInvalid
                      ? "bg-red-200"
                      : ""
                }
                onClick={() => toggleSelect(item)}
                onDoubleClick={() => onDoubleClick(item.id)}
              >
                <td className={tdBodyClass}>
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={isSelected(item.id)}
                    readOnly
                  />
                </td>
                <td className={tdBodyClass}>{index + 1}.</td>
                {Object.entries(item).map(([key, value], innerIndex) => {
                  if (key === "id") return null;
                  const isFirstColumn = key === firstColumnKey;
                  return (
                    <td
                      key={`${index}${innerIndex}`}
                      className="border-b border-gray-200 p-2! whitespace-nowrap text-sm break-all cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1">
                        {isFirstColumn && isInvalid && (
                          <span
                            className="inline-flex text-red-500 cursor-help"
                            title={invalidKeys.map(translateTitle).join(", ")}
                          >
                            <Icon path={mdiAlert} size={0.8} />
                          </span>
                        )}
                        {String(value)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {dataToRender.length > 60 && (
        <span className="block mt-2!">
          {TEXTS.table.totalRecords}: <b>{dataToRender.length}</b>
        </span>
      )}
    </>
  ) : (
    TEXTS.table.noData
  );
};
