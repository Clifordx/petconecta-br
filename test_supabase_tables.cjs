const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testTables() {
  const tables = [
    'perfis', 
    'pets', 
    'clinicas_parceiras', 
    'filas_castracao', 
    'consultas', 
    'solicitacoes_banco_racao', 
    'loja_produtos', 
    'loja_pedidos', 
    'denuncias', 
    'feiras', 
    'adocoes'
  ];

  console.log('--- TESTANDO TABELAS NO SUPABASE ---');
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(1);
      if (error) {
        console.log(`❌ ${t}: ${error.code} - ${error.message}`);
      } else {
        console.log(`✅ ${t}: OK (${data.length} registros encontrados)`);
      }
    } catch (e) {
      console.log(`⚠️ ${t}: Erro de rede/execução`, e.message);
    }
  }
}

testTables();
