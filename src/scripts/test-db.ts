import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:1E1dR0qiW9txHy0u@db.vugymqwgcltrzelksmhp.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDatabase() {
  console.log('Test de connexion à PostgreSQL...');

  try {
    // Test de connexion
    const client = await pool.connect();
    console.log('Connexion réussie!');

    // Vérifier la structure de la table profiles
    const { rows: tables } = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `);

    console.log('\nStructure de la table profiles:');
    console.table(tables);

    // Compter le nombre de profils
    const { rows: profiles } = await client.query('SELECT COUNT(*) FROM profiles');
    console.log('\nNombre de profils:', profiles[0].count);

    // Vérifier les contraintes de la table
    const { rows: constraints } = await client.query(`
      SELECT conname as constraint_name, 
             pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'profiles'::regclass
    `);

    console.log('\nContraintes de la table profiles:');
    console.table(constraints);

    client.release();
    await pool.end();

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testDatabase();
