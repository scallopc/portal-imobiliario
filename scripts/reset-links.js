// Script para resetar links processados na coleção 'links'
require("dotenv").config();

const admin = require("firebase-admin");

// Configurar Firebase Admin
if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId, clientEmail, privateKey;

  if (svcJson) {
    const parsed = JSON.parse(svcJson);
    projectId = parsed.project_id;
    clientEmail = parsed.client_email;
    privateKey = (parsed.private_key || "").replace(/\\n/g, "\n");
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const db = admin.firestore();

async function resetLinks() {
  console.log('🔄 Resetando links processados...\n');
  
  try {
    // Buscar todos os links
    const linksSnapshot = await db.collection('links').get();
    
    if (linksSnapshot.empty) {
      console.log('⚠️ Nenhum link encontrado na coleção "links"');
      
      // Criar links de exemplo
      console.log('📝 Criando links de exemplo...');
      
      const sampleLinks = [
        {
          url: 'https://www.olx.com.br/imoveis/venda/estado-rj/rio-de-janeiro',
          type: 'portal',
          description: 'OLX Imóveis - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        },
        {
          url: 'https://www.imovelweb.com.br/imoveis-venda-rio-de-janeiro-rj.html',
          type: 'portal', 
          description: 'ImovelWeb - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        },
        {
          url: 'https://www.chavesnamao.com.br/imoveis-para-comprar/rj-rio-de-janeiro/',
          type: 'portal',
          description: 'Chaves na Mão - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        },
        {
          url: 'https://www.netimóveis.com/venda/rio-de-janeiro',
          type: 'portal',
          description: 'Netimóveis - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        }
      ];

      for (const link of sampleLinks) {
        await db.collection('links').add(link);
        console.log(`✅ Criado: ${link.description}`);
      }
      
      console.log(`\n📊 ${sampleLinks.length} links criados`);
      return;
    }

    console.log(`📋 Encontrados ${linksSnapshot.size} links`);
    
    let resetCount = 0;
    
    // Resetar todos os links para não processados
    const batch = db.batch();
    
    linksSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        processed: false,
        processingStatus: 'pending',
        processingStartedAt: admin.firestore.FieldValue.delete(),
        processedAt: admin.firestore.FieldValue.delete(),
        error: admin.firestore.FieldValue.delete(),
        htmlPagesSaved: admin.firestore.FieldValue.delete()
      });
      resetCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ ${resetCount} links resetados para não processados`);
    
    // Mostrar links disponíveis
    console.log('\n📋 Links disponíveis:');
    linksSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.description || data.url}`);
      console.log(`   URL: ${data.url}`);
    });
    
    console.log('\n🚀 Agora você pode executar: node scripts/html-scraper.js');
    
  } catch (error) {
    console.error('❌ Erro ao resetar links:', error.message);
  }
}

resetLinks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
