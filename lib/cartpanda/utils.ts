export function buildQueryParams(
  params?: Record<string, string | number | boolean>
): string {
  if (!params) return "";
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return queryString ? `?${queryString}` : "";
}
