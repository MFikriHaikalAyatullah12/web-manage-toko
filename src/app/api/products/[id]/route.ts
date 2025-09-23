import { NextRequest, NextResponse } from 'next/server';
import { deleteProduct } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProduct(id);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Product not found or could not be deleted' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}