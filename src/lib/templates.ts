// Professional presentation templates sourced from industry standards
// Inspired by: McKinsey Blue, BCG Green, Bain Red, YC Orange, a16z, Sequoia,
// Google Material, Apple Keynote, TED, Harvard Business School, Stanford d.school

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  colors: TemplateColors;
  fonts: TemplateFonts;
  slideTypes: SlideTypeConfig[];
  thumbnailGradient: string;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
  highlight: string;
  gradient?: [string, string];
}

export interface TemplateFonts {
  heading: string;
  body: string;
  accent: string;
}

export interface SlideTypeConfig {
  type: 'title' | 'content' | 'two-column' | 'image-text' | 'stats' | 'quote' | 'timeline' | 'team' | 'closing' | 'section-break' | 'comparison' | 'process';
  layout: string;
}

export const TEMPLATES: SlideTemplate[] = [
  // 1. McKinsey Executive Blue
  {
    id: "mckinsey-blue",
    name: "Executive Strategy",
    description: "Clean, authoritative design inspired by top-tier consulting firms. Perfect for board presentations and strategic reviews.",
    category: "consulting",
    tags: ["consulting", "strategy", "executive", "professional", "corporate"],
    colors: {
      primary: "#003366",
      secondary: "#0066CC",
      accent: "#FF6600",
      background: "#FFFFFF",
      text: "#1A1A2E",
      textLight: "#6B7280",
      highlight: "#003366",
      gradient: ["#003366", "#005599"],
    },
    fonts: { heading: "Georgia", body: "Arial", accent: "Arial" },
    slideTypes: [
      { type: "title", layout: "centered-bold" },
      { type: "content", layout: "header-body-footer" },
      { type: "two-column", layout: "equal-split" },
      { type: "stats", layout: "three-kpi" },
      { type: "process", layout: "horizontal-steps" },
      { type: "closing", layout: "centered-minimal" },
    ],
    thumbnailGradient: "from-blue-900 to-blue-700",
  },

  // 2. Startup Pitch (YC/Sequoia style)
  {
    id: "startup-pitch",
    name: "Startup Pitch Deck",
    description: "Bold, high-energy pitch deck format. Designed for VC presentations with clear metrics and traction slides.",
    category: "vc_pitch",
    tags: ["startup", "pitch", "vc", "fundraising", "investors"],
    colors: {
      primary: "#FF6B35",
      secondary: "#1E3A5F",
      accent: "#00C49F",
      background: "#FFFFFF",
      text: "#1E293B",
      textLight: "#64748B",
      highlight: "#FF6B35",
      gradient: ["#FF6B35", "#FF8C42"],
    },
    fonts: { heading: "Helvetica", body: "Helvetica", accent: "Helvetica" },
    slideTypes: [
      { type: "title", layout: "hero-statement" },
      { type: "content", layout: "problem-solution" },
      { type: "stats", layout: "metric-highlight" },
      { type: "two-column", layout: "before-after" },
      { type: "timeline", layout: "roadmap" },
      { type: "closing", layout: "ask-slide" },
    ],
    thumbnailGradient: "from-orange-600 to-amber-500",
  },

  // 3. Tech Dark Mode
  {
    id: "tech-dark",
    name: "Tech Dark Mode",
    description: "Sleek dark theme for engineering and product presentations. Code-friendly with monospace accents.",
    category: "tech",
    tags: ["tech", "engineering", "dark", "modern", "developer"],
    colors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#22D3EE",
      background: "#0F172A",
      text: "#F1F5F9",
      textLight: "#94A3B8",
      highlight: "#22D3EE",
      gradient: ["#6366F1", "#8B5CF6"],
    },
    fonts: { heading: "SF Pro Display", body: "SF Pro Text", accent: "SF Mono" },
    slideTypes: [
      { type: "title", layout: "gradient-hero" },
      { type: "content", layout: "dark-card" },
      { type: "two-column", layout: "code-explanation" },
      { type: "stats", layout: "neon-metrics" },
      { type: "process", layout: "tech-pipeline" },
      { type: "closing", layout: "gradient-cta" },
    ],
    thumbnailGradient: "from-indigo-600 to-purple-600",
  },

  // 4. BCG Green Consulting
  {
    id: "bcg-green",
    name: "Strategic Advisory",
    description: "Professional green-accented template ideal for management consulting and advisory presentations.",
    category: "consulting",
    tags: ["consulting", "advisory", "professional", "green", "corporate"],
    colors: {
      primary: "#006B3F",
      secondary: "#00875A",
      accent: "#FFB800",
      background: "#FFFFFF",
      text: "#1A1A2E",
      textLight: "#6B7280",
      highlight: "#006B3F",
      gradient: ["#006B3F", "#00875A"],
    },
    fonts: { heading: "Georgia", body: "Calibri", accent: "Calibri" },
    slideTypes: [
      { type: "title", layout: "executive-title" },
      { type: "content", layout: "structured-argument" },
      { type: "comparison", layout: "matrix-view" },
      { type: "stats", layout: "dashboard" },
      { type: "process", layout: "waterfall" },
      { type: "closing", layout: "next-steps" },
    ],
    thumbnailGradient: "from-emerald-800 to-emerald-600",
  },

  // 5. Investment Banking
  {
    id: "ib-classic",
    name: "Investment Banking",
    description: "Formal, data-heavy template for M&A, IPO roadshows, and financial advisory presentations.",
    category: "investment_banking",
    tags: ["finance", "investment banking", "M&A", "IPO", "formal"],
    colors: {
      primary: "#1B365D",
      secondary: "#4A7C9B",
      accent: "#C5A572",
      background: "#FFFFFF",
      text: "#1B365D",
      textLight: "#6B7280",
      highlight: "#C5A572",
      gradient: ["#1B365D", "#2D5B87"],
    },
    fonts: { heading: "Times New Roman", body: "Calibri", accent: "Calibri" },
    slideTypes: [
      { type: "title", layout: "formal-centered" },
      { type: "content", layout: "data-dense" },
      { type: "stats", layout: "financial-summary" },
      { type: "comparison", layout: "football-field" },
      { type: "two-column", layout: "deal-structure" },
      { type: "closing", layout: "disclaimer" },
    ],
    thumbnailGradient: "from-slate-800 to-blue-900",
  },

  // 6. Google Material
  {
    id: "google-material",
    name: "Material Design",
    description: "Clean, colorful material design template. Great for product launches and tech company presentations.",
    category: "tech",
    tags: ["google", "material", "colorful", "product", "modern"],
    colors: {
      primary: "#4285F4",
      secondary: "#34A853",
      accent: "#FBBC05",
      background: "#FFFFFF",
      text: "#202124",
      textLight: "#5F6368",
      highlight: "#4285F4",
      gradient: ["#4285F4", "#34A853"],
    },
    fonts: { heading: "Product Sans", body: "Roboto", accent: "Roboto" },
    slideTypes: [
      { type: "title", layout: "material-hero" },
      { type: "content", layout: "card-based" },
      { type: "stats", layout: "colorful-metrics" },
      { type: "two-column", layout: "feature-showcase" },
      { type: "timeline", layout: "material-timeline" },
      { type: "closing", layout: "material-cta" },
    ],
    thumbnailGradient: "from-blue-500 to-green-500",
  },

  // 7. Academic Research
  {
    id: "academic",
    name: "Research & Academic",
    description: "Clean, scholarly template for research presentations, thesis defenses, and academic conferences.",
    category: "academic",
    tags: ["academic", "research", "university", "thesis", "scholarly"],
    colors: {
      primary: "#8B1A1A",
      secondary: "#2F4F4F",
      accent: "#DAA520",
      background: "#FAFAFA",
      text: "#1A1A1A",
      textLight: "#555555",
      highlight: "#8B1A1A",
      gradient: ["#8B1A1A", "#A52A2A"],
    },
    fonts: { heading: "Garamond", body: "Palatino", accent: "Palatino" },
    slideTypes: [
      { type: "title", layout: "academic-title" },
      { type: "content", layout: "research-body" },
      { type: "two-column", layout: "methodology" },
      { type: "stats", layout: "results-table" },
      { type: "quote", layout: "citation" },
      { type: "closing", layout: "references" },
    ],
    thumbnailGradient: "from-red-900 to-red-700",
  },

  // 8. Product Launch
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Dynamic, visually striking template for product launches, demos, and feature announcements.",
    category: "product",
    tags: ["product", "launch", "demo", "feature", "announcement"],
    colors: {
      primary: "#7C3AED",
      secondary: "#EC4899",
      accent: "#10B981",
      background: "#FFFFFF",
      text: "#1F2937",
      textLight: "#6B7280",
      highlight: "#7C3AED",
      gradient: ["#7C3AED", "#EC4899"],
    },
    fonts: { heading: "Inter", body: "Inter", accent: "Inter" },
    slideTypes: [
      { type: "title", layout: "gradient-splash" },
      { type: "content", layout: "feature-grid" },
      { type: "stats", layout: "impact-numbers" },
      { type: "two-column", layout: "demo-layout" },
      { type: "comparison", layout: "vs-layout" },
      { type: "closing", layout: "launch-cta" },
    ],
    thumbnailGradient: "from-violet-600 to-pink-500",
  },

  // 9. Corporate Elegant
  {
    id: "corporate-elegant",
    name: "Corporate Elegant",
    description: "Sophisticated, premium corporate template for quarterly reviews, annual reports, and executive briefings.",
    category: "business",
    tags: ["corporate", "elegant", "premium", "executive", "annual report"],
    colors: {
      primary: "#2D3748",
      secondary: "#4A5568",
      accent: "#D69E2E",
      background: "#FFFFFF",
      text: "#1A202C",
      textLight: "#718096",
      highlight: "#D69E2E",
      gradient: ["#2D3748", "#4A5568"],
    },
    fonts: { heading: "Playfair Display", body: "Source Sans Pro", accent: "Source Sans Pro" },
    slideTypes: [
      { type: "title", layout: "luxury-title" },
      { type: "content", layout: "editorial" },
      { type: "stats", layout: "gold-accent-kpi" },
      { type: "two-column", layout: "magazine-layout" },
      { type: "quote", layout: "pull-quote" },
      { type: "closing", layout: "elegant-close" },
    ],
    thumbnailGradient: "from-gray-800 to-gray-600",
  },

  // 10. Bain Red Strategy
  {
    id: "bain-red",
    name: "Results-Driven Strategy",
    description: "Bold red-accented template for impact-driven consulting presentations and transformation updates.",
    category: "consulting",
    tags: ["consulting", "strategy", "bold", "results", "transformation"],
    colors: {
      primary: "#CC0000",
      secondary: "#333333",
      accent: "#FF4444",
      background: "#FFFFFF",
      text: "#1A1A1A",
      textLight: "#666666",
      highlight: "#CC0000",
      gradient: ["#CC0000", "#990000"],
    },
    fonts: { heading: "Helvetica Neue", body: "Helvetica", accent: "Helvetica" },
    slideTypes: [
      { type: "title", layout: "impact-title" },
      { type: "content", layout: "action-oriented" },
      { type: "stats", layout: "red-metrics" },
      { type: "comparison", layout: "before-after-impact" },
      { type: "process", layout: "transformation-journey" },
      { type: "closing", layout: "call-to-action" },
    ],
    thumbnailGradient: "from-red-700 to-red-500",
  },

  // 11. Minimal White
  {
    id: "minimal-white",
    name: "Minimal Clean",
    description: "Ultra-clean minimalist design. Let your content speak with generous whitespace and subtle accents.",
    category: "generic",
    tags: ["minimal", "clean", "white", "simple", "modern"],
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#3B82F6",
      background: "#FFFFFF",
      text: "#111827",
      textLight: "#9CA3AF",
      highlight: "#3B82F6",
      gradient: ["#111827", "#374151"],
    },
    fonts: { heading: "Inter", body: "Inter", accent: "Inter" },
    slideTypes: [
      { type: "title", layout: "minimal-center" },
      { type: "content", layout: "clean-body" },
      { type: "stats", layout: "subtle-numbers" },
      { type: "two-column", layout: "balanced" },
      { type: "quote", layout: "large-quote" },
      { type: "closing", layout: "simple-end" },
    ],
    thumbnailGradient: "from-gray-200 to-white",
  },

  // 12. VC Elevator Pitch
  {
    id: "vc-elevator",
    name: "Elevator Pitch",
    description: "Concise, high-impact pitch template designed for 3-5 minute VC elevator pitches. Every slide counts.",
    category: "vc_pitch",
    tags: ["elevator pitch", "vc", "concise", "startup", "funding"],
    colors: {
      primary: "#0D1117",
      secondary: "#21262D",
      accent: "#58A6FF",
      background: "#0D1117",
      text: "#F0F6FC",
      textLight: "#8B949E",
      highlight: "#58A6FF",
      gradient: ["#58A6FF", "#BC8CFF"],
    },
    fonts: { heading: "Inter", body: "Inter", accent: "JetBrains Mono" },
    slideTypes: [
      { type: "title", layout: "bold-statement" },
      { type: "content", layout: "single-point" },
      { type: "stats", layout: "big-number" },
      { type: "two-column", layout: "problem-solution-split" },
      { type: "team", layout: "founder-grid" },
      { type: "closing", layout: "the-ask" },
    ],
    thumbnailGradient: "from-gray-900 to-blue-900",
  },

  // 13. Creative Agency
  {
    id: "creative-agency",
    name: "Creative Showcase",
    description: "Bold, expressive template for creative agencies, design portfolios, and brand presentations.",
    category: "generic",
    tags: ["creative", "agency", "design", "bold", "artistic"],
    colors: {
      primary: "#F43F5E",
      secondary: "#8B5CF6",
      accent: "#FBBF24",
      background: "#18181B",
      text: "#FAFAFA",
      textLight: "#A1A1AA",
      highlight: "#F43F5E",
      gradient: ["#F43F5E", "#8B5CF6"],
    },
    fonts: { heading: "Poppins", body: "Inter", accent: "Space Mono" },
    slideTypes: [
      { type: "title", layout: "creative-splash" },
      { type: "content", layout: "asymmetric" },
      { type: "image-text", layout: "full-bleed" },
      { type: "stats", layout: "playful-numbers" },
      { type: "two-column", layout: "creative-split" },
      { type: "closing", layout: "creative-end" },
    ],
    thumbnailGradient: "from-rose-500 to-violet-600",
  },

  // 14. Healthcare / Pharma
  {
    id: "healthcare",
    name: "Healthcare Professional",
    description: "Trust-building template for healthcare, pharma, and biotech presentations with clinical precision.",
    category: "business",
    tags: ["healthcare", "pharma", "medical", "biotech", "clinical"],
    colors: {
      primary: "#0891B2",
      secondary: "#065F73",
      accent: "#06B6D4",
      background: "#F0FDFA",
      text: "#134E4A",
      textLight: "#5EEAD4",
      highlight: "#0891B2",
      gradient: ["#0891B2", "#06B6D4"],
    },
    fonts: { heading: "Nunito Sans", body: "Open Sans", accent: "Open Sans" },
    slideTypes: [
      { type: "title", layout: "clean-professional" },
      { type: "content", layout: "evidence-based" },
      { type: "stats", layout: "clinical-data" },
      { type: "two-column", layout: "before-after-clinical" },
      { type: "process", layout: "treatment-pathway" },
      { type: "closing", layout: "professional-close" },
    ],
    thumbnailGradient: "from-cyan-700 to-teal-500",
  },

  // 15. Gradient Modern
  {
    id: "gradient-modern",
    name: "Gradient Modern",
    description: "Eye-catching gradient-heavy modern template. Perfect for SaaS demos, tech events, and forward-thinking brands.",
    category: "tech",
    tags: ["gradient", "modern", "saas", "tech", "vibrant"],
    colors: {
      primary: "#6366F1",
      secondary: "#A855F7",
      accent: "#EC4899",
      background: "#0F0F23",
      text: "#E2E8F0",
      textLight: "#94A3B8",
      highlight: "#A855F7",
      gradient: ["#6366F1", "#EC4899"],
    },
    fonts: { heading: "Plus Jakarta Sans", body: "Inter", accent: "Inter" },
    slideTypes: [
      { type: "title", layout: "gradient-immersive" },
      { type: "content", layout: "glass-card" },
      { type: "stats", layout: "gradient-metrics" },
      { type: "two-column", layout: "glass-split" },
      { type: "timeline", layout: "gradient-timeline" },
      { type: "closing", layout: "gradient-finale" },
    ],
    thumbnailGradient: "from-indigo-500 via-purple-500 to-pink-500",
  },
];

export function getTemplatesForCategory(category: string): SlideTemplate[] {
  if (category === "all") return TEMPLATES;
  return TEMPLATES.filter(t => t.category === category || t.tags.includes(category));
}

export function getTemplateById(id: string): SlideTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getRecommendedTemplates(profile: string): SlideTemplate[] {
  const categoryMap: Record<string, string[]> = {
    consulting: ["consulting", "corporate", "strategy"],
    tech: ["tech", "modern", "developer", "saas"],
    business: ["business", "corporate", "professional", "executive"],
    vc_pitch: ["vc_pitch", "startup", "pitch", "funding"],
    investment_banking: ["investment_banking", "finance", "formal"],
    academic: ["academic", "research", "scholarly"],
    product: ["product", "launch", "demo"],
    generic: ["generic", "minimal", "clean"],
  };

  const tags = categoryMap[profile] || categoryMap.generic;
  return TEMPLATES.filter(t => tags.some(tag => t.category === tag || t.tags.includes(tag)));
}
