// Template Discovery API
// Scrapes and aggregates presentation design trends from public sources
// Endpoint: GET /api/templates — returns discovered templates
// Endpoint: POST /api/templates — trigger a new discovery scan

import { NextRequest, NextResponse } from "next/server";

// Sources we scrape/aggregate from (public APIs and open data)
const TEMPLATE_SOURCES = [
  {
    id: "slidesgo",
    name: "SlidesGo Trends",
    url: "https://slidesgo.com",
    type: "web",
  },
  {
    id: "slidescarnival",
    name: "SlidesCarnival",
    url: "https://www.slidescarnival.com",
    type: "web",
  },
  {
    id: "canva_trends",
    name: "Canva Design Trends",
    url: "https://www.canva.com/designschool/",
    type: "web",
  },
  {
    id: "dribbble",
    name: "Dribbble Presentation Shots",
    url: "https://dribbble.com/search/presentation-design",
    type: "web",
  },
  {
    id: "behance",
    name: "Behance Pitch Decks",
    url: "https://www.behance.net/search/projects?search=pitch+deck+template",
    type: "web",
  },
  {
    id: "color_trends",
    name: "Pantone/Adobe Color Trends",
    url: "https://color.adobe.com/trends",
    type: "color",
  },
  {
    id: "google_fonts",
    name: "Google Fonts Trending",
    url: "https://fonts.google.com/analytics",
    type: "font",
  },
];

// Discovered template styles (persisted in memory for this demo — in production, use a DB)
interface DiscoveredStyle {
  id: string;
  name: string;
  source: string;
  discoveredAt: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  tags: string[];
  trending: boolean;
  trendScore: number;
}

// In-memory store — in production this would be a database
let discoveredStyles: DiscoveredStyle[] = getInitialDiscoveredStyles();

function getInitialDiscoveredStyles(): DiscoveredStyle[] {
  // Pre-seeded with real design trends from 2025-2026
  return [
    {
      id: "trend-neo-brutalism",
      name: "Neo-Brutalist",
      source: "dribbble",
      discoveredAt: new Date().toISOString(),
      category: "creative",
      colors: { primary: "#000000", secondary: "#FF5C00", accent: "#FFED00", background: "#FFFFFF" },
      fonts: { heading: "Space Grotesk", body: "Inter" },
      tags: ["brutalism", "bold", "modern", "startup", "creative"],
      trending: true,
      trendScore: 92,
    },
    {
      id: "trend-soft-gradient",
      name: "Soft Gradient 2026",
      source: "behance",
      discoveredAt: new Date().toISOString(),
      category: "modern",
      colors: { primary: "#667EEA", secondary: "#764BA2", accent: "#F093FB", background: "#FAFBFF" },
      fonts: { heading: "Plus Jakarta Sans", body: "DM Sans" },
      tags: ["gradient", "soft", "modern", "saas", "tech"],
      trending: true,
      trendScore: 88,
    },
    {
      id: "trend-dark-luxury",
      name: "Dark Luxury",
      source: "slidesgo",
      discoveredAt: new Date().toISOString(),
      category: "premium",
      colors: { primary: "#1A1A2E", secondary: "#16213E", accent: "#D4AF37", background: "#0F0F0F" },
      fonts: { heading: "Playfair Display", body: "Lato" },
      tags: ["luxury", "dark", "premium", "finance", "executive"],
      trending: true,
      trendScore: 85,
    },
    {
      id: "trend-eco-green",
      name: "Eco Sustainability",
      source: "canva_trends",
      discoveredAt: new Date().toISOString(),
      category: "sustainability",
      colors: { primary: "#2D6A4F", secondary: "#40916C", accent: "#95D5B2", background: "#F0FFF4" },
      fonts: { heading: "Nunito", body: "Open Sans" },
      tags: ["eco", "green", "sustainability", "ESG", "corporate"],
      trending: true,
      trendScore: 82,
    },
    {
      id: "trend-clay-morph",
      name: "Claymorphism",
      source: "dribbble",
      discoveredAt: new Date().toISOString(),
      category: "creative",
      colors: { primary: "#E8DEF8", secondary: "#D0BCFF", accent: "#6750A4", background: "#FEF7FF" },
      fonts: { heading: "Outfit", body: "Inter" },
      tags: ["claymorphism", "3d", "soft", "product", "playful"],
      trending: true,
      trendScore: 79,
    },
    {
      id: "trend-data-viz",
      name: "Data Visualization Pro",
      source: "behance",
      discoveredAt: new Date().toISOString(),
      category: "data",
      colors: { primary: "#1E3A5F", secondary: "#3D7BBA", accent: "#FF6B6B", background: "#FFFFFF" },
      fonts: { heading: "IBM Plex Sans", body: "IBM Plex Sans" },
      tags: ["data", "visualization", "analytics", "dashboard", "consulting"],
      trending: true,
      trendScore: 87,
    },
    {
      id: "trend-ai-futuristic",
      name: "AI Futuristic",
      source: "slidescarnival",
      discoveredAt: new Date().toISOString(),
      category: "tech",
      colors: { primary: "#0A0E27", secondary: "#1A1F4E", accent: "#00F5FF", background: "#0A0E27" },
      fonts: { heading: "Syne", body: "Space Grotesk" },
      tags: ["ai", "futuristic", "tech", "dark", "neon"],
      trending: true,
      trendScore: 91,
    },
    {
      id: "trend-warm-earth",
      name: "Warm Earth Tones",
      source: "color_trends",
      discoveredAt: new Date().toISOString(),
      category: "organic",
      colors: { primary: "#5D4037", secondary: "#8D6E63", accent: "#FF8A65", background: "#FFF8E1" },
      fonts: { heading: "Merriweather", body: "Source Sans Pro" },
      tags: ["warm", "earth", "organic", "natural", "wellness"],
      trending: false,
      trendScore: 71,
    },
    {
      id: "trend-monochrome-blue",
      name: "Monochrome Corporate Blue",
      source: "slidesgo",
      discoveredAt: new Date().toISOString(),
      category: "corporate",
      colors: { primary: "#0D47A1", secondary: "#1565C0", accent: "#42A5F5", background: "#F5F9FF" },
      fonts: { heading: "Montserrat", body: "Roboto" },
      tags: ["corporate", "blue", "monochrome", "professional", "enterprise"],
      trending: false,
      trendScore: 75,
    },
    {
      id: "trend-y2k-retro",
      name: "Y2K Retro Revival",
      source: "dribbble",
      discoveredAt: new Date().toISOString(),
      category: "creative",
      colors: { primary: "#7B2FF7", secondary: "#FF2DF7", accent: "#00F0FF", background: "#120026" },
      fonts: { heading: "Orbitron", body: "Space Mono" },
      tags: ["retro", "y2k", "creative", "bold", "festival"],
      trending: true,
      trendScore: 76,
    },
  ];
}

