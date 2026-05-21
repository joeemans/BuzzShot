export function pagination(pageValue: number | undefined, pageSizeValue: number | undefined) {
  const page = Math.max(1, pageValue ?? 1);
  const pageSize = Math.min(50, Math.max(1, pageSizeValue ?? 20));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}
