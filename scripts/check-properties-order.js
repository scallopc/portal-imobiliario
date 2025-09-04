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

async function checkPropertiesOrder() {
  try {
    console.log('🔍 Verificando ordenação dos imóveis na coleção properties...');
    
    // Buscar propriedades ordenadas por createdAt desc
    const snapshot = await db.collection('properties')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ Nenhum imóvel encontrado na coleção properties');
      return;
    }
    
    console.log(`\n📋 Primeiros 10 imóveis (mais recentes primeiro):`);
    console.log('=' .repeat(80));
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || data.createdAt;
      const dateStr = createdAt ? createdAt.toLocaleString('pt-BR') : 'Data não disponível';
      
      console.log(`${index + 1}. ${data.title || 'Sem título'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Criado em: ${dateStr}`);
      console.log(`   Preço: ${data.price ? `R$ ${data.price.toLocaleString('pt-BR')}` : 'Não informado'}`);
      console.log(`   Tipo: ${data.type || 'Não informado'}`);
      console.log(`   Status: ${data.status || 'Não informado'}`);
      console.log('-'.repeat(80));
    });
    
    // Verificar se há problemas com datas
    console.log('\n🔍 Verificando problemas com datas...');
    
    const allSnapshot = await db.collection('properties').get();
    let validDates = 0;
    let invalidDates = 0;
    let missingDates = 0;
    
    allSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt;
      
      if (!createdAt) {
        missingDates++;
      } else if (createdAt.toDate && typeof createdAt.toDate === 'function') {
        validDates++;
      } else if (createdAt instanceof Date) {
        validDates++;
      } else {
        invalidDates++;
        console.log(`❌ Data inválida em ${doc.id}: ${typeof createdAt} - ${createdAt}`);
      }
    });
    
    console.log(`\n📊 Estatísticas de datas:`);
    console.log(`✅ Datas válidas: ${validDates}`);
    console.log(`❌ Datas inválidas: ${invalidDates}`);
    console.log(`⚠️  Datas ausentes: ${missingDates}`);
    console.log(`📈 Total de imóveis: ${allSnapshot.size}`);
    
    if (invalidDates > 0 || missingDates > 0) {
      console.log('\n🔧 Recomendação: Execute o script de correção de dados se necessário.');
    } else {
      console.log('\n✅ Todas as datas estão corretas!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar ordenação:', error);
  } finally {
    process.exit(0);
  }
}

checkPropertiesOrder();
