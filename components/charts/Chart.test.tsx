import { render, screen } from '@testing-library/react';
import { Chart } from './Chart';

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

jest.mock('echarts-for-react', () => {
  return function MockECharts({ option }: { option: Record<string, unknown> }) {
    return <div data-testid="echarts" data-option={JSON.stringify(option)} />;
  };
});

describe('Chart', () => {
  it('renders the chart with themed option', () => {
    render(<Chart option={{ series: [] }} />);
    const echarts = screen.getByTestId('echarts');
    const option = JSON.parse(echarts.getAttribute('data-option') || '{}');
    expect(option.backgroundColor).toBe('transparent');
    expect(option.textStyle.color).toBe('#374151');
  });

  it('applies className to wrapper', () => {
    const { container } = render(<Chart option={{}} className="my-chart" />);
    expect(container.firstChild).toHaveClass('my-chart');
  });

  it('passes height to echarts', () => {
    render(<Chart option={{}} height="300px" />);
    const echarts = screen.getByTestId('echarts');
    expect(echarts).toBeInTheDocument();
  });
});
