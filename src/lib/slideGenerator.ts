// Intelligent slide content generator
// Parses user prompts, uploaded files, and chat input into structured slide data

import { SlideTemplate } from "./templates";
import { getKeywordsForProfile, KeywordBank } from "./keywords";
import { ChartData } from "./chartEngine";

export interface SlideData {
  id: string;
  type: 'title' | 'content' | 'two-column' | 'stats' | 'quote' | 'timeline' | 'team' | 'closing' | 'section-break' | 'comparison' | 'process' | 'chart';
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  stats?: { label: string; value: string; description?: string }[];
  leftColumn?: { title: string; bullets: string[] };
  rightColumn?: { title: string; bullets: string[] };
  quote?: { text: string; author: string };
  steps?: { title: string; description: string }[];
  notes?: string;
  chart?: ChartData;
}

export interface PresentationData {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  profile: string;
  templateId: string;
  slides: SlideData[];
  keywordMode: 'tech' | 'business' | 'consulting' | 'academic' | 'vc_pitch' | 'investment_banking' | 'product' | 'generic';
}

// Generate unique slide IDs
let slideCounter = 0;
function genId(): string {
  return `slide-${++slideCounter}-${Date.now()}`;
}

// Detect the best profile from user input
export function detectProfile(input: string): string {
  const lower = input.toLowerCase();
  const profileScores: Record<string, number> = {
    consulting: 0, tech: 0, business: 0, vc_pitch: 0,
    investment_banking: 0, academic: 0, product: 0,
    board: 0, aop: 0, generic: 0,
  };

  // Consulting signals
  if (/consult|mckinsey|bcg|bain|deloitte|advisory|framework|diagnostic|strategy review/i.test(lower)) profileScores.consulting += 5;
  if (/stakeholder|recommendation|assessment|maturity model|operating model/i.test(lower)) profileScores.consulting += 3;

  // Tech signals
  if (/tech|engineer|develop|code|software|api|cloud|devops|machine learning|ai |ml |data science|architecture/i.test(lower)) profileScores.tech += 5;
  if (/deploy|kubernetes|docker|microservice|backend|frontend|fullstack|system design/i.test(lower)) profileScores.tech += 3;

  // VC Pitch signals
  if (/pitch deck|vc |venture|fundrais|seed|series [abc]|investor|startup pitch|elevator pitch/i.test(lower)) profileScores.vc_pitch += 5;
  if (/traction|tam |sam |som |valuation|cap table|product.market fit/i.test(lower)) profileScores.vc_pitch += 3;

  // Investment Banking signals
  if (/investment bank|m&a|ipo|dcf|lbo|leveraged buyout|fairness opinion|capital markets/i.test(lower)) profileScores.investment_banking += 5;
  if (/deal|underwriting|comps|trading multiples|enterprise value|ebitda/i.test(lower)) profileScores.investment_banking += 3;

  // Academic signals
  if (/academic|research|thesis|paper|journal|study|university|phd|dissertation|conference/i.test(lower)) profileScores.academic += 5;
  if (/hypothesis|methodology|literature|empirical|peer review|statistical/i.test(lower)) profileScores.academic += 3;

  // Product signals
  if (/product|feature|launch|roadmap|sprint|user research|ux |ui |design system/i.test(lower)) profileScores.product += 5;
  if (/mvp|a\/b test|persona|user story|backlog|okr/i.test(lower)) profileScores.product += 3;

  // Board signals
  if (/board of directors|board meeting|board deck|board presentation|board review|governance/i.test(lower)) profileScores.board += 5;
  if (/fiduciary|shareholder|board approval|quarterly review|board resolution|dividend|buyback/i.test(lower)) profileScores.board += 3;
  if (/board report|directors meeting|oversight|audit committee|compensation committee/i.test(lower)) profileScores.board += 3;

  // AOP signals
  if (/annual operating plan|aop|annual plan|operating plan|annual budget/i.test(lower)) profileScores.aop += 5;
  if (/budget|headcount plan|departmental plan|scenario planning|revenue target|expense budget/i.test(lower)) profileScores.aop += 3;
  if (/plan vs actual|variance|kpi scorecard|quarterly milestone|functional plan|fiscal year/i.test(lower)) profileScores.aop += 3;

  // Business signals
  if (/business|revenue|roi|market share|quarterly|annual report|corporate|executive/i.test(lower)) profileScores.business += 5;
  if (/kpi|profit|growth|sales|marketing|brand|customer/i.test(lower)) profileScores.business += 3;

  const maxScore = Math.max(...Object.values(profileScores));
  if (maxScore === 0) return "generic";
  return Object.entries(profileScores).find(([, score]) => score === maxScore)?.[0] || "generic";
}

