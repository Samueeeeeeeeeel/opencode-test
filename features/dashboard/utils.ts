export function getFinancialMonth(
  closingDay: number,
  referenceDate: Date = new Date()
) {
  const day = referenceDate.getDate();
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();

  if (day >= closingDay) {
    return {
      start: new Date(year, month - 1, closingDay),
      end: new Date(year, month, closingDay - 1),
    };
  } else {
    return {
      start: new Date(year, month - 2, closingDay),
      end: new Date(year, month - 1, closingDay - 1),
    };
  }
}
