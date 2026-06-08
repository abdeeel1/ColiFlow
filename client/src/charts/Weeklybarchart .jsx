import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import {
  Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

function WeeklyBarChart({ data, width, height }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  const labels = data.map((_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    const ctx = canvas.current;
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: '#0984E3',
          hoverBackgroundColor: '#0670c4',
          borderRadius: 3,
          borderSkipped: false,
          barThickness: 8,
        }],
      },
      options: {
        layout: { padding: { top: 8, bottom: 8, left: 8, right: 8 } },
        scales: {
          y: {
            border: { display: false },
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
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
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => false,
              label: (ctx) => ` ${ctx.parsed.y} colis`,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: { intersect: false, mode: 'nearest' },
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: { duration: 500 },
      },
    });
    setChart(newChart);
    return () => newChart.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chart) return;
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

export default WeeklyBarChart;