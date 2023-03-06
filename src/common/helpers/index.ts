/**
 * Converts query string filters to SQL
 * @param entityName Name of the single entity
 * @param strFilters filters returned by the query params
 * @returns string || {}
 */
export const formatQueryFilters = (entityName: string, strFilters?: string) => {
  if (!strFilters) return {};
  const parsedFilters = JSON.parse(strFilters);
  const filters = Object.entries(parsedFilters)
    .map(([k, v]) => `${entityName}.${k} = '${v}'`)
    .join(' AND ');

  return filters;
};
