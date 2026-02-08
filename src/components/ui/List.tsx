type Props = {
  data: Record<any, any>[];
  disabled: boolean;
};
export const List = ({ data, disabled = false }: Props) => {
  return (
    <ul
      className="
    flex flex-col gap-2 
    [&>*:not(:last-child)]:border-b-2
    "
    >
      {data.map(({ key, value, event }) => (
        <li
          className={`
          hover:bg-gray-200
          p-1
          cursor-pointer
          ${disabled ? "hover:cursor-not-allowed text-gray-500 hover:bg-white" : ""}
        `}
          key={key}
          onClick={() => (disabled ? null : event())}
        >
          {value}
        </li>
      ))}
    </ul>
  );
};
