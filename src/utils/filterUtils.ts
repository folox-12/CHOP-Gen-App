/**
 * Filter array of people by name or by specified property.
 * If no name is specified, the function will return the original array.
 * @param data - array of people
 * @param filter - name to filter by (case insensitive)
 * @param property - optional property to filter by (default is 'fullName')
 * @returns array of people filtered by name or property
 */
export function getDataByProperty<T extends Record<string, any>>(
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