// Parse chat input into structured presentation data
export function generateSlidesFromPrompt(
  prompt: string,
  profile: string,
  templateId: string,
): PresentationData {
  slideCounter = 0;
  const keywordBank = getKeywordsForProfile(profile);

  // Extract title from prompt
  const titleMatch = prompt.match(/(?:title|about|on|for|called|named)\s*[:\-]?\s*["']?([^"'\n.!?]{5,80})["']?/i);
  const title = titleMatch ? titleMatch[1].trim() : extractTitle(prompt, profile);

  // Extract subtitle
  const subtitleMatch = prompt.match(/(?:subtitle|tagline|subheading)\s*[:\-]?\s*["']?([^"'\n.!?]{5,100})["']?/i);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : generateSubtitle(profile, keywordBank);

  // Parse slide content from prompt
  const slides = parsePromptToSlides(prompt, profile, keywordBank);

  return {
    title,
    subtitle,
    author: "Presentation Author",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    profile,
    templateId,
    slides,
    keywordMode: profile as any,
  };
}

function extractTitle(prompt: string, profile: string): string {
  // Try to get a meaningful title from the first sentence
  const firstSentence = prompt.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length > 10 && firstSentence.length < 80) {
    return firstSentence.replace(/^(create|make|build|generate|design)\s+(a|an|the|my)?\s*(presentation|deck|ppt|slides?|pptx)\s*(about|on|for|regarding)?\s*/i, '').trim() || firstSentence;
  }

  const titles: Record<string, string> = {
    consulting: "Strategic Transformation Initiative",
    tech: "Technical Architecture Overview",
    business: "Business Strategy & Growth Plan",
    vc_pitch: "Investor Pitch Deck",
    investment_banking: "Transaction Overview",
    academic: "Research Presentation",
    product: "Product Strategy & Roadmap",
    board: "Board of Directors Meeting",
    aop: "Annual Operating Plan",
    generic: "Professional Presentation",
  };
  return titles[profile] || titles.generic;
}

function generateSubtitle(profile: string, bank: KeywordBank): string {
  const subtitles: Record<string, string> = {
    consulting: "Driving Sustainable Growth Through Strategic Excellence",
    tech: "Building Scalable Systems for the Future",
    business: "Accelerating Value Creation & Market Leadership",
    vc_pitch: "Capturing a Massive Market Opportunity",
    investment_banking: "Confidential Discussion Materials",
    academic: "A Comprehensive Research Analysis",
    product: "Delivering Exceptional User Experiences",
    board: "Quarterly Business Review & Strategic Update",
    aop: "Strategic Priorities, Revenue Targets & Execution Roadmap",
    generic: "A Professional Overview",
  };
  return subtitles[profile] || subtitles.generic;
}

