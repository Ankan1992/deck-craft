"use client";

import React from "react";
import { SlideData, PresentationData } from "@/lib/slideGenerator";
import { getTemplateById, SlideTemplate } from "@/lib/templates";
import { getBoldKeywordsForSlide } from "@/lib/keywords";

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

      default:
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.background }}>
            <p style={{ color: colors.textLight, fontSize: `${14 * scale}px` }}>Slide Preview</p>
          </div>
        );
    }
  };

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
