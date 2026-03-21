// Comprehensive keyword banks sourced from industry-standard presentations
// McKinsey, BCG, Bain consulting decks; YC/a16z pitch decks; Google/Meta tech talks

export interface KeywordBank {
  category: string;
  keywords: string[];
  powerWords: string[];
  phrases: string[];
}

export const KEYWORD_BANKS: Record<string, KeywordBank> = {
  business: {
    category: "Business & Strategy",
    keywords: [
      "Revenue", "ROI", "EBITDA", "Market Share", "Scalability", "Synergy",
      "Value Proposition", "Stakeholder", "KPI", "Bottom Line", "Profit Margin",
      "Cash Flow", "Acquisition", "Diversification", "Benchmarking",
      "Cost Optimization", "Go-to-Market", "TAM", "SAM", "SOM",
      "Unit Economics", "Burn Rate", "Runway", "ARR", "MRR",
      "Customer Lifetime Value", "CAC", "Churn Rate", "NPS",
      "Competitive Advantage", "Moat", "Blue Ocean", "Market Penetration",
      "Growth Hacking", "Brand Equity", "Supply Chain", "Logistics",
      "Procurement", "Working Capital", "Leverage", "Yield",
      "Portfolio", "Asset Allocation", "Risk Management", "Compliance",
      "Due Diligence", "Valuation", "Multiple", "IRR", "NPV",
    ],
    powerWords: [
      "Transform", "Accelerate", "Optimize", "Maximize", "Deliver",
      "Drive", "Capture", "Leverage", "Unlock", "Scale",
      "Disrupt", "Innovate", "Pioneer", "Dominate", "Outperform",
      "Streamline", "Monetize", "Capitalize", "Amplify", "Execute",
    ],
    phrases: [
      "Driving sustainable growth",
      "Capturing market opportunity",
      "Delivering shareholder value",
      "Building competitive moats",
      "Optimizing operational efficiency",
      "Accelerating path to profitability",
      "Expanding addressable market",
      "Creating strategic partnerships",
      "Enhancing customer experience",
      "Maximizing return on investment",
    ],
  },

  tech: {
    category: "Technology & Engineering",
    keywords: [
      "API", "Microservices", "Cloud-Native", "Kubernetes", "CI/CD",
      "Machine Learning", "Deep Learning", "Neural Networks", "NLP",
      "Computer Vision", "Edge Computing", "Serverless", "DevOps",
      "Infrastructure", "Scalable Architecture", "Distributed Systems",
      "Blockchain", "IoT", "5G", "Quantum Computing",
      "Data Pipeline", "ETL", "Real-time Processing", "Low Latency",
      "High Availability", "Fault Tolerance", "Load Balancing",
      "Containerization", "Orchestration", "Observability",
      "GraphQL", "REST", "gRPC", "WebSocket", "Event-Driven",
      "Terraform", "Infrastructure as Code", "Zero Trust",
      "Encryption", "Authentication", "OAuth", "SSO",
      "React", "Node.js", "Python", "Rust", "Go",
      "PostgreSQL", "Redis", "Kafka", "Elasticsearch",
      "TensorFlow", "PyTorch", "LLM", "GPT", "Transformer",
    ],
    powerWords: [
      "Architect", "Engineer", "Deploy", "Automate", "Integrate",
      "Refactor", "Optimize", "Debug", "Iterate", "Ship",
      "Build", "Scale", "Monitor", "Secure", "Migrate",
      "Parallelize", "Benchmark", "Profile", "Containerize", "Orchestrate",
    ],
    phrases: [
      "Built for scale from day one",
      "Zero-downtime deployment pipeline",
      "End-to-end encrypted architecture",
      "AI-powered intelligent automation",
      "Real-time data processing at scale",
      "Cloud-native microservices architecture",
      "Developer-first platform approach",
      "Cutting-edge machine learning models",
      "Enterprise-grade security posture",
      "Infinitely scalable infrastructure",
    ],
  },

  consulting: {
    category: "Consulting & Advisory",
    keywords: [
      "Framework", "Methodology", "Assessment", "Diagnostic",
      "Recommendation", "Implementation", "Transformation", "Maturity Model",
      "Best Practice", "Gap Analysis", "Root Cause", "SWOT",
      "Porter's Five Forces", "Value Chain", "Core Competency",
      "Change Management", "Organizational Design", "Operating Model",
      "Governance", "Stakeholder Alignment", "Capability Building",
      "Process Optimization", "Lean", "Six Sigma", "Agile",
      "Digital Transformation", "Customer Journey", "Persona",
      "Segmentation", "Prioritization Matrix", "Decision Tree",
      "Scenario Planning", "Risk Mitigation", "Roadmap",
      "Quick Wins", "Low-Hanging Fruit", "80/20 Rule",
      "Total Cost of Ownership", "Build vs Buy", "Make vs Break",
    ],
    powerWords: [
      "Diagnose", "Recommend", "Implement", "Transform", "Align",
      "Prioritize", "Assess", "Benchmark", "Restructure", "Synthesize",
      "Evaluate", "Facilitate", "Advise", "Strategize", "Operationalize",
    ],
    phrases: [
      "Data-driven strategic recommendations",
      "Comprehensive diagnostic assessment",
      "Phased implementation roadmap",
      "Cross-functional alignment workshop",
      "Measurable impact within 90 days",
      "Industry-leading best practices",
      "Tailored transformation strategy",
      "Sustainable organizational change",
      "Evidence-based decision framework",
      "End-to-end value chain optimization",
    ],
  },

  vc_pitch: {
    category: "VC & Investor Pitch",
    keywords: [
      "Series A", "Series B", "Seed Round", "Pre-Seed", "Valuation",
      "Cap Table", "Term Sheet", "Dilution", "Equity", "Convertible Note",
      "SAFE", "Product-Market Fit", "Traction", "Hockey Stick Growth",
      "Network Effects", "Viral Coefficient", "Flywheel", "Moat",
      "TAM", "SAM", "SOM", "Addressable Market", "Market Size",
      "GMV", "Take Rate", "Gross Margin", "Contribution Margin",
      "LTV:CAC Ratio", "Payback Period", "Cohort Analysis",
      "Retention Curve", "Monthly Active Users", "Daily Active Users",
      "Engagement Rate", "Conversion Funnel", "North Star Metric",
      "Exit Strategy", "IPO", "M&A", "Strategic Acquirer",
    ],
    powerWords: [
      "Disrupt", "Revolutionize", "10x", "Exponential", "Explosive",
      "Unprecedented", "First-mover", "Category-defining", "Breakout",
      "Moonshot", "Paradigm-shifting", "Game-changing", "Trailblazing",
    ],
    phrases: [
      "$1B+ addressable market opportunity",
      "10x improvement over existing solutions",
      "Proven product-market fit with strong retention",
      "Capital-efficient growth engine",
      "World-class founding team",
      "Clear path to $100M ARR",
      "Strong network effects and viral growth",
      "Category-defining platform play",
      "Massive secular tailwinds",
      "De-risked business model with proven unit economics",
    ],
  },

  investment_banking: {
    category: "Investment Banking",
    keywords: [
      "M&A", "IPO", "DCF", "Comparable Analysis", "Precedent Transactions",
      "Enterprise Value", "Equity Value", "WACC", "Terminal Value",
      "Accretion/Dilution", "Synergies", "Fairness Opinion",
      "LBO", "Leveraged Buyout", "Debt Capacity", "Credit Rating",
      "Capital Structure", "Refinancing", "Bond Issuance",
      "Underwriting", "Book Building", "Roadshow", "Allocation",
      "Free Cash Flow", "EBITDA Multiple", "Revenue Multiple",
      "Comps", "Trading Multiples", "Football Field",
      "Management Buyout", "Carve-out", "Spin-off", "Divestiture",
      "Strategic Rationale", "Value Creation", "Post-Merger Integration",
    ],
    powerWords: [
      "Execute", "Structure", "Optimize", "Negotiate", "Close",
      "Underwrite", "Advise", "Value", "Restructure", "Capitalize",
    ],
    phrases: [
      "Compelling strategic rationale",
      "Significant synergy potential",
      "Attractive valuation entry point",
      "Accretive to earnings per share",
      "Strong cash flow generation capability",
      "Premium to current trading levels",
      "Value-maximizing transaction structure",
      "Robust capital markets positioning",
      "Best-in-class financial profile",
      "Transformational growth opportunity",
    ],
  },

  academic: {
    category: "Academic & Research",
    keywords: [
      "Hypothesis", "Methodology", "Literature Review", "Peer Review",
      "Empirical", "Quantitative", "Qualitative", "Statistical Significance",
      "Control Group", "Variable", "Correlation", "Causation",
      "Abstract", "Citation", "Meta-Analysis", "Systematic Review",
      "Research Gap", "Contribution", "Framework", "Taxonomy",
      "Longitudinal Study", "Cross-Sectional", "Experimental Design",
      "Sample Size", "Confidence Interval", "P-Value", "Effect Size",
      "Regression Analysis", "ANOVA", "Chi-Square", "T-Test",
    ],
    powerWords: [
      "Investigate", "Demonstrate", "Validate", "Examine", "Analyze",
      "Propose", "Establish", "Reveal", "Contribute", "Advance",
    ],
    phrases: [
      "Novel contribution to the field",
      "Statistically significant findings",
      "Rigorous methodological approach",
      "Comprehensive literature review",
      "Implications for future research",
      "Evidence-based conclusions",
      "Robust experimental design",
      "Peer-reviewed and validated",
      "Cross-disciplinary applications",
      "Paradigm-shifting discovery",
    ],
  },

  product: {
    category: "Product Management",
    keywords: [
      "User Story", "Sprint", "Backlog", "MVP", "Feature Prioritization",
      "A/B Testing", "User Research", "Persona", "Journey Map",
      "Wireframe", "Prototype", "Usability Testing", "Accessibility",
      "Conversion Rate", "Engagement", "Retention", "Activation",
      "Onboarding", "Feature Flag", "Release", "Rollout",
      "OKR", "North Star Metric", "AARRR", "Pirate Metrics",
      "Product-Led Growth", "Self-Serve", "Freemium", "Upsell",
      "Cross-Sell", "User Segmentation", "Behavioral Analytics",
      "Heatmap", "Session Recording", "NPS", "CSAT",
    ],
    powerWords: [
      "Launch", "Iterate", "Validate", "Ship", "Delight",
      "Engage", "Retain", "Convert", "Personalize", "Experiment",
    ],
    phrases: [
      "User-centered design approach",
      "Data-informed product decisions",
      "Rapid iteration and validation",
      "Delightful user experience",
      "Product-led growth strategy",
      "Feature adoption and engagement",
      "Scalable product architecture",
      "Cross-platform consistency",
      "Accessible and inclusive design",
      "Continuous discovery and delivery",
    ],
  },

  board: {
    category: "Board of Directors",
    keywords: [
      "Governance", "Fiduciary Duty", "Board Resolution", "Shareholder Value",
      "Quarterly Performance", "YoY Growth", "EBITDA", "Cash Position",
      "Revenue", "Gross Margin", "Operating Margin", "Net Income",
      "Burn Rate", "Runway", "Working Capital", "Capital Allocation",
      "Risk Appetite", "Compliance", "Regulatory", "Audit",
      "Executive Summary", "Strategic Priority", "KPI", "North Star Metric",
      "Market Share", "Competitive Position", "TAM", "Headcount",
      "Customer Retention", "Churn", "NPS", "ARR", "MRR",
      "Pipeline", "Backlog", "Forecast", "Guidance",
      "M&A", "Divestiture", "Capital Expenditure", "ROIC",
      "Dividend", "Buyback", "Debt-to-Equity", "Credit Rating",
      "ESG", "Sustainability", "Board Approval", "Vote",
    ],
    powerWords: [
      "Recommend", "Approve", "Ratify", "Endorse", "Authorize",
      "Mitigate", "Oversee", "Govern", "Steward", "Safeguard",
      "Accelerate", "De-risk", "Prioritize", "Mandate", "Certify",
    ],
    phrases: [
      "Board approval requested for the following resolution",
      "Q-o-Q performance exceeded guidance by 12%",
      "Management recommends the following strategic action",
      "Key risk identified with mitigation plan in place",
      "Forward-looking priorities for the next quarter",
      "Shareholder value creation remains the primary objective",
      "Governance framework updated to reflect new regulations",
      "Executive team confident in full-year guidance",
      "Capital allocation optimized for long-term returns",
      "Transparent reporting on all material developments",
    ],
  },

  aop: {
    category: "Annual Operating Plan",
    keywords: [
      "Annual Plan", "Operating Plan", "Budget", "Forecast",
      "Revenue Target", "Expense Budget", "P&L", "Gross Margin",
      "Contribution Margin", "Headcount Plan", "Hiring Plan",
      "Departmental Plan", "Functional Plan", "Cross-Functional",
      "Strategic Objective", "OKR", "KPI", "Scorecard",
      "Quarterly Milestone", "Monthly Cadence", "Check-in",
      "Base Case", "Best Case", "Worst Case", "Scenario Planning",
      "Trigger Point", "Contingency", "Risk Assessment",
      "Revenue Bridge", "Waterfall", "Year-over-Year",
      "Plan vs Actual", "Variance Analysis", "RAG Status",
      "Traffic Light", "Green", "Amber", "Red",
      "Initiative", "Project", "Owner", "Deadline",
      "CAGR", "Run Rate", "Capacity Planning", "Unit Economics",
      "Customer Acquisition Cost", "LTV", "Payback Period",
      "Organic Growth", "Inorganic Growth", "Market Expansion",
    ],
    powerWords: [
      "Target", "Commit", "Deliver", "Achieve", "Execute",
      "Allocate", "Optimize", "Forecast", "Plan", "Measure",
      "Track", "Own", "Align", "Prioritize", "Invest",
    ],
    phrases: [
      "Annual targets aligned to three-year strategic plan",
      "Revenue bridge from current run rate to FY target",
      "Departmental budgets finalized with functional owners",
      "Quarterly milestones with clear accountability and deadlines",
      "Scenario analysis: base, best, and worst case projections",
      "KPI scorecard reviewed monthly with leadership team",
      "Headcount plan supports growth without margin erosion",
      "Cross-functional alignment achieved on top five initiatives",
      "Variance tracking cadence established for early intervention",
      "Full-year P&L reflects balanced investment and profitability",
    ],
  },

  generic: {
    category: "General Purpose",
    keywords: [
      "Strategy", "Innovation", "Growth", "Impact", "Performance",
      "Efficiency", "Quality", "Vision", "Mission", "Goals",
      "Objectives", "Milestones", "Timeline", "Budget", "Resources",
      "Team", "Culture", "Leadership", "Collaboration", "Communication",
      "Results", "Metrics", "Analytics", "Insights", "Trends",
      "Opportunity", "Challenge", "Solution", "Implementation", "Success",
    ],
    powerWords: [
      "Achieve", "Empower", "Transform", "Elevate", "Inspire",
      "Catalyze", "Propel", "Unleash", "Ignite", "Champion",
    ],
    phrases: [
      "Driving meaningful impact",
      "Turning vision into reality",
      "Building for the future",
      "Excellence in execution",
      "Collaborative innovation",
      "Sustainable long-term growth",
      "Empowering teams to succeed",
      "Setting new industry standards",
      "From strategy to results",
      "Creating lasting value",
    ],
  },
};

export function getKeywordsForProfile(profile: string): KeywordBank {
  return KEYWORD_BANKS[profile] || KEYWORD_BANKS.generic;
}

export function highlightKeywords(text: string, profile: string): string {
  const bank = getKeywordsForProfile(profile);
  let result = text;
  const allKeywords = [...bank.keywords, ...bank.powerWords].sort((a, b) => b.length - a.length);
  allKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
    result = result.replace(regex, '**$1**');
  });
  return result;
}

export function getBoldKeywordsForSlide(text: string, profile: string): { text: string; bold: boolean }[] {
  const bank = getKeywordsForProfile(profile);
  const allKeywords = [...bank.keywords, ...bank.powerWords].map(k => k.toLowerCase());
  const words = text.split(/(\s+)/);
  const result: { text: string; bold: boolean }[] = [];

  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
    const isBold = allKeywords.some(k => cleanWord === k.toLowerCase() || cleanWord.includes(k.toLowerCase()));
    result.push({ text: word, bold: isBold });
  });

  return result;
}
