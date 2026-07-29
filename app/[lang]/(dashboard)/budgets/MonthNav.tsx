'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function MonthNav({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(m: number, y: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', String(m));
    params.set('year', String(y));
    router.push(`${pathname}?${params.toString()}`);
  }

  function prev() {
    if (month === 1) {
      goTo(12, year - 1);
    } else {
      goTo(month - 1, year);
    }
  }

  function next() {
    if (month === 12) {
      goTo(1, year + 1);
    } else {
      goTo(month + 1, year);
    }
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-800">
      <button onClick={prev} className="text-sm font-medium text-blue-600 hover:text-blue-800">
        &larr; Anterior
      </button>
      <span className="text-sm font-semibold">
        {months[month - 1]} {year}
      </span>
      <button onClick={next} className="text-sm font-medium text-blue-600 hover:text-blue-800">
        Siguiente &rarr;
      </button>
    </div>
  );
}
