import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors, chartAreaGradient } from './ChartjsConfig';
import { adjustColorOpacity, getCssVariable } from '../utils/Utils';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip);

function DeliveryLineChart({ data, width, height }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  const labels = data.map((_, i) => `#${i + 1}`);

  useEffect(() => {
    const ctx = canvas.current;
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Délai',
          data,
          fill: true,
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            return chartAreaGradient(c, chartArea, [
              { stop: 0, color: adjustColorOpacity(getCssVariable('--color-blue-500') || '#0984E3', 0) },
              { stop: 1, color: adjustColorOpacity(getCssVariable('--color-blue-500') || '#0984E3', 0.2) },
            ]);
          },
          borderColor: '#0984E3',
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: '#0984E3',
          pointHoverBackgroundColor: '#0984E3',
          pointBorderWidth: 0,
          clip: 20,
          tension: 0.4,
        }],
      },
      options: {
        layout: { padding: { top: 8, bottom: 8, left: 16, right: 16 } },
        scales: {
          y: {
            border: { display: false },
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
              callback: (v) => `${v}h`,
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
              autoSkipPadding: 20,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => false,
              label: (ctx) => ` ${ctx.parsed.y}h`,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: { intersect: false, mode: 'nearest' },
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
    chart.data.labels = data.map((_, i) => `#${i + 1}`);
    chart.data.datasets[0].data = data;
    chart.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.grid.color  = darkMode ? gridColor.dark  : gridColor.light;
    chart.options.plugins.tooltip.bodyColor       = darkMode ? tooltipBodyColor.dark  : tooltipBodyColor.light;
    chart.options.plugins.tooltip.backgroundColor = darkMode ? tooltipBgColor.dark    : tooltipBgColor.light;
    chart.options.plugins.tooltip.borderColor     = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light;
    chart.update('none');
  }, [currentTheme, data]);

  return <canvas ref={canvas} width={width} height={height}></canvas>;
}

export default DeliveryLineChart;
