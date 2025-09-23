import { NextRequest, NextResponse } from 'next/server';
import { getPurchases, addPurchase } from '@/lib/database';

export async function GET() {
  try {
    const purchases = await getPurchases();
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error getting purchases:', error);
    return NextResponse.json(
      { error: 'Failed to get purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const purchase = await request.json();
    const newPurchase = await addPurchase(purchase);
    return NextResponse.json(newPurchase);
  } catch (error) {
    console.error('Error adding purchase:', error);
    return NextResponse.json(
      { error: 'Failed to add purchase' },
      { status: 500 }
    );
  }
}