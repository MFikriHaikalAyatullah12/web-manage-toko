import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/database';

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json();
    const newTransaction = await addTransaction(transaction);
    return NextResponse.json(newTransaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  }
}