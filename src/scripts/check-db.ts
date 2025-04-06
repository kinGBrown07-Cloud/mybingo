import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:1E1dR0qiW9txHy0u@db.vugymqwgcltrzelksmhp.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connexion à la base de données réussie');

    // Vérifier la structure des tables d'authentification
    console.log('\nVérification des tables d\'authentification...');
    const { rows: authTables } = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'auth'
      ORDER BY table_name, ordinal_position;
    `);
    console.table(authTables);

    // Vérifier les politiques RLS
    console.log('\nVérification des politiques RLS...');
    const { rows: policies } = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE schemaname IN ('auth', 'public')
      ORDER BY schemaname, tablename;
    `);
    console.table(policies);

    // Vérifier les contraintes
    console.log('\nVérification des contraintes...');
    const { rows: constraints } = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema IN ('auth', 'public')
      ORDER BY tc.table_schema, tc.table_name;
    `);
    console.table(constraints);

    // Vérifier les triggers
    console.log('\nVérification des triggers...');
    const { rows: triggers } = await client.query(`
      SELECT 
        trigger_schema,
        trigger_name,
        event_manipulation,
        event_object_schema,
        event_object_table,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE trigger_schema IN ('auth', 'public')
      ORDER BY trigger_schema, event_object_table;
    `);
    console.table(triggers);

    client.release();
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
  } finally {
    pool.end();
  }
}

checkDatabase();
