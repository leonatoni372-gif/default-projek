/**
 * Demo Mode - Seed realistic demo data.
 * 
 * Seeds:
 * - 10 products
 * - 20 content ideas
 * - 10 content items
 * - 30 performance records
 * - 20 orders
 * - 10 expenses
 * - 5 experiments
 * - sample AI recommendations
 * 
 * Clearly labels demo data.
 */

export type DemoProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_rate: number;
  affiliate_url: string;
  status: string;
  is_demo: boolean;
};

export type DemoContentIdea = {
  id: string;
  title: string;
  description: string;
  product_id: string;
  status: string;
  is_demo: boolean;
};

export function seedDemoData() {
  const products: DemoProduct[] = [
    { id: 'demo_prod_1', name: 'AI Affiliate Masterclass', description: 'Learn AI-powered affiliate marketing', price: 99.99, commission_rate: 30, affiliate_url: 'https://demo.com/affiliate/1', status: 'active', is_demo: true },
    { id: 'demo_prod_2', name: 'Smart Content Tool', description: 'AI content creation platform', price: 49.99, commission_rate: 20, affiliate_url: 'https://demo.com/affiliate/2', status: 'active', is_demo: true },
    { id: 'demo_prod_3', name: 'Analytics Dashboard Pro', description: 'Real-time affiliate analytics', price: 79.99, commission_rate: 25, affiliate_url: 'https://demo.com/affiliate/3', status: 'active', is_demo: true },
    { id: 'demo_prod_4', name: 'Email Marketing Suite', description: 'Automated email campaigns', price: 29.99, commission_rate: 35, affiliate_url: 'https://demo.com/affiliate/4', status: 'active', is_demo: true },
    { id: 'demo_prod_5', name: 'SEO Optimization Tool', description: 'Improve search rankings', price: 59.99, commission_rate: 20, affiliate_url: 'https://demo.com/affiliate/5', status: 'active', is_demo: true },
    { id: 'demo_prod_6', name: 'Social Media Scheduler', description: 'Schedule posts across platforms', price: 19.99, commission_rate: 25, affiliate_url: 'https://demo.com/affiliate/6', status: 'active', is_demo: true },
    { id: 'demo_prod_7', name: 'Video Editing Software', description: 'Create professional videos', price: 149.99, commission_rate: 15, affiliate_url: 'https://demo.com/affiliate/7', status: 'active', is_demo: true },
    { id: 'demo_prod_8', name: 'Landing Page Builder', description: 'High-converting landing pages', price: 39.99, commission_rate: 30, affiliate_url: 'https://demo.com/affiliate/8', status: 'active', is_demo: true },
    { id: 'demo_prod_9', name: 'Chatbot Automation', description: 'AI-powered chatbot builder', price: 89.99, commission_rate: 20, affiliate_url: 'https://demo.com/affiliate/9', status: 'active', is_demo: true },
    { id: 'demo_prod_10', name: 'Conversion Optimizer', description: 'A/B testing and optimization', price: 69.99, commission_rate: 25, affiliate_url: 'https://demo.com/affiliate/10', status: 'active', is_demo: true },
  ];

  const contentIdeas: DemoContentIdea[] = Array.from({ length: 20 }, (_, i) => ({
    id: `demo_idea_${i + 1}`,
    title: `Content Idea #${i + 1} - ${products[i % 10].name}`,
    description: `Demo content idea for ${products[i % 10].name}. This is demo data - not real content.`,
    product_id: products[i % 10].id,
    status: i % 3 === 0 ? 'ideated' : i % 3 === 1 ? 'in_review' : 'approved',
    is_demo: true,
  }));

  const contentItems = Array.from({ length: 10 }, (_, i) => ({
    id: `demo_content_${i + 1}`,
    idea_id: contentIdeas[i].id,
    title: `Content Item #${i + 1}`,
    status: i % 2 === 0 ? 'draft' : 'under_review',
    platform: (['youtube', 'tiktok', 'instagram'] as ('youtube' | 'tiktok' | 'instagram')[])[i % 3],
    is_demo: true,
  }));

  const performanceRecords = Array.from({ length: 30 }, (_, i) => ({
    id: `demo_perf_${i + 1}`,
    content_item_id: contentItems[i % 10].id,
    views: Math.floor(Math.random() * 5000) + 100,
    watch_time: Math.floor(Math.random() * 300) + 10,
    retention: Math.floor(Math.random() * 60) + 20,
    likes: Math.floor(Math.random() * 200),
    comments: Math.floor(Math.random() * 50),
    shares: Math.floor(Math.random() * 30),
    saves: Math.floor(Math.random() * 20),
    profile_visits: Math.floor(Math.random() * 100),
    clicks: Math.floor(Math.random() * 100),
    orders: Math.floor(Math.random() * 10),
    commission: Math.floor(Math.random() * 200),
    is_demo: true,
  }));

  const orders = Array.from({ length: 20 }, (_, i) => ({
    id: `demo_order_${i + 1}`,
    product_id: products[i % 10].id,
    user_id: `user_${(i % 5) + 1}`,
    amount: products[i % 10].price,
    order_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed' as const,
    is_demo: true,
  }));

  const expenses = Array.from({ length: 10 }, (_, i) => ({
    id: `demo_expense_${i + 1}`,
    user_id: 'user_1',
    name: ['Ad Spend', 'Software', 'Creative Production', 'Platform Fee', 'Other'][i % 5],
    amount: Math.floor(Math.random() * 100) + 10,
    category: ['ad_spend', 'software', 'creative_production', 'platform_fee', 'other'][i % 5],
    occurred_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
  }));

  const experiments = Array.from({ length: 5 }, (_, i) => ({
    id: `demo_exp_${i + 1}`,
    name: `Experiment #${i + 1}`,
    hypothesis: `Testing ${['hook', 'CTA', 'format', 'duration', 'creative'][i]} variations`,
    status: (['proposed', 'running', 'completed'] as ('proposed' | 'running' | 'completed')[])[i % 3],
    is_demo: true,
  }));

  const aiRecommendations = [
    { type: 'product', recommendation: 'Focus on AI Affiliate Masterclass - highest commission rate at 30%', confidence: 0.85 },
    { type: 'content', recommendation: 'Create video content for TikTok targeting younger demographics', confidence: 0.72 },
    { type: 'experiment', recommendation: 'A/B test different CTAs on TikTok videos', confidence: 0.68 },
    { type: 'finance', recommendation: 'Review ad spend - current ROI below target threshold', confidence: 0.78 },
    { type: 'compliance', recommendation: 'Ensure all content has proper affiliate disclosure before publishing', confidence: 0.95 },
  ];

  return {
    products,
    contentIdeas,
    contentItems,
    performanceRecords,
    orders,
    expenses,
    experiments,
    aiRecommendations,
  };
}

export default seedDemoData();