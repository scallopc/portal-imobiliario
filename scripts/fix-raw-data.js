// Carregar variáveis de ambiente
require('dotenv').config()

const admin = require('firebase-admin')

// Configurar Firebase Admin usando variáveis de ambiente
function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId, clientEmail, privateKey;

  if (svcJson) {
    try {
      const parsed = JSON.parse(svcJson);
      projectId = parsed.project_id;
      clientEmail = parsed.client_email;
      privateKey = (parsed.private_key || '').replace(/\\n/g, "\n");
    } catch (e) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
    }
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = getPrivateKey();
  }

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    throw new Error(
      'Missing Firebase Admin credentials. Provide FIREBASE_SERVICE_ACCOUNT_KEY (preferred) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }
}

const db = admin.firestore()

async function fixRawData() {
  try {
    console.log('🔧 Corrigindo documentos na coleção properties_raw...')
    
    // Buscar todos os documentos
    const snapshot = await db.collection('properties_raw').get()
    
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado em properties_raw')
      return
    }
    
    console.log(`Encontrados ${snapshot.size} documentos`)
    
    let fixedCount = 0
    let alreadyCorrectCount = 0
    
    for (const doc of snapshot.docs) {
      const data = doc.data()
      const needsUpdate = !data.hasOwnProperty('needsProcessing') || 
                         !data.hasOwnProperty('processingStatus') ||
                         !data.hasOwnProperty('rawData')
      
      if (needsUpdate) {
        try {
          // Preparar dados para atualização
          const updateData = {}
          
          if (!data.hasOwnProperty('needsProcessing')) {
            updateData.needsProcessing = true
          }
          
          if (!data.hasOwnProperty('processingStatus')) {
            updateData.processingStatus = 'pending'
          }
          
          if (!data.hasOwnProperty('rawData')) {
            // Criar rawData com os dados existentes
            const rawData = { ...data }
            // Remover campos que não devem estar em rawData
            delete rawData.needsProcessing
            delete rawData.processingStatus
            delete rawData.rawData
            delete rawData.processedAt
            delete rawData.processedPropertyId
            delete rawData.ignoreReason
            delete rawData.error
            delete rawData.processingStartedAt
            
            updateData.rawData = rawData
          }
          
          // Atualizar o documento
          await doc.ref.update(updateData)
          
          console.log(`✅ Corrigido: ${doc.id} - ${data.title || 'Sem título'}`)
          fixedCount++
          
        } catch (error) {
          console.error(`❌ Erro ao corrigir ${doc.id}:`, error.message)
        }
        
        // Pequena pausa entre atualizações
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } else {
        alreadyCorrectCount++
      }
    }
    
    console.log(`\n=== RESUMO DA CORREÇÃO ===`)
    console.log(`Documentos corrigidos: ${fixedCount}`)
    console.log(`Já estavam corretos: ${alreadyCorrectCount}`)
    console.log(`Total: ${snapshot.size}`)
    
    if (fixedCount > 0) {
      console.log(`\n🎉 Agora você pode executar 'npm run crawler:process' para processar as propriedades!`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir dados:', error)
  } finally {
    process.exit(0)
  }
}

fixRawData()


