import { NextResponse } from 'next/server';
import { query } from '@/lib/postgresql';
import type { Supplier } from '@/types';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT pu.id) as purchase_count,
        COALESCE(SUM(pu.total), 0) as total_purchases
      FROM suppliers s
      LEFT JOIN products p ON p.supplier_id = s.id
      LEFT JOIN purchases pu ON pu.supplier_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    
    return NextResponse.json({ suppliers: result.rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact_person, phone, email, address, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nama supplier wajib diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, contact_person, phone, email, address, notes]
    );

    return NextResponse.json({ 
      supplier: result.rows[0],
      message: 'Supplier berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
