import { supabase } from './client.js';

export async function checkTableExists(tableName) {
  try {
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error) {
      // If the table doesn't exist, Postgres error code: 42P01
      if (error.code === '42P01') {
        console.log(`Table "${tableName}" does not exist.`);
        return false;
      } else {
        throw error;
      }
    }

    return true;
  } catch (err) {
    console.error('Error checking table:', err);
    return false;
  }
}