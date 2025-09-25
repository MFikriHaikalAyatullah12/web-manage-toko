#!/usr/bin/env node

import { initializeDatabase } from '../src/lib/postgresql.js';

async function setupDatabase() {
  console.log('🚀 Initializing PostgreSQL database...');
  
  try {
    await initializeDatabase();
    console.log('✅ Database initialization completed successfully!');
    console.log('🎉 Your Neon PostgreSQL database is ready to use!');
    
    console.log('\n📋 Database Summary:');
    console.log('- Tables created: products, transactions, transaction_items, purchases');
    console.log('- Sample data inserted: 5 sample products');
    console.log('- Ready for production use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();