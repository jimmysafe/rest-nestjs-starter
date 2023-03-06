/**
 * Converts query filters to SQL
 * @param entityName Name of the single entity
 * @param queryFilters filters returned by the query params
 * @returns string || {}
 */
export const formatQueryFilters = (
  entityName: string,
  queryFilters?: string,
) => {
  if (!queryFilters) return {};
  const filters = Object.entries(queryFilters)
    .map(([k, v]) => `${entityName}.${k} = '${v}'`)
    .join(' AND ');

  return filters;
};
