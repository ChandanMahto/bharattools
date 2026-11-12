export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  route: string;
  keywords: string[];
  featured?: boolean;
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Calculate GST inclusive or exclusive amounts with CGST, SGST or IGST.',
    category: 'Finance',
    route: '/tools/gst-calculator',
    keywords: ['gst', 'cgst', 'sgst', 'igst', 'tax', '18 percent'],
    featured: true,
  },
  {
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    description: 'Estimate monthly loan EMI and see the interest and principal split.',
    category: 'Finance',
    route: '/tools/emi-calculator',
    keywords: ['loan', 'home loan', 'car loan', 'interest', 'monthly payment'],
    featured: true,
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Find a percentage, percentage change, or what percent one number is of another.',
    category: 'Everyday',
    route: '/tools/percentage-calculator',
    keywords: ['percent', 'marks', 'discount', 'increase', 'decrease'],
    featured: true,
  },
];
