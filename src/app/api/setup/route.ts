import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/postgresql';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'PostgreSQL database setup completed successfully!' 
    });
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup database' 
    }, { status: 500 });
  }
}