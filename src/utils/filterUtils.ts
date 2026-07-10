export function getDataByProperty<T extends Record<string, unknown>>(
  data: T[],
  filter?: string,
  property: keyof T = "fullName" as keyof T,
): T[] {
  if (!filter) return data;

  const lowerCaseName = filter.toLowerCase();

  const result = data.filter((el) => {
    const value = el[property];
    return (
      typeof value === "string" && value.toLowerCase().includes(lowerCaseName)
    );
  });
  return result;
}
