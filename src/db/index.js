import { supabase } from './client.js';
import { usersTable } from './tables/users.js';
import { storeCategoriesTable } from './tables/storeCategories.js';
import { storesTable } from './tables/stores.js';
import { checkTableExists } from './checkdb.js';

export async function initAppDB() {
  try {
    // const tables = [
    //   { name: 'users', sql: usersTable },
    //   { name: 'store_categories', sql: storeCategoriesTable },
    //   { name: 'stores', sql: storesTable },
    // ];

    // for (const table of tables) {
    //   const exists = await checkTableExists(table.name);
    //   if (!exists) {
    //     console.log(`Creating table "${table.name}"...`);
    //     // Supabase allows running SQL via `rpc('execute_sql')` only if you created such a function
    //     const { data, error } = await supabase.rpc('execute_sql', { sql: table.sql });
    //     if (error) throw error;
    //     console.log(`Table "${table.name}" created.`);
    //   } else {
    //     console.log(`Table "${table.name}" already exists.`);
    //   }
    // }

    // console.log('All tables are ready.');
    console.log("Supabase connected")
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}