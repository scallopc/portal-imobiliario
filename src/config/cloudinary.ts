import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_URL) {
  throw new Error('A variável de ambiente CLOUDINARY_URL não está configurada');
}

// Extrai as credenciais da URL do Cloudinary
const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinaryUrl.hostname || '';
const [apiKey, apiSecret] = (cloudinaryUrl.username ? 
  [cloudinaryUrl.username, cloudinaryUrl.password] : 
  ['', '']
);

// Configura o SDK do Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

export { cloudinary };
