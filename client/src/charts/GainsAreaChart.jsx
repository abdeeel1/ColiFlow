import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors, chartAreaGradient } from './ChartjsConfig';
import { adjustColorOpacity, getCssVariable } from '../utils/Utils';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip);

/**
 * Smooth area chart for traveler gains / trajets / commissions.
 *
 * Props:
 *  - data    : number[]   the values
 *  - labels  : string[]   x-axis labels (same length as data)
 *  - unit    : string     tooltip suffix ('MAD' | 'trajets'…)
 *  - width / height
 */
function GainsAreaChart({ data, labels, unit = 'MAD', width, height }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  const fmt = (v) => `${Number(v).toLocaleString('fr-MA')}${unit ? ` ${unit}` : ''}`;

  useEffect(() => {
    const ctx = canvas.current;
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          fill: true,
          backgroundColor: function (context) {
            const c = context.chart;
            const { ctx: cc, chartArea } = c;
            if (!chartArea) return 'transparent';
            return chartAreaGradient(cc, chartArea, [
              { stop: 0, color: adjustColorOpacity(getCssVariable('--color-blue-500') || '#0984E3', 0) },
              { stop: 1, color: adjustColorOpacity(getCssVariable('--color-blue-500') || '#0984E3', 0.18) },
            ]);
          },
          borderColor: '#0984E3',
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0984E3',
          pointHoverBackgroundColor: '#0984E3',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          clip: 20,
          tension: 0.4,
        }],
      },
      options: {
        layout: { padding: { top: 12, bottom: 8, left: 16, right: 16 } },
        scales: {
          y: {
            border: { display: false },
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
              callback: (v) => `${Number(v).toLocaleString('fr-MA')}${unit === 'MAD' ? ' MAD' : ''}`,
              color: darkMode ? textColor.dark : textColor.light,
              font: { size: 11 },
            },
            grid: { color: darkMode ? gridColor.dark : gridColor.light },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: darkMode ? textColor.dark : textColor.light,
              font: { size: 11 },
              maxRotation: 0,
              autoSkipPadding: 16,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (c) => ` ${fmt(c.parsed.y)}`,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: { intersect: false, mode: 'index' },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });
    setChart(newChart);
    return () => newChart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.grid.color  = darkMode ? gridColor.dark  : gridColor.light;
    chart.options.plugins.tooltip.bodyColor       = darkMode ? tooltipBodyColor.dark   : tooltipBodyColor.light;
    chart.options.plugins.tooltip.backgroundColor = darkMode ? tooltipBgColor.dark     : tooltipBgColor.light;
    chart.options.plugins.tooltip.borderColor     = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light;
    chart.update('none');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme, data, labels, unit]);

  return <canvas ref={canvas} width={width} height={height}></canvas>;
}

export default GainsAreaChart;
