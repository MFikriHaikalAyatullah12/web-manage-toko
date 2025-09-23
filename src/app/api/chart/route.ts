import { NextRequest, NextResponse } from 'next/server';
import { getChartData } from '@/lib/database';

export async function GET() {
  try {
    const chartData = await getChartData();
    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error getting chart data:', error);
    return NextResponse.json(
      { error: 'Failed to get chart data' },
      { status: 500 }
    );
  }
}