// Intelligent prompt parsing with contextual slide generation
function parsePromptToSlides(prompt: string, profile: string, bank: KeywordBank): SlideData[] {
  const slides: SlideData[] = [];

  // Always start with title slide
  slides.push({
    id: genId(),
    type: 'title',
    title: '{TITLE}', // Placeholder - replaced by caller
    subtitle: '{SUBTITLE}',
  });

  // Check for numbered/bulleted content
  const numberedSections = prompt.match(/(?:^|\n)\s*(?:\d+[.)]\s*|[-•]\s+)(.+)/gm);
  const paragraphs = prompt.split(/\n\n+/).filter(p => p.trim().length > 20);

  // Detect key topics from prompt
  const topics = extractTopics(prompt, profile);

  if (numberedSections && numberedSections.length >= 3) {
    // User provided structured content - create slides from each section
    const sections = numberedSections.map(s => s.replace(/^\s*(?:\d+[.)]\s*|[-•]\s+)/, '').trim());

    // Group into slides of 3-4 bullets
    for (let i = 0; i < sections.length; i += 4) {
      const group = sections.slice(i, i + 4);
      slides.push({
        id: genId(),
        type: 'content',
        title: generateSlideTitleFromContent(group[0], profile),
        bullets: group.map(b => enrichWithKeywords(b, bank)),
      });
    }
  } else if (topics.length > 0) {
    // Generate contextual slides based on detected topics
    topics.forEach(topic => {
      const slideContent = generateSlideForTopic(topic, profile, bank);
      slides.push(slideContent);
    });
  } else {
    // Generate a standard deck structure based on profile
    slides.push(...generateStandardDeck(profile, bank, prompt));
  }

  // Add a closing slide
  slides.push({
    id: genId(),
    type: 'closing',
    title: getClosingTitle(profile),
    subtitle: getClosingSubtitle(profile),
    content: getClosingContent(profile),
  });

  return slides;
}

function extractTopics(prompt: string, profile: string): string[] {
  const topics: string[] = [];
  const lower = prompt.toLowerCase();

  // Common topic patterns
  const topicPatterns = [
    { pattern: /(?:problem|challenge|pain point|issue)/i, topic: 'problem' },
    { pattern: /(?:solution|approach|how we solve|our answer)/i, topic: 'solution' },
    { pattern: /(?:market|opportunity|tam|addressable|industry)/i, topic: 'market' },
    { pattern: /(?:product|feature|capability|offering|platform)/i, topic: 'product' },
    { pattern: /(?:team|founder|leadership|people|talent)/i, topic: 'team' },
    { pattern: /(?:traction|metric|growth|revenue|customer|user)/i, topic: 'traction' },
    { pattern: /(?:financial|projection|forecast|revenue model|business model)/i, topic: 'financials' },
    { pattern: /(?:competitive|competitor|landscape|differentiat)/i, topic: 'competition' },
    { pattern: /(?:roadmap|timeline|milestone|plan|next step)/i, topic: 'roadmap' },
    { pattern: /(?:ask|fund|raise|investment|capital)/i, topic: 'ask' },
    { pattern: /(?:vision|mission|purpose|why we exist)/i, topic: 'vision' },
    { pattern: /(?:strateg|initiative|priority|objective)/i, topic: 'strategy' },
    { pattern: /(?:result|outcome|impact|achievement)/i, topic: 'results' },
    { pattern: /(?:process|methodology|framework|approach)/i, topic: 'process' },
    { pattern: /(?:case study|example|success story|testimonial)/i, topic: 'case_study' },
  ];

  topicPatterns.forEach(({ pattern, topic }) => {
    if (pattern.test(lower)) topics.push(topic);
  });

  return topics.length > 0 ? topics : getDefaultTopics(profile);
}

function getDefaultTopics(profile: string): string[] {
  const defaults: Record<string, string[]> = {
    consulting: ['problem', 'strategy', 'process', 'results', 'roadmap'],
    tech: ['problem', 'solution', 'product', 'process', 'roadmap'],
    business: ['vision', 'strategy', 'market', 'financials', 'roadmap'],
    vc_pitch: ['problem', 'solution', 'market', 'traction', 'team', 'ask'],
    investment_banking: ['market', 'financials', 'competition', 'strategy', 'results'],
    academic: ['problem', 'process', 'results', 'case_study'],
    product: ['problem', 'solution', 'product', 'traction', 'roadmap'],
    board: ['board_executive_summary', 'board_financial_performance', 'board_strategic_update', 'board_risk', 'board_decisions'],
    aop: ['aop_executive_summary', 'aop_prior_year', 'aop_revenue_plan', 'aop_expense_budget', 'aop_departmental', 'aop_kpi_scorecard', 'aop_scenario', 'aop_milestones'],
    generic: ['vision', 'strategy', 'results', 'roadmap'],
  };
  return defaults[profile] || defaults.generic;
}

