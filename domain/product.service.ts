/**
 * Product Service - Domain layer for product-related operations.
 * 
 * Handles product discovery, scoring, and management.
 * Interacts with Supabase via repository pattern.
 * 
 * Mock adapters available for demo mode without paid APIs.
 */

// Supabase client would be imported here in actual implementation
// import { createClient } from '@supabase/ssr'

// Mock product data for demo mode
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'AI Affiliate Course',
    description: 'Learn affiliate marketing with AI tools',
    price: 99.99,
    commission_rate: 30,
    affiliate_url: 'https://example.com/course',
    status: 'active',
    confidence_score: 0.85,
    historical_performance: { views: 1200, clicks: 150, orders: 12, revenue: 1199.88 },
  },
  {
    id: 'prod_2',
    name: 'AI Tool Suite',
    description: 'Productivity tools powered by AI',
    price: 49.99,
    commission_rate: 20,
    affiliate_url: 'https://example.com/ai-tools',
    status: 'active',
    confidence_score: 0.72,
    historical_performance: { views: 800, clicks: 80, orders: 8, revenue: 399.92 },
  },
];

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_rate: number;
  affiliate_url?: string;
  status: string;
  confidence_score?: number;
  historical_performance?: { views: number; clicks: number; orders: number; revenue: number };
};

export type ProductScore = {
  demand: number; // 0-1, based on trend signals
  commission: number; // 0-1, based on commission rate
  price_fit: number; // 0-1, based on price point vs audience
  content_potential: number; // 0-1, based on content suitability
  competition: number; // 0-1, based on market saturation
  confidence: number; // 0-1, based on historical data
  historical_performance: number; // 0-1, based on past results
  overall: number; // 0-1 composite score
  rationale: string[];
};

export class ProductService {
  // In production, supabase would be injected
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * List products, optionally filtered by source and status
   */
  async list(filters: { status?: string; sourceId?: string } = {}): Promise<Product[]> {
    // const { data, error } = await this.supabase
    //   .from('products')
    //   .select('*')
    //   .eq('status', filters.status)
    //   .eq('product_source_id', filters.sourceId);

    // if (error) throw error;
    // return data || [];

    // Demo mode: return mock data
    return mockProducts;
  }

  /**
   * Get a single product by ID
   */
  async getById(id: string): Promise<Product | null> {
    // const { data, error } = await this.supabase
    //   .from('products')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    // if (error) throw error;
    // return data || null;

    return mockProducts.find(p => p.id === id) || null;
  }

  /**
   * Score a product using the transparent scoring engine.
   * Returns component scores and overall score with rationale.
   */
  async score(product: Product): Promise<ProductScore> {
    const rationale: string[] = [];

    // Demand score based on historical performance
    const perf = product.historical_performance;
    const demand = perf ? Math.min(1, (perf.views / 5000) * 0.4 + (perf.orders / 100) * 0.6) : 0.3;
    if (perf && perf.views > 0) rationale.push(`Demand: ${perf.views} views, ${perf.orders} orders`);
    else rationale.push('Demand: No historical data available');

    // Commission score based on commission rate
    const commission = Math.min(1, (product.commission_rate / 50));
    rationale.push(`Commission: ${product.commission_rate}% rate`);

    // Price fit score - moderate prices score higher
    const price = product.price || 0;
    let priceFit: number;
    if (price > 0 && price < 20) priceFit = 0.8;
    else if (price >= 20 && price < 100) priceFit = 0.9;
    else if (price >= 100 && price < 500) priceFit = 0.7;
    else priceFit = 0.5;
    rationale.push(`Price fit: $${price} price point`);

    // Content potential - products with good descriptions and URLs
    const contentPotential = product.description && product.affiliate_url ? 0.8 : 0.5;
    rationale.push(`Content potential: ${product.description ? 'has description' : 'missing description'}`);

    // Competition - assume lower is better, default moderate
    const competition = 0.6;
    rationale.push(`Competition: moderate market`);

    // Confidence based on data availability
    const confidence = perf ? Math.min(1, (perf.views + perf.orders) / 2000) : 0.3;
    rationale.push(`Confidence: ${confidence.toFixed(2)} based on data`);

    // Historical performance composite
    const historical = perf ? Math.min(1, (perf.views / 10000 + perf.orders / 50) / 2) : 0.2;
    rationale.push(`Historical performance: ${historical.toFixed(2)}`);

    const overall = Number((((demand + commission + priceFit + contentPotential + competition + confidence + historical) / 7).toFixed(2)));

    return {
      demand: Number(demand.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      price_fit: Number(priceFit.toFixed(2)),
      content_potential: Number(contentPotential.toFixed(2)),
      competition: Number(competition.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      historical_performance: Number(historical.toFixed(2)),
      overall: Number(overall.toFixed(2)),
      rationale,
    };
  }

  /**
   * Create a new product (with mock adapter for demo)
   */
  async create(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const id = product.id || `prod_${Date.now()}`;
    const newProduct: Product = { ...product, id };
    mockProducts.push(newProduct);
    return newProduct;
  }

  /**
   * Update a product
   */
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockProducts[index] = { ...mockProducts[index], ...updates };
    return mockProducts[index];
  }
}

export default new ProductService();