// PPTX Generation Engine using PptxGenJS
// Creates professional PowerPoint files with bold keywords and styled templates

import PptxGenJS from "pptxgenjs";
import { SlideData, PresentationData } from "./slideGenerator";
import { getTemplateById, SlideTemplate } from "./templates";
import { getBoldKeywordsForSlide } from "./keywords";
import { ChartData, CHART_COLORS } from "./chartEngine";

interface TextSegment {
  text: string;
  options: PptxGenJS.TextPropsOptions;
}

// PptxGenJS requires hex colors WITHOUT the '#' prefix
function c(hex: string): string {
  return hex.replace(/^#/, '');
}

export function generatePptx(presentation: PresentationData): Promise<Blob> {
  const pptx = new PptxGenJS();
  const template = getTemplateById(presentation.templateId);

  if (!template) throw new Error("Template not found");

  // Set presentation properties
  pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
  pptx.author = presentation.author;
  pptx.title = presentation.title;
  pptx.subject = presentation.subtitle;

  // Define master slides based on template
  defineMasterSlides(pptx, template);

  // Generate each slide
  presentation.slides.forEach((slideData) => {
    const slide = pptx.addSlide();
    applySlideContent(slide, slideData, template, presentation);
  });

  return pptx.write({ outputType: "blob" }) as Promise<Blob>;
}

function defineMasterSlides(pptx: PptxGenJS, template: SlideTemplate) {
  pptx.defineSlideMaster({
    title: "TITLE_SLIDE",
    background: template.colors.gradient
      ? { fill: c(template.colors.primary) }
      : { fill: c(template.colors.background) },
  });

  pptx.defineSlideMaster({
    title: "CONTENT_SLIDE",
    background: { fill: c(template.colors.background) },
  });
}

function applySlideContent(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  switch (data.type) {
    case "title":
      renderTitleSlide(slide, data, template, presentation);
      break;
    case "content":
      renderContentSlide(slide, data, template, presentation);
      break;
    case "two-column":
      renderTwoColumnSlide(slide, data, template, presentation);
      break;
    case "stats":
      renderStatsSlide(slide, data, template, presentation);
      break;
    case "process":
      renderProcessSlide(slide, data, template, presentation);
      break;
    case "closing":
      renderClosingSlide(slide, data, template, presentation);
      break;
    case "quote":
      renderQuoteSlide(slide, data, template, presentation);
      break;
    case "chart":
      renderChartSlide(slide, data, template, presentation);
      break;
    default:
      renderContentSlide(slide, data, template, presentation);
  }
}

function renderTitleSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;
  const title = data.title === '{TITLE}' ? presentation.title : data.title;
  const subtitle = data.subtitle === '{SUBTITLE}' ? presentation.subtitle : data.subtitle;

  slide.addShape("rect", {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: c(colors.primary) },
  });

  slide.addShape("rect", {
    x: 0, y: 5.0, w: "100%", h: 0.08,
    fill: { color: c(colors.accent) },
  });

  slide.addText(title, {
    x: 1.0, y: 2.0, w: 11.33, h: 1.5,
    fontSize: 40, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true,
    align: "left", valign: "bottom",
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 1.0, y: 3.6, w: 11.33, h: 0.8,
      fontSize: 20, fontFace: template.fonts.body,
      color: lightenColor(colors.accent, 0.3),
      align: "left", valign: "top",
    });
  }

  slide.addText(presentation.date, {
    x: 1.0, y: 5.5, w: 5, h: 0.5,
    fontSize: 12, fontFace: template.fonts.body,
    color: "CCCCCC", align: "left",
  });

  if (['investment_banking', 'consulting', 'board'].includes(presentation.profile)) {
    slide.addText("CONFIDENTIAL", {
      x: 8.0, y: 5.5, w: 4.33, h: 0.5,
      fontSize: 10, fontFace: template.fonts.body,
      color: "999999", align: "right",
      italic: true,
    });
  }
}

function renderContentSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;
  const isDark = isBackgroundDark(colors.background);

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 1.1, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 0.8, y: 0.15, w: 11.73, h: 0.8,
    fontSize: 24, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true,
    align: "left", valign: "middle",
  });

  if (data.bullets && data.bullets.length > 0) {
    data.bullets.forEach((bullet, index) => {
      const segments = buildBoldSegments(bullet, presentation.profile, template);
      const yPos = 1.5 + index * 1.1;

      slide.addText("●", {
        x: 0.8, y: yPos, w: 0.4, h: 0.8,
        fontSize: 10, color: c(colors.accent),
        valign: "top",
      });

      slide.addText(segments, {
        x: 1.3, y: yPos, w: 11.03, h: 0.8,
        fontSize: 16, fontFace: template.fonts.body,
        color: c(colors.text),
        valign: "top", lineSpacing: 22,
      });
    });
  }

  if (data.content && !data.bullets) {
    const segments = buildBoldSegments(data.content, presentation.profile, template);
    slide.addText(segments, {
      x: 0.8, y: 1.5, w: 11.73, h: 5.0,
      fontSize: 16, fontFace: template.fonts.body,
      color: c(colors.text),
      valign: "top", lineSpacing: 24,
    });
  }

  addPageNumber(slide, template);
}

function renderTwoColumnSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 1.1, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 0.8, y: 0.15, w: 11.73, h: 0.8,
    fontSize: 24, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true, align: "left", valign: "middle",
  });

  slide.addShape("rect", {
    x: 6.565, y: 1.5, w: 0.03, h: 5.2,
    fill: { color: c(colors.accent) },
  });

  if (data.leftColumn) {
    slide.addText(data.leftColumn.title, {
      x: 0.8, y: 1.5, w: 5.5, h: 0.6,
      fontSize: 18, fontFace: template.fonts.heading,
      color: c(colors.primary), bold: true,
    });

    data.leftColumn.bullets.forEach((bullet, i) => {
      const segments = buildBoldSegments(bullet, presentation.profile, template);
      slide.addText("●", {
        x: 0.8, y: 2.3 + i * 1.0, w: 0.4, h: 0.7,
        fontSize: 10, color: c(colors.accent), valign: "top",
      });
      slide.addText(segments, {
        x: 1.3, y: 2.3 + i * 1.0, w: 4.9, h: 0.7,
        fontSize: 14, fontFace: template.fonts.body,
        color: c(colors.text),
        valign: "top", lineSpacing: 20,
      });
    });
  }

  if (data.rightColumn) {
    slide.addText(data.rightColumn.title, {
      x: 6.9, y: 1.5, w: 5.5, h: 0.6,
      fontSize: 18, fontFace: template.fonts.heading,
      color: c(colors.primary), bold: true,
    });

    data.rightColumn.bullets.forEach((bullet, i) => {
      const segments = buildBoldSegments(bullet, presentation.profile, template);
      slide.addText("●", {
        x: 6.9, y: 2.3 + i * 1.0, w: 0.4, h: 0.7,
        fontSize: 10, color: c(colors.accent), valign: "top",
      });
      slide.addText(segments, {
        x: 7.4, y: 2.3 + i * 1.0, w: 4.9, h: 0.7,
        fontSize: 14, fontFace: template.fonts.body,
        color: c(colors.text),
        valign: "top", lineSpacing: 20,
      });
    });
  }

  addPageNumber(slide, template);
}

function renderStatsSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 1.1, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 0.8, y: 0.15, w: 11.73, h: 0.8,
    fontSize: 24, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true, align: "left", valign: "middle",
  });

  if (data.stats) {
    const cardWidth = 3.5;
    const gap = 0.6;
    const totalWidth = data.stats.length * cardWidth + (data.stats.length - 1) * gap;
    const startX = (13.33 - totalWidth) / 2;

    data.stats.forEach((stat, i) => {
      const x = startX + i * (cardWidth + gap);
      const y = 2.2;

      slide.addShape("roundRect", {
        x, y, w: cardWidth, h: 3.8,
        fill: { color: isBackgroundDark(colors.background) ? lightenColor(colors.background, 0.1) : darkenColor(colors.background, 0.03) },
        rectRadius: 0.15,
        shadow: { type: "outer", blur: 8, offset: 2, color: "000000", opacity: 0.1 },
      });

      slide.addShape("rect", {
        x: x + 0.1, y: y + 0.15, w: cardWidth - 0.2, h: 0.05,
        fill: { color: c(colors.accent) },
      });

      slide.addText(stat.value, {
        x, y: y + 0.5, w: cardWidth, h: 1.2,
        fontSize: 44, fontFace: template.fonts.heading,
        color: c(colors.primary), bold: true,
        align: "center", valign: "middle",
      });

      slide.addText(stat.label, {
        x, y: y + 1.7, w: cardWidth, h: 0.6,
        fontSize: 14, fontFace: template.fonts.body,
        color: c(colors.text),
        bold: true, align: "center",
      });

      if (stat.description) {
        slide.addText(stat.description, {
          x, y: y + 2.4, w: cardWidth, h: 0.6,
          fontSize: 12, fontFace: template.fonts.body,
          color: c(colors.textLight), align: "center",
        });
      }
    });
  }

  addPageNumber(slide, template);
}

function renderProcessSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;
  const isDark = isBackgroundDark(colors.background);

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 1.1, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 0.8, y: 0.15, w: 11.73, h: 0.8,
    fontSize: 24, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true, align: "left", valign: "middle",
  });

  if (data.steps) {
    const stepWidth = 2.6;
    const gap = 0.35;
    const totalWidth = data.steps.length * stepWidth + (data.steps.length - 1) * gap;
    const startX = (13.33 - totalWidth) / 2;

    data.steps.forEach((step, i) => {
      const x = startX + i * (stepWidth + gap);

      slide.addShape("ellipse", {
        x: x + stepWidth / 2 - 0.35, y: 1.8, w: 0.7, h: 0.7,
        fill: { color: c(colors.accent) },
      });
      slide.addText(`${i + 1}`, {
        x: x + stepWidth / 2 - 0.35, y: 1.8, w: 0.7, h: 0.7,
        fontSize: 20, fontFace: template.fonts.heading,
        color: "FFFFFF", bold: true,
        align: "center", valign: "middle",
      });

      if (i < data.steps!.length - 1) {
        slide.addShape("rect", {
          x: x + stepWidth / 2 + 0.4, y: 2.1, w: gap + stepWidth - 0.8, h: 0.04,
          fill: { color: c(colors.accent) },
        });
      }

      slide.addText(step.title, {
        x, y: 2.8, w: stepWidth, h: 0.6,
        fontSize: 14, fontFace: template.fonts.heading,
        color: c(isDark ? colors.text : colors.primary), bold: true,
        align: "center",
      });

      const segments = buildBoldSegments(step.description, presentation.profile, template);
      slide.addText(segments, {
        x, y: 3.5, w: stepWidth, h: 2.5,
        fontSize: 11, fontFace: template.fonts.body,
        color: c(colors.textLight),
        align: "center", valign: "top", lineSpacing: 16,
      });
    });
  }

  addPageNumber(slide, template);
}

function renderClosingSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 4.5, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 1.0, y: 2.2, w: 11.33, h: 1.2,
    fontSize: 36, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true,
    align: "center", valign: "middle",
  });

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.0, y: 3.5, w: 11.33, h: 0.8,
      fontSize: 18, fontFace: template.fonts.body,
      color: lightenColor(colors.accent, 0.3),
      align: "center",
    });
  }

  if (data.content) {
    slide.addText(data.content, {
      x: 1.0, y: 5.0, w: 11.33, h: 0.5,
      fontSize: 14, fontFace: template.fonts.body,
      color: "AAAAAA", align: "center",
    });
  }
}

function renderQuoteSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });

  if (data.quote) {
    slide.addText(`"${data.quote.text}"`, {
      x: 1.5, y: 1.5, w: 10.33, h: 3.5,
      fontSize: 28, fontFace: template.fonts.heading,
      color: c(colors.primary), italic: true,
      align: "center", valign: "middle",
    });

    slide.addText(`— ${data.quote.author}`, {
      x: 1.5, y: 5.0, w: 10.33, h: 0.8,
      fontSize: 16, fontFace: template.fonts.body,
      color: c(colors.textLight), align: "center",
    });
  }
}

function renderChartSlide(
  slide: PptxGenJS.Slide,
  data: SlideData,
  template: SlideTemplate,
  presentation: PresentationData
) {
  const colors = template.colors;

  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: c(colors.background) } });
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: c(colors.primary) } });
  slide.addShape("rect", { x: 0, y: 1.1, w: "100%", h: 0.05, fill: { color: c(colors.accent) } });

  slide.addText(data.title, {
    x: 0.8, y: 0.15, w: 11.73, h: 0.8,
    fontSize: 24, fontFace: template.fonts.heading,
    color: "FFFFFF", bold: true, align: "left", valign: "middle",
  });

  if (data.chart) {
    const chart = data.chart;
    const chartColors = chart.datasets.map((ds, i) =>
      c(ds.color || CHART_COLORS[i % CHART_COLORS.length])
    );

    // Map chart type to PptxGenJS chart type string
    const pptxChartTypeMap: Record<string, any> = {
      bar: "bar",
      line: "line",
      pie: "pie",
      doughnut: "doughnut",
      area: "area",
    };

    const chartType = pptxChartTypeMap[chart.type] || "bar";

    try {
      const chartData = chart.datasets.map((ds) => ({
        name: ds.label,
        labels: chart.labels,
        values: ds.values,
      }));

      slide.addChart(chartType, chartData, {
        x: 1.0, y: 1.5, w: 11.33, h: 5.5,
        showLegend: chart.datasets.length > 1,
        legendPos: "b",
        legendFontSize: 10,
        showTitle: false,
        chartColors,
        valAxisLabelFontSize: 10,
        catAxisLabelFontSize: 10,
        dataLabelFontSize: 9,
      } as any);
    } catch {
      slide.addText(`[${chart.type.toUpperCase()} CHART: ${chart.title}]`, {
        x: 1.0, y: 3.0, w: 11.33, h: 2.0,
        fontSize: 18, fontFace: template.fonts.body,
        color: c(colors.textLight), align: "center", valign: "middle",
      });
    }
  }

  addPageNumber(slide, template);
}

// Build text segments with bold keywords highlighted
function buildBoldSegments(
  text: string,
  profile: string,
  template: SlideTemplate
): TextSegment[] {
  const parts = getBoldKeywordsForSlide(text, profile);

  return parts.map(part => ({
    text: part.text,
    options: {
      bold: part.bold,
      color: c(part.bold ? template.colors.highlight : template.colors.text),
      fontSize: undefined, // inherit
      fontFace: part.bold ? template.fonts.heading : template.fonts.body,
    },
  }));
}

function addPageNumber(slide: PptxGenJS.Slide, template: SlideTemplate) {
  slide.addText("", {
    x: 12.0, y: 6.9, w: 1.0, h: 0.4,
    fontSize: 9, fontFace: template.fonts.body,
    color: c(template.colors.textLight), align: "right",
  });
}

// Color utilities
function isBackgroundDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return c(hex);
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return c(hex);
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