function generateSlideForTopic(topic: string, profile: string, bank: KeywordBank): SlideData {
  const slideMap: Record<string, () => SlideData> = {
    problem: () => ({
      id: genId(),
      type: 'content',
      title: profile === 'consulting' ? 'Situation Assessment' : profile === 'academic' ? 'Research Problem' : 'The Challenge',
      bullets: [
        enrichWithKeywords("Current market inefficiencies create significant friction and lost value", bank),
        enrichWithKeywords("Existing solutions fail to address the core pain points at scale", bank),
        enrichWithKeywords("Organizations lose substantial time and resources on manual processes", bank),
        enrichWithKeywords("Growing demand signals an urgent need for a transformative approach", bank),
      ],
    }),
    solution: () => ({
      id: genId(),
      type: 'two-column',
      title: profile === 'consulting' ? 'Recommended Approach' : 'Our Solution',
      leftColumn: {
        title: 'Current State',
        bullets: [
          enrichWithKeywords("Fragmented workflows and siloed data", bank),
          enrichWithKeywords("Manual processes with high error rates", bank),
          enrichWithKeywords("Limited visibility and reporting", bank),
        ],
      },
      rightColumn: {
        title: 'Future State',
        bullets: [
          enrichWithKeywords("Unified, intelligent platform", bank),
          enrichWithKeywords("Automated end-to-end processes", bank),
          enrichWithKeywords("Real-time analytics and insights", bank),
        ],
      },
    }),
    market: () => ({
      id: genId(),
      type: 'stats',
      title: profile === 'vc_pitch' ? 'Massive Market Opportunity' : 'Market Overview',
      stats: [
        { label: 'Total Addressable Market', value: '$50B+', description: 'Growing at 25% CAGR' },
        { label: 'Serviceable Market', value: '$12B', description: 'Our initial target segment' },
        { label: 'Annual Growth Rate', value: '35%', description: 'Outpacing industry average' },
      ],
    }),
    product: () => ({
      id: genId(),
      type: 'content',
      title: profile === 'tech' ? 'Technical Architecture & Platform' : 'Product Overview',
      bullets: [
        enrichWithKeywords("End-to-end platform built for scale and performance", bank),
        enrichWithKeywords("Intelligent automation reduces manual effort by 80%", bank),
        enrichWithKeywords("Seamless integration with existing enterprise systems", bank),
        enrichWithKeywords("Advanced analytics providing actionable insights", bank),
        enrichWithKeywords("Enterprise-grade security and compliance framework", bank),
      ],
    }),
    team: () => ({
      id: genId(),
      type: 'content',
      title: 'World-Class Team',
      bullets: [
        enrichWithKeywords("Combined 50+ years of industry expertise", bank),
        enrichWithKeywords("Alumni from leading technology and consulting firms", bank),
        enrichWithKeywords("Proven track record of building & scaling successful ventures", bank),
        enrichWithKeywords("Deep domain expertise and strategic vision", bank),
      ],
    }),
    traction: () => ({
      id: genId(),
      type: 'stats',
      title: profile === 'vc_pitch' ? 'Traction & Growth Metrics' : 'Key Performance Indicators',
      stats: [
        { label: 'Revenue Growth', value: '3x', description: 'Year-over-year growth' },
        { label: 'Customer Retention', value: '95%', description: 'Industry-leading retention' },
        { label: 'Net Promoter Score', value: '72', description: 'Top quartile performance' },
      ],
    }),
    financials: () => ({
      id: genId(),
      type: 'stats',
      title: 'Financial Highlights',
      stats: [
        { label: 'Revenue', value: '$25M', description: 'Projected current year' },
        { label: 'Gross Margin', value: '75%', description: 'Expanding with scale' },
        { label: 'Path to Profitability', value: 'Q4 2026', description: 'Ahead of schedule' },
      ],
    }),
    competition: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Competitive Landscape',
      leftColumn: {
        title: 'Our Differentiators',
        bullets: [
          enrichWithKeywords("Proprietary technology with strong IP moat", bank),
          enrichWithKeywords("10x faster implementation than alternatives", bank),
          enrichWithKeywords("Superior unit economics and scalability", bank),
        ],
      },
      rightColumn: {
        title: 'Market Position',
        bullets: [
          enrichWithKeywords("Category-defining leader in our segment", bank),
          enrichWithKeywords("First-mover advantage with network effects", bank),
          enrichWithKeywords("Strategic partnerships with key players", bank),
        ],
      },
    }),
    roadmap: () => ({
      id: genId(),
      type: 'process',
      title: profile === 'consulting' ? 'Implementation Roadmap' : 'Strategic Roadmap',
      steps: [
        { title: 'Phase 1: Foundation', description: enrichWithKeywords('Core platform launch & initial customer acquisition', bank) },
        { title: 'Phase 2: Growth', description: enrichWithKeywords('Scale operations & expand market presence', bank) },
        { title: 'Phase 3: Expansion', description: enrichWithKeywords('New markets, products & strategic partnerships', bank) },
        { title: 'Phase 4: Leadership', description: enrichWithKeywords('Market dominance & platform ecosystem', bank) },
      ],
    }),
    ask: () => ({
      id: genId(),
      type: 'stats',
      title: 'The Ask',
      stats: [
        { label: 'Raising', value: '$10M', description: 'Series A round' },
        { label: 'Use of Funds', value: '18 months', description: 'Runway to key milestones' },
        { label: 'Target', value: '5x ARR', description: 'Growth in 24 months' },
      ],
    }),
    vision: () => ({
      id: genId(),
      type: 'content',
      title: 'Our Vision',
      bullets: [
        enrichWithKeywords("Transform how organizations approach their most critical challenges", bank),
        enrichWithKeywords("Build the definitive platform for the next generation of enterprises", bank),
        enrichWithKeywords("Empower teams with intelligent tools that amplify human potential", bank),
        enrichWithKeywords("Create sustainable, long-term value for all stakeholders", bank),
      ],
    }),
    strategy: () => ({
      id: genId(),
      type: 'content',
      title: 'Strategic Framework',
      bullets: [
        enrichWithKeywords("Pillar 1: Operational excellence and process optimization", bank),
        enrichWithKeywords("Pillar 2: Customer-centric innovation and value delivery", bank),
        enrichWithKeywords("Pillar 3: Talent development and organizational capability building", bank),
        enrichWithKeywords("Pillar 4: Strategic partnerships and ecosystem expansion", bank),
      ],
    }),
    results: () => ({
      id: genId(),
      type: 'stats',
      title: profile === 'consulting' ? 'Impact Delivered' : 'Results & Impact',
      stats: [
        { label: 'Efficiency Gain', value: '40%', description: 'Process improvement' },
        { label: 'Cost Reduction', value: '$5M', description: 'Annual savings' },
        { label: 'Time to Value', value: '60 days', description: 'Rapid implementation' },
      ],
    }),
    process: () => ({
      id: genId(),
      type: 'process',
      title: profile === 'academic' ? 'Research Methodology' : 'Our Approach',
      steps: [
        { title: 'Discover', description: enrichWithKeywords('Deep-dive analysis and stakeholder interviews', bank) },
        { title: 'Design', description: enrichWithKeywords('Solution architecture and strategic planning', bank) },
        { title: 'Deliver', description: enrichWithKeywords('Phased implementation with measurable milestones', bank) },
        { title: 'Optimize', description: enrichWithKeywords('Continuous improvement and performance tracking', bank) },
      ],
    }),
    case_study: () => ({
      id: genId(),
      type: 'content',
      title: 'Case Study: Proven Success',
      bullets: [
        enrichWithKeywords("Client faced significant operational challenges and market pressure", bank),
        enrichWithKeywords("Implemented comprehensive transformation strategy across key functions", bank),
        enrichWithKeywords("Achieved 40% improvement in operational efficiency within 6 months", bank),
        enrichWithKeywords("Generated $5M+ in annual savings while improving customer satisfaction", bank),
      ],
    }),

    // ========== BOARD OF DIRECTORS SLIDES ==========
    board_executive_summary: () => ({
      id: genId(),
      type: 'content',
      title: 'Executive Summary: Q1 Performance Exceeded Guidance',
      bullets: [
        enrichWithKeywords("Revenue grew 14% YoY to $128M, surpassing Board-approved guidance of $120M", bank),
        enrichWithKeywords("EBITDA margin expanded 220bps to 28.5%, driven by operational efficiency gains", bank),
        enrichWithKeywords("Customer retention held at 94% with NPS improving to 72 (top quartile)", bank),
        enrichWithKeywords("Cash position remains strong at $45M with 18 months of runway at current burn rate", bank),
        enrichWithKeywords("Management recommends accelerating APAC expansion based on pipeline traction", bank),
      ],
    }),
    board_financial_performance: () => ({
      id: genId(),
      type: 'stats',
      title: 'Financial Performance: All Key Metrics Above Plan',
      stats: [
        { label: 'Revenue', value: '$128M', description: '+14% YoY, +7% vs Plan' },
        { label: 'EBITDA Margin', value: '28.5%', description: '+220bps vs prior year' },
        { label: 'Cash Position', value: '$45M', description: '18-month runway' },
      ],
    }),
    board_strategic_update: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Strategic Priorities: On Track Across All Pillars',
      leftColumn: {
        title: 'Delivered This Quarter',
        bullets: [
          enrichWithKeywords("Completed enterprise platform migration ahead of schedule", bank),
          enrichWithKeywords("Secured three strategic partnerships in target verticals", bank),
          enrichWithKeywords("Launched AI-powered analytics module to first 50 customers", bank),
        ],
      },
      rightColumn: {
        title: 'Next Quarter Focus',
        bullets: [
          enrichWithKeywords("Scale APAC go-to-market with regional leadership hires", bank),
          enrichWithKeywords("Expand gross margin through infrastructure optimization", bank),
          enrichWithKeywords("Complete compliance certification for regulated industries", bank),
        ],
      },
    }),
    board_risk: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Risk Assessment: Two Key Risks Identified with Mitigation Plans',
      leftColumn: {
        title: 'Key Risks',
        bullets: [
          enrichWithKeywords("Regulatory changes in EU market may impact Q3 revenue forecast", bank),
          enrichWithKeywords("Talent competition in engineering increasing acquisition cost 15%", bank),
          enrichWithKeywords("Supply chain delays could affect hardware deployment timeline", bank),
        ],
      },
      rightColumn: {
        title: 'Mitigation Actions',
        bullets: [
          enrichWithKeywords("Legal team engaged; compliance roadmap approved and funded", bank),
          enrichWithKeywords("Retention packages deployed; offshore engineering hub on track", bank),
          enrichWithKeywords("Dual-supplier strategy activated; buffer stock secured through Q4", bank),
        ],
      },
    }),
    board_decisions: () => ({
      id: genId(),
      type: 'content',
      title: 'Board Approval Requested: Three Resolutions',
      bullets: [
        enrichWithKeywords("Resolution 1: Approve $8M capital allocation for APAC market expansion", bank),
        enrichWithKeywords("Resolution 2: Ratify revised compensation framework for executive leadership", bank),
        enrichWithKeywords("Resolution 3: Authorize management to explore strategic M&A targets up to $25M", bank),
        enrichWithKeywords("All resolutions include detailed financial analysis in the appendix", bank),
      ],
    }),

    // ========== ANNUAL OPERATING PLAN (AOP) SLIDES ==========
    aop_executive_summary: () => ({
      id: genId(),
      type: 'content',
      title: 'AOP Executive Summary: Path to $200M Revenue',
      bullets: [
        enrichWithKeywords("Annual revenue target of $200M represents 35% YoY growth aligned to three-year strategic plan", bank),
        enrichWithKeywords("Total expense budget of $155M maintains 22.5% operating margin while funding key initiatives", bank),
        enrichWithKeywords("Headcount plan adds 85 FTEs across Sales, Engineering, and Customer Success", bank),
        enrichWithKeywords("Five strategic initiatives prioritized with clear owners, quarterly milestones, and KPI scorecards", bank),
        enrichWithKeywords("Scenario analysis prepared for base, best, and worst case with trigger points defined", bank),
      ],
    }),
    aop_prior_year: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Prior Year Review: Strong Execution, Key Lessons Learned',
      leftColumn: {
        title: 'What Worked',
        bullets: [
          enrichWithKeywords("Product-led growth drove 40% of new revenue at lowest CAC", bank),
          enrichWithKeywords("Enterprise segment exceeded target by 18% through strategic partnerships", bank),
          enrichWithKeywords("Engineering velocity improved 30% after platform modernization", bank),
        ],
      },
      rightColumn: {
        title: 'Lessons & Adjustments',
        bullets: [
          enrichWithKeywords("Mid-market segment underperformed — adjusting ICP and sales motion", bank),
          enrichWithKeywords("Hiring timeline slipped 6 weeks — recruiting capacity doubled for this year", bank),
          enrichWithKeywords("International launch delayed — localization now front-loaded in Q1", bank),
        ],
      },
    }),
    aop_revenue_plan: () => ({
      id: genId(),
      type: 'stats',
      title: 'Revenue Plan: $200M Target with Diversified Growth Engines',
      stats: [
        { label: 'Total Revenue Target', value: '$200M', description: '+35% YoY | $148M prior year' },
        { label: 'New Business', value: '$72M', description: '36% of total | +45% growth' },
        { label: 'Expansion & Renewal', value: '$128M', description: '64% of total | Net retention 115%' },
      ],
    }),
    aop_expense_budget: () => ({
      id: genId(),
      type: 'stats',
      title: 'Expense Budget & P&L: Balanced Investment and Profitability',
      stats: [
        { label: 'Total OpEx', value: '$155M', description: '77.5% of revenue' },
        { label: 'R&D Investment', value: '$52M', description: '26% of revenue | +20 engineers' },
        { label: 'Operating Margin', value: '22.5%', description: '+180bps vs prior year' },
      ],
    }),
    aop_departmental: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Departmental Plans: Aligned to Top Five Strategic Objectives',
      leftColumn: {
        title: 'Revenue Functions',
        bullets: [
          enrichWithKeywords("Sales: $72M new ARR target, 15 new enterprise reps, 3 regional offices", bank),
          enrichWithKeywords("Marketing: $18M budget, 50K MQLs, brand awareness +25% in target segments", bank),
          enrichWithKeywords("Customer Success: Net retention 115%, NPS target 75, 8 new CSMs", bank),
        ],
      },
      rightColumn: {
        title: 'Product & Operations',
        bullets: [
          enrichWithKeywords("Engineering: Platform v3.0 launch Q2, API marketplace Q3, 20 new hires", bank),
          enrichWithKeywords("Product: 4 major releases, AI features GA, mobile app beta by Q4", bank),
          enrichWithKeywords("Operations: SOC 2 Type II, 99.95% uptime SLA, infrastructure cost -12%", bank),
        ],
      },
    }),
    aop_kpi_scorecard: () => ({
      id: genId(),
      type: 'stats',
      title: 'KPI Scorecard: North Star Metrics Reviewed Monthly',
      stats: [
        { label: 'ARR Growth', value: '35%', description: 'Target: $200M | Monthly tracking' },
        { label: 'Net Retention', value: '115%', description: 'Expansion + renewal health' },
        { label: 'CAC Payback', value: '14 mo', description: 'Down from 18 months prior year' },
      ],
    }),
    aop_scenario: () => ({
      id: genId(),
      type: 'two-column',
      title: 'Scenario Planning: Prepared for Multiple Outcomes',
      leftColumn: {
        title: 'Base Case ($200M)',
        bullets: [
          enrichWithKeywords("Current pipeline converts at historical 25% rate", bank),
          enrichWithKeywords("Hiring plan fully executed by end of Q2", bank),
          enrichWithKeywords("No major competitive disruption in core markets", bank),
        ],
      },
      rightColumn: {
        title: 'Downside Case ($170M)',
        bullets: [
          enrichWithKeywords("Pipeline conversion drops to 18% — trigger: reduce discretionary spend $8M", bank),
          enrichWithKeywords("Hiring freeze at Q2 levels — trigger: 2 consecutive months below 80% quota", bank),
          enrichWithKeywords("Market contraction — trigger: pivot to retention and expansion playbook", bank),
        ],
      },
    }),
    aop_milestones: () => ({
      id: genId(),
      type: 'process',
      title: 'Quarterly Milestones: Clear Deliverables with Owners',
      steps: [
        { title: 'Q1: Foundation', description: enrichWithKeywords('Complete hiring wave 1 (40 FTEs). Launch APAC market. Finalize platform v3.0 architecture.', bank) },
        { title: 'Q2: Acceleration', description: enrichWithKeywords('Platform v3.0 GA release. Hit $50M ARR run rate. Close 5 enterprise lighthouse accounts.', bank) },
        { title: 'Q3: Scale', description: enrichWithKeywords('API marketplace launch. International revenue at 20% of total. SOC 2 certification complete.', bank) },
        { title: 'Q4: Optimize', description: enrichWithKeywords('Mobile app beta. Operating margin target 22.5% achieved. Board strategic review for Year +1.', bank) },
      ],
    }),
  };

  return slideMap[topic]?.() || slideMap.strategy?.() || slideMap.vision!();
}

