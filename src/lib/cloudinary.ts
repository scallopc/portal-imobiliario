import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configura o Cloudinary com as credenciais do ambiente
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

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  // Cria um stream a partir do buffer do arquivo
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const readable = new Readable();
  readable._read = () => {}; // Método _read obrigatório
  readable.push(buffer);
  readable.push(null); // Indica o final do stream

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'imoveis',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp',
        quality: 'auto',
        flags: 'lossy',
        eager: [{ fetch_format: 'webp', quality: 'auto' }],
        eager_async: false,
      },
      (error, result) => {
        if (error) {
          console.error('Erro ao fazer upload para o Cloudinary:', error);
          return reject(new Error('Falha ao fazer upload da imagem'));
        }
        if (!result) {
          return reject(new Error('Nenhum resultado retornado do Cloudinary'));
        }
        const eagerUrl = (result as any).eager?.[0]?.secure_url as string | undefined;
        resolve({
          secure_url: eagerUrl || result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    // Conecta o stream ao upload
    readable.pipe(uploadStream);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Erro ao deletar arquivo do Cloudinary:', error);
        return reject(new Error('Falha ao deletar a imagem'));
      }
      if (result?.result !== 'ok') {
        console.error('Resultado inesperado ao deletar arquivo:', result);
        return reject(new Error('Falha ao deletar a imagem'));
      }
      resolve();
    });
  });
}

export function extractPublicId(url: string): string | null {
  // Extrai o public_id da URL do Cloudinary
  const matches = url.match(/upload\/(?:v\d+\/)?([^\/]+)\/[^\/]+$/);
  return matches ? matches[1] : null;
}
