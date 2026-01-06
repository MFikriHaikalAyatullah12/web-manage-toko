import { NextResponse } from 'next/server';
import { query } from '@/lib/postgresql';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get supplier details
    const supplierResult = await query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id]
    );

    if (supplierResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get products from this supplier
    const productsResult = await query(
      `SELECT id, name, category, stock, price, cost 
       FROM products 
       WHERE supplier_id = $1
       ORDER BY name ASC`,
      [id]
    );

    // Get purchase history from this supplier
    const purchasesResult = await query(
      `SELECT * FROM purchases 
       WHERE supplier_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );

    return NextResponse.json({
      supplier: supplierResult.rows[0],
      products: productsResult.rows,
      purchases: purchasesResult.rows
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, contact_person, phone, email, address, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nama supplier wajib diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE suppliers 
       SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5, notes = $6
       WHERE id = $7
       RETURNING *`,
      [name, contact_person, phone, email, address, notes, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      supplier: result.rows[0],
      message: 'Supplier berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if supplier has products
    const productsResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE supplier_id = $1',
      [id]
    );

    if (parseInt(productsResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus supplier yang masih memiliki produk' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM suppliers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Supplier berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