function generateStandardDeck(profile: string, bank: KeywordBank, prompt: string): SlideData[] {
  const topics = getDefaultTopics(profile);
  return topics.map(topic => generateSlideForTopic(topic, profile, bank));
}

function enrichWithKeywords(text: string, bank: KeywordBank): string {
  // The text is already crafted with relevant keywords embedded
  return text;
}

function generateSlideTitleFromContent(content: string, profile: string): string {
  const firstWords = content.split(' ').slice(0, 5).join(' ');
  return firstWords.length > 50 ? firstWords.substring(0, 50) + '...' : firstWords;
}

function getClosingTitle(profile: string): string {
  const titles: Record<string, string> = {
    consulting: "Next Steps & Recommendations",
    tech: "Let's Build the Future",
    business: "Path Forward",
    vc_pitch: "Join Us on This Journey",
    investment_banking: "Summary & Recommendations",
    academic: "Conclusions & Future Research",
    product: "What's Next",
    board: "Resolutions & Next Steps",
    aop: "Execution Begins — Q1 Kickoff",
    generic: "Thank You",
  };
  return titles[profile] || titles.generic;
}

function getClosingSubtitle(profile: string): string {
  const subtitles: Record<string, string> = {
    consulting: "Ready to drive transformation together",
    tech: "Scaling innovation with cutting-edge technology",
    business: "Accelerating growth and value creation",
    vc_pitch: "Let's discuss how we can partner",
    investment_banking: "We look forward to your feedback",
    academic: "Thank you for your attention",
    product: "Shipping the future of user experience",
    board: "Management requests Board feedback and approval on resolutions presented",
    aop: "Monthly KPI review cadence begins January — first leadership check-in Jan 31",
    generic: "Questions & Discussion",
  };
  return subtitles[profile] || subtitles.generic;
}

function getClosingContent(profile: string): string {
  return "Contact: your.email@company.com";
}

// Parse uploaded file content into slides
export function generateSlidesFromFileContent(
  content: string,
  fileName: string,
  profile: string,
  templateId: string,
): PresentationData {
  // Treat file content as a rich prompt
  const cleanContent = content.replace(/\r\n/g, '\n').trim();
  return generateSlidesFromPrompt(cleanContent, profile, templateId);
}
