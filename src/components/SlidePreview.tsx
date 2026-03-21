"use client";

import React from "react";
import { SlideData, PresentationData } from "@/lib/slideGenerator";
import { getTemplateById, SlideTemplate } from "@/lib/templates";
import { getBoldKeywordsForSlide } from "@/lib/keywords";
import { ChartData, CHART_COLORS } from "@/lib/chartEngine";

interface SlidePreviewProps {
  slide: SlideData;
  template: SlideTemplate;
  presentation: PresentationData;
  isActive?: boolean;
  onClick?: () => void;
  size?: "small" | "large";
}

export default function SlidePreview({
  slide,
  template,
  presentation,
  isActive = false,
  onClick,
  size = "small",
}: SlidePreviewProps) {
  const colors = template.colors;
  const isDark = isBackgroundDark(colors.background);
  const scale = size === "large" ? 1 : 0.35;
  const containerWidth = size === "large" ? 960 : 336;
  const containerHeight = size === "large" ? 540 : 189;

  const renderBoldText = (text: string, fontSize: number, color: string, isBold = false) => {
    const parts = getBoldKeywordsForSlide(text, presentation.profile);
    return (
      <span>
        {parts.map((part, i) => (
          <span
            key={i}
            style={{
              fontWeight: part.bold ? 700 : isBold ? 700 : 400,
              color: part.bold ? `#${colors.highlight.replace('#', '')}` : color,
            }}
          >
            {part.text}
          </span>
        ))}
      </span>
    );
  };

  const renderSlideContent = () => {
    const title = slide.title === '{TITLE}' ? presentation.title : slide.title;
    const subtitle = slide.subtitle === '{SUBTITLE}' ? presentation.subtitle : slide.subtitle;

    switch (slide.type) {
      case "title":
        return (
          <div className="w-full h-full flex flex-col justify-center" style={{ backgroundColor: colors.primary, padding: `${40 * scale}px` }}>
            <div style={{ position: 'absolute', bottom: `${200 * scale}px`, left: 0, right: 0, height: `${3 * scale}px`, backgroundColor: colors.accent }} />
            <h1 style={{ fontSize: `${42 * scale}px`, fontWeight: 700, color: '#FFFFFF', marginBottom: `${12 * scale}px`, fontFamily: template.fonts.heading, lineHeight: 1.2 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: `${20 * scale}px`, color: colors.accent, opacity: 0.9, fontFamily: template.fonts.body }}>
                {subtitle}
              </p>
            )}
            <p style={{ fontSize: `${11 * scale}px`, color: '#AAAAAA', marginTop: `${30 * scale}px`, fontFamily: template.fonts.body }}>
              {presentation.date}
            </p>
          </div>
        );

      case "content":
        return (
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.background }}>
            <div style={{ backgroundColor: colors.primary, padding: `${12 * scale}px ${20 * scale}px`, minHeight: `${50 * scale}px`, display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: `${24 * scale}px`, fontWeight: 700, color: '#FFFFFF', fontFamily: template.fonts.heading }}>{slide.title}</h2>
            </div>
            <div style={{ height: `${2 * scale}px`, backgroundColor: colors.accent }} />
            <div style={{ padding: `${16 * scale}px ${20 * scale}px`, flex: 1 }}>
              {slide.bullets?.map((bullet, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: `${10 * scale}px` }}>
                  <span style={{ color: colors.accent, marginRight: `${8 * scale}px`, fontSize: `${10 * scale}px`, marginTop: `${2 * scale}px` }}>●</span>
                  <span style={{ fontSize: `${14 * scale}px`, color: isDark ? colors.text : colors.text, fontFamily: template.fonts.body, lineHeight: 1.5 }}>
                    {renderBoldText(bullet, 14 * scale, isDark ? colors.text : colors.text)}
                  </span>
                </div>
              ))}
              {slide.content && !slide.bullets && (
                <p style={{ fontSize: `${14 * scale}px`, color: isDark ? colors.text : colors.text, lineHeight: 1.6, fontFamily: template.fonts.body }}>
                  {renderBoldText(slide.content, 14 * scale, isDark ? colors.text : colors.text)}
                </p>
              )}
            </div>
          </div>
        );

      case "two-column":
        return (
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.background }}>
            <div style={{ backgroundColor: colors.primary, padding: `${12 * scale}px ${20 * scale}px`, minHeight: `${50 * scale}px`, display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: `${24 * scale}px`, fontWeight: 700, color: '#FFFFFF', fontFamily: template.fonts.heading }}>{slide.title}</h2>
            </div>
            <div style={{ height: `${2 * scale}px`, backgroundColor: colors.accent }} />
            <div style={{ display: 'flex', flex: 1, padding: `${12 * scale}px ${20 * scale}px`, gap: `${16 * scale}px` }}>
              {/* Left Column */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: `${16 * scale}px`, fontWeight: 700, color: colors.primary, marginBottom: `${8 * scale}px`, fontFamily: template.fonts.heading }}>
                  {slide.leftColumn?.title}
                </h3>
                {slide.leftColumn?.bullets.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: `${6 * scale}px` }}>
                    <span style={{ color: colors.accent, marginRight: `${6 * scale}px`, fontSize: `${8 * scale}px`, marginTop: `${2 * scale}px` }}>●</span>
                    <span style={{ fontSize: `${12 * scale}px`, color: isDark ? colors.text : colors.text, fontFamily: template.fonts.body, lineHeight: 1.4 }}>
                      {renderBoldText(b, 12 * scale, isDark ? colors.text : colors.text)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Divider */}
              <div style={{ width: `${1 * scale}px`, backgroundColor: colors.accent, opacity: 0.5 }} />
              {/* Right Column */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: `${16 * scale}px`, fontWeight: 700, color: colors.primary, marginBottom: `${8 * scale}px`, fontFamily: template.fonts.heading }}>
                  {slide.rightColumn?.title}
                </h3>
                {slide.rightColumn?.bullets.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: `${6 * scale}px` }}>
                    <span style={{ color: colors.accent, marginRight: `${6 * scale}px`, fontSize: `${8 * scale}px`, marginTop: `${2 * scale}px` }}>●</span>
                    <span style={{ fontSize: `${12 * scale}px`, color: isDark ? colors.text : colors.text, fontFamily: template.fonts.body, lineHeight: 1.4 }}>
                      {renderBoldText(b, 12 * scale, isDark ? colors.text : colors.text)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "stats":
        return (
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.background }}>
            <div style={{ backgroundColor: colors.primary, padding: `${12 * scale}px ${20 * scale}px`, minHeight: `${50 * scale}px`, display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: `${24 * scale}px`, fontWeight: 700, color: '#FFFFFF', fontFamily: template.fonts.heading }}>{slide.title}</h2>
            </div>
            <div style={{ height: `${2 * scale}px`, backgroundColor: colors.accent }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, gap: `${16 * scale}px`, padding: `${20 * scale}px` }}>
              {slide.stats?.map((stat, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: `${16 * scale}px`,
                  borderRadius: `${8 * scale}px`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `${1 * scale}px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  flex: 1,
                  maxWidth: `${260 * scale}px`,
                }}>
                  <div style={{ fontSize: `${36 * scale}px`, fontWeight: 800, color: colors.primary, fontFamily: template.fonts.heading }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: `${12 * scale}px`, fontWeight: 600, color: isDark ? colors.text : colors.text, marginTop: `${4 * scale}px`, fontFamily: template.fonts.body }}>
                    {stat.label}
                  </div>
                  {stat.description && (
                    <div style={{ fontSize: `${10 * scale}px`, color: colors.textLight, marginTop: `${4 * scale}px`, fontFamily: template.fonts.body }}>
                      {stat.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "process":
        return (
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.background }}>
            <div style={{ backgroundColor: colors.primary, padding: `${12 * scale}px ${20 * scale}px`, minHeight: `${50 * scale}px`, display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: `${24 * scale}px`, fontWeight: 700, color: '#FFFFFF', fontFamily: template.fonts.heading }}>{slide.title}</h2>
            </div>
            <div style={{ height: `${2 * scale}px`, backgroundColor: colors.accent }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1, gap: `${8 * scale}px`, padding: `${20 * scale}px ${16 * scale}px` }}>
              {slide.steps?.map((step, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: `${32 * scale}px`, height: `${32 * scale}px`,
                    borderRadius: '50%', backgroundColor: colors.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: `0 auto ${8 * scale}px`, color: '#FFFFFF',
                    fontSize: `${14 * scale}px`, fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: `${11 * scale}px`, fontWeight: 700, color: isDark ? colors.text : colors.primary, marginBottom: `${4 * scale}px`, fontFamily: template.fonts.heading }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: `${9 * scale}px`, color: colors.textLight, lineHeight: 1.3, fontFamily: template.fonts.body }}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "closing":
        return (
          <div className="w-full h-full flex flex-col justify-center items-center" style={{ backgroundColor: colors.primary, padding: `${40 * scale}px` }}>
            <div style={{ position: 'absolute', top: `${180 * scale}px`, left: 0, right: 0, height: `${3 * scale}px`, backgroundColor: colors.accent, opacity: 0.5 }} />
            <h1 style={{ fontSize: `${36 * scale}px`, fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: `${12 * scale}px`, fontFamily: template.fonts.heading }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ fontSize: `${16 * scale}px`, color: colors.accent, textAlign: 'center', fontFamily: template.fonts.body }}>
                {slide.subtitle}
              </p>
            )}
            {slide.content && (
              <p style={{ fontSize: `${12 * scale}px`, color: '#AAAAAA', textAlign: 'center', marginTop: `${20 * scale}px`, fontFamily: template.fonts.body }}>
                {slide.content}
              </p>
            )}
          </div>
        );

      case "chart":
        return (
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.background }}>
            <div style={{ backgroundColor: colors.primary, padding: `${12 * scale}px ${20 * scale}px`, minHeight: `${50 * scale}px`, display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: `${24 * scale}px`, fontWeight: 700, color: '#FFFFFF', fontFamily: template.fonts.heading }}>{slide.title}</h2>
            </div>
            <div style={{ height: `${2 * scale}px`, backgroundColor: colors.accent }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${16 * scale}px` }}>
              {slide.chart && renderChartPreview(slide.chart, scale, colors)}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.background }}>
            <p style={{ color: colors.textLight, fontSize: `${14 * scale}px` }}>Slide Preview</p>
          </div>
        );
    }
  };

  // Render an SVG chart preview
  function renderChartPreview(chart: ChartData, scale: number, colors: any) {
    const w = 800 * scale;
    const h = 340 * scale;
    const padding = 40 * scale;

    if (chart.type === "pie" || chart.type === "doughnut") {
      return renderPieChart(chart, w, h, scale);
    }
    return renderBarLineChart(chart, w, h, padding, scale, colors);
  }

  function renderPieChart(chart: ChartData, w: number, h: number, scale: number) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;
    const innerR = chart.type === "doughnut" ? r * 0.55 : 0;
    const values = chart.datasets[0]?.values || [];
    const total = values.reduce((a, b) => a + b, 0);

    let currentAngle = -Math.PI / 2;
    const slices = values.map((v, i) => {
      const angle = (v / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const ix1 = cx + innerR * Math.cos(startAngle);
      const iy1 = cy + innerR * Math.sin(startAngle);
      const ix2 = cx + innerR * Math.cos(endAngle);
      const iy2 = cy + innerR * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;

      const d = innerR > 0
        ? `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return (
        <path key={i} d={d} fill={chart.datasets[0]?.color || CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
      );
    });

    // Legend
    const legend = chart.labels.map((label, i) => (
      <g key={`legend-${i}`} transform={`translate(${w - 120 * scale}, ${30 * scale + i * 18 * scale})`}>
        <rect width={10 * scale} height={10 * scale} fill={CHART_COLORS[i % CHART_COLORS.length]} rx={2} />
        <text x={14 * scale} y={9 * scale} fontSize={9 * scale} fill={isDark ? colors.text : "#333"}>{label}</text>
      </g>
    ));

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {slices}
        {legend}
      </svg>
    );
  }

  function renderBarLineChart(chart: ChartData, w: number, h: number, padding: number, scale: number, colors: any) {
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;
    const labels = chart.labels;
    const barWidth = chartW / labels.length * 0.6;
    const gap = chartW / labels.length;

    const allValues = chart.datasets.flatMap(d => d.values);
    const maxVal = Math.max(...allValues, 1);

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line key={`grid-${i}`} x1={padding} x2={w - padding} y1={padding + chartH * (1 - pct)} y2={padding + chartH * (1 - pct)} stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} strokeWidth={1} />
        ))}

        {/* Bars or Lines */}
        {chart.datasets.map((ds, dsIdx) => {
          const color = ds.color || CHART_COLORS[dsIdx % CHART_COLORS.length];

          if (chart.type === "bar") {
            const offsetX = chart.datasets.length > 1 ? (dsIdx - (chart.datasets.length - 1) / 2) * (barWidth / chart.datasets.length + 2) : 0;
            return ds.values.map((v, i) => {
              const barH = (v / maxVal) * chartH;
              const x = padding + gap * i + gap / 2 - barWidth / 2 + offsetX;
              const y = padding + chartH - barH;
              return (
                <rect key={`bar-${dsIdx}-${i}`} x={x} y={y} width={barWidth / Math.max(chart.datasets.length, 1)} height={barH} fill={color} rx={2 * scale} opacity={0.85} />
              );
            });
          } else {
            // Line or area
            const points = ds.values.map((v, i) => {
              const x = padding + gap * i + gap / 2;
              const y = padding + chartH - (v / maxVal) * chartH;
              return { x, y };
            });
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <g key={`line-${dsIdx}`}>
                {chart.type === "area" && (
                  <path d={`${linePath} L ${points[points.length - 1].x} ${padding + chartH} L ${points[0].x} ${padding + chartH} Z`} fill={color} opacity={0.15} />
                )}
                <path d={linePath} fill="none" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={`dot-${dsIdx}-${i}`} cx={p.x} cy={p.y} r={3 * scale} fill={color} />
                ))}
              </g>
            );
          }
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => (
          <text key={`xlabel-${i}`} x={padding + gap * i + gap / 2} y={h - 5 * scale} textAnchor="middle" fontSize={9 * scale} fill={isDark ? colors.textLight : "#666"}>
            {label}
          </text>
        ))}

        {/* Legend */}
        {chart.datasets.length > 1 && chart.datasets.map((ds, i) => (
          <g key={`legend-${i}`} transform={`translate(${padding + i * 100 * scale}, ${8 * scale})`}>
            <rect width={10 * scale} height={10 * scale} fill={ds.color || CHART_COLORS[i]} rx={2} />
            <text x={14 * scale} y={9 * scale} fontSize={8 * scale} fill={isDark ? colors.text : "#333"}>{ds.label}</text>
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${
        isActive ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900' : ''
      }`}
      style={{
        width: containerWidth,
        height: containerHeight,
        borderRadius: size === "large" ? 8 : 6,
        boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="slide-preview" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderSlideContent()}
      </div>
    </div>
  );
}

function isBackgroundDark(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
