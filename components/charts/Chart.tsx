'use client';

import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

function subscribeAll() {
  return () => {};
}

interface ChartProps {
  option: Record<string, unknown>;
  height?: string;
  className?: string;
}

export function Chart({ option, height = '400px', className }: ChartProps) {
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(subscribeAll, () => true, () => false);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 ${className || ''}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-400">Cargando gráfico...</span>
      </div>
    );
  }

  const themedOption = {
    ...option,
    backgroundColor: 'transparent',
    textStyle: {
      color: theme === 'dark' ? '#e5e7eb' : '#374151',
    },
  };

  return (
    <div className={className}>
      <ReactECharts
        option={themedOption}
        style={{ height }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
