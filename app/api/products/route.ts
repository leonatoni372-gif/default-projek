import { NextRequest, NextResponse } from "next/server";
import { ProductListSchema, ProductCreateSchema, validateRequest } from "@/lib/zod/schemas";
import productService from "@/domain/product.service";

export async function GET(request: NextRequest) {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => { params[k] = v; });

  const parsed = validateRequest(ProductListSchema, params);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const products = await productService.list(parsed.data);
  return NextResponse.json({ success: true, products, count: products.length });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(ProductCreateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const product = await productService.create(parsed.data);
  const score = await productService.score(product);
  return NextResponse.json({ success: true, product, score }, { status: 201 });
}
