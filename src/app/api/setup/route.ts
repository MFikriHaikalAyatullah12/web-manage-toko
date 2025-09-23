import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase } from '@/lib/setup';

export async function POST(request: NextRequest) {
  try {
    const result = await setupDatabase();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database setup completed successfully!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup database' 
    }, { status: 500 });
  }
}