const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function debugRawData() {
  try {
    console.log('🔍 Analisando dados brutos para entender problemas de extração...');
    
    // Buscar alguns documentos para análise
    const snapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'ignored')
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ Nenhum documento ignorado encontrado');
      return;
    }
    
    console.log(`\n📋 Analisando ${snapshot.size} documentos ignorados:`);
    console.log('=' .repeat(80));
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ID: ${doc.id}`);
      console.log(`   Título: ${data.title || 'Sem título'}`);
      console.log(`   URL: ${data.sourceUrl || 'Sem URL'}`);
      console.log(`   Motivo do ignore: ${data.ignoreReason || 'Não especificado'}`);
      
      if (data.rawData) {
        console.log(`   Raw Data - Título: ${data.rawData.title || 'N/A'}`);
        console.log(`   Raw Data - Descrição: ${(data.rawData.description || '').substring(0, 200)}...`);
        console.log(`   Raw Data - Preço: ${data.rawData.price || 'N/A'}`);
        console.log(`   Raw Data - Área: ${data.rawData.area || 'N/A'}`);
        console.log(`   Raw Data - Quartos: ${data.rawData.bedrooms || 'N/A'}`);
        console.log(`   Raw Data - Imagens: ${data.rawData.images?.length || 0}`);
      }
      
      console.log('-'.repeat(80));
    });
    
    // Buscar também alguns documentos processados para comparar
    console.log('\n\n📋 Analisando documentos processados com sucesso:');
    console.log('=' .repeat(80));
    
    const processedSnapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'completed')
      .limit(3)
      .get();
    
    processedSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ID: ${doc.id}`);
      console.log(`   Título: ${data.title || 'Sem título'}`);
      console.log(`   URL: ${data.sourceUrl || 'Sem URL'}`);
      
      if (data.rawData) {
        console.log(`   Raw Data - Título: ${data.rawData.title || 'N/A'}`);
        console.log(`   Raw Data - Descrição: ${(data.rawData.description || '').substring(0, 200)}...`);
        console.log(`   Raw Data - Preço: ${data.rawData.price || 'N/A'}`);
        console.log(`   Raw Data - Área: ${data.rawData.area || 'N/A'}`);
        console.log(`   Raw Data - Quartos: ${data.rawData.bedrooms || 'N/A'}`);
        console.log(`   Raw Data - Imagens: ${data.rawData.images?.length || 0}`);
      }
      
      console.log('-'.repeat(80));
    });
    
  } catch (error) {
    console.error('❌ Erro ao analisar dados:', error);
  } finally {
    process.exit(0);
  }
}

debugRawData();
