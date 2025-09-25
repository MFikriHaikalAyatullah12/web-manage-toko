import { NextResponse } from 'next/server';
import { getDashboardStats, getChartData } from '@/lib/database';

export async function GET() {
  try {
    // Get latest stats and chart data
    const [stats, chartData] = await Promise.all([
      getDashboardStats(),
      getChartData(7)
    ]);

    return NextResponse.json({
      stats,
      chartData,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Error getting realtime data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get realtime data',
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}