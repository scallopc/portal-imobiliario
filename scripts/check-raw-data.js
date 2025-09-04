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

async function checkRawData() {
  try {
    console.log('🔍 Verificando dados na coleção properties_raw...')
    
    // Verificar total de documentos
    const totalSnapshot = await db.collection('properties_raw').get()
    console.log(`Total de documentos em properties_raw: ${totalSnapshot.size}`)
    
    if (totalSnapshot.empty) {
      console.log('❌ Nenhum documento encontrado em properties_raw')
      return
    }
    
    // Verificar documentos que precisam de processamento
    const pendingSnapshot = await db.collection('properties_raw')
      .where('needsProcessing', '==', true)
      .where('processingStatus', '==', 'pending')
      .get()
    
    console.log(`Documentos pendentes de processamento: ${pendingSnapshot.size}`)
    
    // Verificar documentos por status
    const processingSnapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'processing')
      .get()
    
    const completedSnapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'completed')
      .get()
    
    const errorSnapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'error')
      .get()
    
    const ignoredSnapshot = await db.collection('properties_raw')
      .where('processingStatus', '==', 'ignored')
      .get()
    
    console.log(`\n=== STATUS DOS DOCUMENTOS ===`)
    console.log(`Pendentes: ${pendingSnapshot.size}`)
    console.log(`Processando: ${processingSnapshot.size}`)
    console.log(`Completados: ${completedSnapshot.size}`)
    console.log(`Com erro: ${errorSnapshot.size}`)
    console.log(`Ignorados: ${ignoredSnapshot.size}`)
    
    // Mostrar alguns exemplos de documentos pendentes
    if (!pendingSnapshot.empty) {
      console.log(`\n=== EXEMPLOS DE DOCUMENTOS PENDENTES ===`)
      const docs = pendingSnapshot.docs.slice(0, 3)
      
      for (const doc of docs) {
        const data = doc.data()
        console.log(`\nID: ${doc.id}`)
        console.log(`Título: ${data.title}`)
        console.log(`URL: ${data.sourceUrl}`)
        console.log(`needsProcessing: ${data.needsProcessing}`)
        console.log(`processingStatus: ${data.processingStatus}`)
        console.log(`Tem rawData: ${!!data.rawData}`)
        console.log(`Tem imagens: ${data.images ? data.images.length : 0}`)
      }
    }
    
    // Verificar se há documentos sem os campos necessários
    const docsWithoutFields = []
    for (const doc of totalSnapshot.docs) {
      const data = doc.data()
      if (!data.hasOwnProperty('needsProcessing') || !data.hasOwnProperty('processingStatus')) {
        docsWithoutFields.push({
          id: doc.id,
          title: data.title,
          missingFields: []
        })
        
        if (!data.hasOwnProperty('needsProcessing')) {
          docsWithoutFields[docsWithoutFields.length - 1].missingFields.push('needsProcessing')
        }
        if (!data.hasOwnProperty('processingStatus')) {
          docsWithoutFields[docsWithoutFields.length - 1].missingFields.push('processingStatus')
        }
      }
    }
    
    if (docsWithoutFields.length > 0) {
      console.log(`\n⚠️  DOCUMENTOS SEM CAMPOS NECESSÁRIOS: ${docsWithoutFields.length}`)
      for (const doc of docsWithoutFields.slice(0, 5)) {
        console.log(`ID: ${doc.id} - Título: ${doc.title} - Campos faltando: ${doc.missingFields.join(', ')}`)
      }
    }
    
    // Verificar coleção properties
    const propertiesSnapshot = await db.collection('properties').get()
    console.log(`\nTotal de documentos em properties: ${propertiesSnapshot.size}`)
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error)
  } finally {
    process.exit(0)
  }
}

checkRawData()


