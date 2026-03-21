// Continuous Chat Engine
// Processes user messages to iteratively refine presentations
// Supports: editing slides, adding/removing slides, changing tone, adding charts, etc.

import { SlideData, PresentationData, generateSlidesFromPrompt } from "./slideGenerator";
import { getKeywordsForProfile } from "./keywords";
import { TEMPLATES } from "./templates";
import { ChartData, generateChartForContext } from "./chartEngine";

export interface ChatAction {
  type:
    | "edit_slide"
    | "add_slide"
    | "remove_slide"
    | "reorder_slide"
    | "change_title"
    | "change_template"
    | "change_tone"
    | "add_chart"
    | "add_bullet"
    | "remove_bullet"
    | "regenerate"
    | "info"
    | "unknown";
  slideIndex?: number;
  payload?: any;
  message: string; // response to show the user
}

// Parse a user message and figure out what action to take on the presentation
export function processChatCommand(
  message: string,
  presentation: PresentationData
): ChatAction {
  const lower = message.toLowerCase().trim();
  const slideCount = presentation.slides.length;

  // ---- SLIDE TARGETING: "slide 3", "third slide", "last slide" ----
  const slideIdx = extractSlideIndex(lower, slideCount);

  // ---- ADD CHART ----
  if (/add\s+(a\s+)?chart|insert\s+(a\s+)?chart|add\s+(a\s+)?graph|insert\s+(a\s+)?graph|pie\s+chart|bar\s+chart|line\s+chart|doughnut|area\s+chart/i.test(lower)) {
    const chartType = detectChartType(lower);
    const targetSlide = slideIdx !== null ? slideIdx : slideCount; // append if no target
    const chartTitle = extractChartTitle(message) || "Key Metrics Overview";

    // Try to extract data from the message
    const chartData = parseChartDataFromMessage(message, chartType);

    return {
      type: "add_chart",
      slideIndex: targetSlide,
      payload: { chartType, chartTitle, chartData },
      message: `Added a ${chartType} chart "${chartTitle}" ${slideIdx !== null ? `at slide ${slideIdx + 1}` : `as a new slide`}.`,
    };
  }

  // ---- CHANGE TITLE (presentation-level) ----
  if (/^(change|update|set|rename)\s+(the\s+)?(presentation\s+)?title\s+to\s+/i.test(lower)) {
    const newTitle = message.replace(/^(change|update|set|rename)\s+(the\s+)?(presentation\s+)?title\s+to\s+/i, "").replace(/["']/g, "").trim();
    return {
      type: "change_title",
      payload: { title: newTitle },
      message: `Presentation title updated to "${newTitle}".`,
    };
  }

  // ---- CHANGE TEMPLATE ----
  if (/change\s+(the\s+)?template\s+to|switch\s+(to\s+)?template|use\s+(the\s+)?.*template/i.test(lower)) {
    const templateMatch = TEMPLATES.find(t =>
      lower.includes(t.id.replace("-", " ")) ||
      lower.includes(t.name.toLowerCase())
    );
    if (templateMatch) {
      return {
        type: "change_template",
        payload: { templateId: templateMatch.id },
        message: `Switched to the "${templateMatch.name}" template.`,
      };
    }
    return {
      type: "info",
      message: `Available templates: ${TEMPLATES.map(t => t.name).join(", ")}. Try "switch to [template name]".`,
    };
  }

  // ---- CHANGE TONE / PROFILE ----
  if (/make\s+it\s+more|change\s+(the\s+)?tone|switch\s+to\s+.*\s+(tone|style|mode)|more\s+(business|tech|consulting|academic|formal)/i.test(lower)) {
    const toneMap: Record<string, string> = {
      business: "business", corporate: "business", formal: "business",
      tech: "tech", technical: "tech", engineering: "tech", developer: "tech",
      consulting: "consulting", strategic: "consulting", advisory: "consulting",
      academic: "academic", research: "academic", scholarly: "academic",
      startup: "vc_pitch", pitch: "vc_pitch", investor: "vc_pitch",
      banking: "investment_banking", finance: "investment_banking",
      board: "board", governance: "board", directors: "board",
      aop: "aop", planning: "aop", budget: "aop",
      product: "product", launch: "product",
    };
    const detectedTone = Object.entries(toneMap).find(([key]) => lower.includes(key));
    if (detectedTone) {
      return {
        type: "change_tone",
        payload: { profile: detectedTone[1] },
        message: `Tone switched to ${detectedTone[1].replace("_", " ")}. Keywords and language will adapt accordingly.`,
      };
    }
  }

  // ---- REMOVE SLIDE ----
  if (/remove\s+(slide|the\s+slide)|delete\s+(slide|the\s+slide)/i.test(lower) && slideIdx !== null) {
    return {
      type: "remove_slide",
      slideIndex: slideIdx,
      message: `Removed slide ${slideIdx + 1} ("${presentation.slides[slideIdx]?.title || ""}").`,
    };
  }

  // ---- ADD SLIDE ----
  if (/add\s+(a\s+)?(new\s+)?slide|insert\s+(a\s+)?(new\s+)?slide/i.test(lower)) {
    // Determine what kind of slide
    const slideType = detectNewSlideType(lower);
    const slideTitle = extractSlideTitle(message) || "New Slide";
    const bullets = extractBullets(message);

    return {
      type: "add_slide",
      slideIndex: slideIdx !== null ? slideIdx + 1 : slideCount - 1, // before closing
      payload: { slideType, slideTitle, bullets },
      message: `Added a new ${slideType} slide "${slideTitle}" at position ${(slideIdx !== null ? slideIdx + 2 : slideCount)}.`,
    };
  }

  // ---- EDIT SPECIFIC SLIDE ----
  if (slideIdx !== null && (
    /change|update|edit|modify|replace|set|make/i.test(lower)
  )) {
    // Extract what to change
    if (/title/i.test(lower)) {
      const newTitle = message.replace(/.*title\s+(to\s+)?/i, "").replace(/["']/g, "").trim();
      if (newTitle) {
        return {
          type: "edit_slide",
          slideIndex: slideIdx,
          payload: { field: "title", value: newTitle },
          message: `Updated slide ${slideIdx + 1} title to "${newTitle}".`,
        };
      }
    }

    if (/bullet|point|content|text/i.test(lower)) {
      const newContent = message.replace(/.*(?:bullet|point|content|text)\s*(to\s+)?/i, "").trim();
      return {
        type: "edit_slide",
        slideIndex: slideIdx,
        payload: { field: "content", value: newContent },
        message: `Updated content on slide ${slideIdx + 1}.`,
      };
    }

    // Generic edit — update the whole slide with the message content
    return {
      type: "edit_slide",
      slideIndex: slideIdx,
      payload: { field: "generic", value: message },
      message: `Updated slide ${slideIdx + 1} based on your input.`,
    };
  }

  // ---- ADD BULLET ----
  if (/add\s+(a\s+)?(bullet|point)/i.test(lower) && slideIdx !== null) {
    const bulletText = message.replace(/.*(?:add\s+(?:a\s+)?(?:bullet|point)\s*(?:to\s+)?(?:slide\s*\d*\s*)?(?:saying|with|:)?)/i, "").trim();
    return {
      type: "add_bullet",
      slideIndex: slideIdx,
      payload: { bullet: bulletText || "New bullet point" },
      message: `Added a bullet point to slide ${slideIdx + 1}.`,
    };
  }

  // ---- REGENERATE ----
  if (/regenerate|rebuild|redo|start over|create\s+again/i.test(lower)) {
    return {
      type: "regenerate",
      message: "Regenerating presentation with your latest inputs...",
    };
  }

  // ---- GENERAL CONTENT — treat as additional context for the current slide ----
  if (presentation && message.length > 10) {
    return {
      type: "add_bullet",
      slideIndex: slideIdx ?? Math.max(0, slideCount - 2), // add to second-to-last slide
      payload: { bullet: message },
      message: `Added your input as content to slide ${(slideIdx ?? slideCount - 1) + 1}. You can also try: "add a bar chart", "remove slide 3", "change title to X", or "add a new slide about [topic]".`,
    };
  }

  return {
    type: "unknown",
    message: `I can help you refine your presentation! Try:\n• "Change slide 3 title to Market Analysis"\n• "Add a bar chart with revenue data"\n• "Add a new slide about competitive advantages"\n• "Remove slide 5"\n• "Make it more business-focused"\n• "Add a bullet to slide 2 saying 40% growth YoY"`,
  };
}

// Apply a chat action to the presentation, return the updated presentation
export function applyChatAction(
  action: ChatAction,
  presentation: PresentationData
): PresentationData {
  const slides = [...presentation.slides];

  switch (action.type) {
    case "edit_slide": {
      const idx = action.slideIndex!;
      if (idx < 0 || idx >= slides.length) return presentation;
      const slide = { ...slides[idx] };

      if (action.payload.field === "title") {
        slide.title = action.payload.value;
      } else if (action.payload.field === "content") {
        if (slide.bullets) {
          slide.bullets = [...slide.bullets, action.payload.value];
        } else {
          slide.content = action.payload.value;
        }
      } else {
        // Generic: add as bullet or update content
        if (slide.bullets) {
          slide.bullets = [...slide.bullets, action.payload.value];
        } else {
          slide.content = (slide.content || "") + "\n" + action.payload.value;
        }
      }
      slides[idx] = slide;
      return { ...presentation, slides };
    }

    case "add_slide": {
      const idx = Math.min(action.slideIndex || slides.length - 1, slides.length);
      const newSlide: SlideData = {
        id: `slide-chat-${Date.now()}`,
        type: action.payload.slideType || "content",
        title: action.payload.slideTitle || "New Slide",
        bullets: action.payload.bullets && action.payload.bullets.length > 0
          ? action.payload.bullets
          : ["Add your content here"],
      };
      slides.splice(idx, 0, newSlide);
      return { ...presentation, slides };
    }

    case "remove_slide": {
      const idx = action.slideIndex!;
      if (idx < 0 || idx >= slides.length || slides.length <= 2) return presentation;
      slides.splice(idx, 1);
      return { ...presentation, slides };
    }

    case "change_title": {
      return { ...presentation, title: action.payload.title };
    }

    case "change_template": {
      return { ...presentation, templateId: action.payload.templateId };
    }

    case "change_tone": {
      return {
        ...presentation,
        profile: action.payload.profile,
        keywordMode: action.payload.profile,
      };
    }

    case "add_chart": {
      const idx = Math.min(action.slideIndex || slides.length - 1, slides.length);
      const chartData: ChartData = action.payload.chartData || generateChartForContext(
        action.payload.chartType,
        action.payload.chartTitle,
        presentation.profile
      );

      const chartSlide: SlideData = {
        id: `slide-chart-${Date.now()}`,
        type: "chart" as any,
        title: action.payload.chartTitle,
        chart: chartData,
      } as any;

      slides.splice(idx, 0, chartSlide);
      return { ...presentation, slides };
    }

    case "add_bullet": {
      const idx = action.slideIndex!;
      if (idx < 0 || idx >= slides.length) return presentation;
      const slide = { ...slides[idx] };
      if (slide.bullets) {
        slide.bullets = [...slide.bullets, action.payload.bullet];
      } else {
        slide.bullets = [action.payload.bullet];
      }
      slides[idx] = slide;
      return { ...presentation, slides };
    }

    default:
      return presentation;
  }
}

// ---- Helpers ----

function extractSlideIndex(text: string, total: number): number | null {
  // "slide 3", "slide #3"
  const numMatch = text.match(/slide\s*#?\s*(\d+)/i);
  if (numMatch) {
    const n = parseInt(numMatch[1]) - 1;
    return n >= 0 && n < total ? n : null;
  }
  // "first/second/third/last slide"
  const ordinals: Record<string, number> = {
    first: 0, second: 1, third: 2, fourth: 3, fifth: 4,
    sixth: 5, seventh: 6, eighth: 7, ninth: 8, tenth: 9,
    last: total - 1, "second to last": total - 2,
  };
  for (const [word, idx] of Object.entries(ordinals)) {
    if (text.includes(word) && text.includes("slide")) {
      return idx >= 0 && idx < total ? idx : null;
    }
  }
  return null;
}

function detectChartType(text: string): string {
  if (/pie/i.test(text)) return "pie";
  if (/doughnut|donut/i.test(text)) return "doughnut";
  if (/line/i.test(text)) return "line";
  if (/area/i.test(text)) return "area";
  if (/bar/i.test(text)) return "bar";
  return "bar"; // default
}

function extractChartTitle(text: string): string | null {
  // "add a bar chart titled Revenue Growth"
  const match = text.match(/(?:titled?|called|named|for|showing|of)\s+["']?([^"'\n]{3,50})["']?/i);
  return match ? match[1].trim() : null;
}

function parseChartDataFromMessage(message: string, chartType: string): ChartData | null {
  // Try to parse numbers and labels from the message
  // e.g. "add a bar chart: Q1 100, Q2 150, Q3 200, Q4 180"
  const dataPattern = /(\w[\w\s]*?)\s*[:=]\s*\$?(\d+(?:\.\d+)?)/g;
  const labels: string[] = [];
  const values: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = dataPattern.exec(message)) !== null) {
    labels.push(match[1].trim());
    values.push(parseFloat(match[2]));
  }

  if (labels.length >= 2) {
    return {
      type: chartType as any,
      title: "",
      labels,
      datasets: [{
        label: "Values",
        values,
        color: "", // will be filled by template
      }],
    };
  }

  return null; // will use generated sample data
}

function detectNewSlideType(text: string): SlideData["type"] {
  if (/stats|metric|kpi|number/i.test(text)) return "stats";
  if (/two.column|comparison|vs|versus/i.test(text)) return "two-column";
  if (/process|step|flow|timeline/i.test(text)) return "process";
  if (/quote|testimonial/i.test(text)) return "quote";
  return "content";
}

function extractSlideTitle(text: string): string | null {
  const match = text.match(/(?:titled?|called|named|about|on)\s+["']?([^"'\n]{3,60})["']?/i);
  return match ? match[1].trim() : null;
}

function extractBullets(text: string): string[] {
  // Look for "with bullets: ..." or numbered items
  const bulletMatch = text.match(/(?:with\s+(?:bullets?|points?)?\s*:?\s*)([\s\S]+)$/i);
  if (bulletMatch) {
    return bulletMatch[1]
      .split(/[;\n]|,\s*(?=\w)/)
      .map(b => b.replace(/^\s*[-•\d.)\s]+/, "").trim())
      .filter(b => b.length > 2);
  }
  return [];
}