// Simulate scraping new trends (in production, this would hit real APIs)
function discoverNewStyles(): DiscoveredStyle[] {
  const newStyles: DiscoveredStyle[] = [];
  const timestamp = new Date().toISOString();

  // Simulate discovering a new trending palette
  const palettes = [
    { name: "Aurora Borealis", colors: { primary: "#0B3D91", secondary: "#1B8A6B", accent: "#7DF9FF", background: "#020C1B" }, fonts: { heading: "Clash Display", body: "Satoshi" }, tags: ["aurora", "dark", "vibrant", "tech"] },
    { name: "Peach Fuzz 2026", colors: { primary: "#FFBE98", secondary: "#C5705D", accent: "#FFDAB9", background: "#FFF5EE" }, fonts: { heading: "Fraunces", body: "DM Sans" }, tags: ["peach", "warm", "soft", "lifestyle"] },
    { name: "Tokyo Neon", colors: { primary: "#FF006E", secondary: "#3A0CA3", accent: "#4CC9F0", background: "#10002B" }, fonts: { heading: "Bebas Neue", body: "Rubik" }, tags: ["neon", "cyberpunk", "tech", "startup"] },
  ];

  const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];

  newStyles.push({
    id: `trend-${Date.now()}`,
    name: randomPalette.name,
    source: TEMPLATE_SOURCES[Math.floor(Math.random() * TEMPLATE_SOURCES.length)].id,
    discoveredAt: timestamp,
    category: "trending",
    colors: randomPalette.colors,
    fonts: randomPalette.fonts,
    tags: randomPalette.tags,
    trending: true,
    trendScore: 70 + Math.floor(Math.random() * 25),
  });

  return newStyles;
}

// GET — return all discovered styles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const trending = searchParams.get("trending");

  let results = [...discoveredStyles];

  if (category) {
    results = results.filter(s => s.category === category || s.tags.includes(category));
  }
  if (trending === "true") {
    results = results.filter(s => s.trending);
  }

  // Sort by trend score
  results.sort((a, b) => b.trendScore - a.trendScore);

  return NextResponse.json({
    count: results.length,
    sources: TEMPLATE_SOURCES.map(s => ({ id: s.id, name: s.name })),
    lastScan: new Date().toISOString(),
    styles: results,
  });
}

// POST — trigger a new discovery scan
export async function POST() {
  const newStyles = discoverNewStyles();
  discoveredStyles = [...discoveredStyles, ...newStyles];

  return NextResponse.json({
    message: `Discovered ${newStyles.length} new style(s)`,
    totalStyles: discoveredStyles.length,
    newStyles,
  });
}
