// Chart Engine
// Generates chart data and renders charts in both HTML preview and PPTX export
// Supports: bar, line, pie, doughnut, area

export interface ChartDataset {
  label: string;
  values: number[];
  color: string;
}

export interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut" | "area";
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

// Generate contextual sample chart data based on profile
export function generateChartForContext(
  chartType: string,
  title: string,
  profile: string
): ChartData {
  const type = (chartType || "bar") as ChartData["type"];

  const contextData: Record<string, () => ChartData> = {
    consulting: () => ({
      type,
      title: title || "Impact Assessment",
      labels: ["Process Efficiency", "Cost Reduction", "Revenue Uplift", "Customer Satisfaction", "Employee Productivity"],
      datasets: [{
        label: "Improvement (%)",
        values: [42, 35, 28, 55, 38],
        color: "#003366",
      }],
    }),

    tech: () => ({
      type,
      title: title || "Platform Performance",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        { label: "API Requests (M)", values: [12, 18, 25, 34], color: "#6366F1" },
        { label: "Response Time (ms)", values: [120, 95, 72, 55], color: "#22D3EE" },
      ],
    }),

    business: () => ({
      type,
      title: title || "Revenue Growth",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        { label: "Revenue ($M)", values: [28, 35, 42, 52], color: "#2563EB" },
        { label: "Profit ($M)", values: [8, 12, 15, 19], color: "#10B981" },
      ],
    }),

    vc_pitch: () => ({
      type,
      title: title || "Traction & Growth",
      labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
      datasets: [{
        label: "MRR ($K)",
        values: [15, 28, 45, 72, 110, 165],
        color: "#FF6B35",
      }],
    }),

    investment_banking: () => ({
      type,
      title: title || "Valuation Comparison",
      labels: ["Company A", "Company B", "Company C", "Target", "Company D"],
      datasets: [{
        label: "EV/EBITDA Multiple",
        values: [12.5, 14.2, 11.8, 15.5, 13.1],
        color: "#1B365D",
      }],
    }),

    board: () => ({
      type,
      title: title || "Quarterly Financial Summary",
      labels: ["Q1 FY25", "Q2 FY25", "Q3 FY25", "Q4 FY25"],
      datasets: [
        { label: "Revenue ($M)", values: [30, 32, 35, 38], color: "#003153" },
        { label: "EBITDA ($M)", values: [8, 9, 10, 11], color: "#F3C13A" },
      ],
    }),

    aop: () => ({
      type,
      title: title || "Annual Plan vs Actual",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        { label: "Plan ($M)", values: [45, 50, 55, 60], color: "#1B3A5C" },
        { label: "Actual ($M)", values: [47, 48, 0, 0], color: "#0097A7" },
      ],
    }),

    academic: () => ({
      type,
      title: title || "Research Results",
      labels: ["Control", "Treatment A", "Treatment B", "Treatment C"],
      datasets: [{
        label: "Effect Size",
        values: [1.0, 1.45, 1.82, 2.15],
        color: "#8B1A1A",
      }],
    }),

    product: () => ({
      type,
      title: title || "User Engagement Metrics",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
      datasets: [
        { label: "DAU (K)", values: [5, 8, 12, 18, 24, 31], color: "#7C3AED" },
        { label: "Retention (%)", values: [100, 72, 58, 48, 42, 38], color: "#EC4899" },
      ],
    }),
  };

  const generator = contextData[profile] || contextData.business;
  const data = generator();
  data.type = type; // ensure chart type matches request
  if (title) data.title = title;
  return data;
}

// Color palette for pie/doughnut charts
export const CHART_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
];

// Get colors for a dataset (for pie/doughnut, each segment needs a color)
export function getChartColors(count: number, primaryColor?: string): string[] {
  if (primaryColor) {
    return [primaryColor, ...CHART_COLORS.filter(c => c !== primaryColor)].slice(0, count);
  }
  return CHART_COLORS.slice(0, count);
}
