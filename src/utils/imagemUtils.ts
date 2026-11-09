import { supabase } from '../lib/supabase';

export interface ResultadoProcessamentoImagem {
  sucesso: boolean;
  url: string;
  mensagem?: string;
  armazenadoEmNuvem: boolean;
}

/**
 * Redimensiona e comprime uma imagem no navegador utilizando HTML5 Canvas e formato WebP.
 * Evita o consumo excessivo de memória e estouro de cota (QuotaExceededError).
 */
export async function comprimirImagemWebP(
  file: File,
  maxLargura = 800,
  maxAltura = 800,
  qualidade = 0.8
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido ou corrompido'));
      img.onload = () => {
        let { width, height } = img;

        // Calcula proporção para manter aspect ratio
        if (width > height) {
          if (width > maxLargura) {
            height = Math.round((height * maxLargura) / width);
            width = maxLargura;
          }
        } else {
          if (height > maxAltura) {
            width = Math.round((width * maxAltura) / height);
            height = maxAltura;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao obter contexto 2D para processamento da imagem'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Tenta formato WebP; se o navegador não suportar, fallback automático para JPEG
        let mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback para JPEG
              mimeType = 'image/jpeg';
              canvas.toBlob(
                (blobJpeg) => {
                  if (!blobJpeg) {
                    reject(new Error('Falha ao comprimir imagem'));
                    return;
                  }
                  const dataUrl = canvas.toDataURL(mimeType, qualidade);
                  resolve({ blob: blobJpeg, dataUrl });
                },
                mimeType,
                qualidade
              );
              return;
            }
            const dataUrl = canvas.toDataURL(mimeType, qualidade);
            resolve({ blob, dataUrl });
          },
          mimeType,
          qualidade
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Processa o upload de imagem de um produto para o restaurante.
 * Tenta enviar para o Supabase Storage Bucket 'cardapio'.
 * Se o bucket ainda não estiver provisionado, utiliza a versão comprimida otimizada (< 50KB)
 * e orienta o administrador sobre a configuração do bucket.
 */
export async function processarUploadImagemProduto(
  file: File,
  tenantId: string,
  produtoIdOuNome: string
): Promise<ResultadoProcessamentoImagem> {
  // 1. Validação de tamanho (máximo 5MB no arquivo original)
  if (file.size > 5 * 1024 * 1024) {
    return {
      sucesso: false,
      url: '',
      mensagem: 'A imagem selecionada deve ter no máximo 5MB.',
      armazenadoEmNuvem: false,
    };
  }

  // 2. Validação de tipo MIME
  if (!file.type.startsWith('image/')) {
    return {
      sucesso: false,
      url: '',
      mensagem: 'Selecione um arquivo de imagem válido (JPG, PNG, WebP).',
      armazenadoEmNuvem: false,
    };
  }

  try {
    // 3. Compressão local WebP (gera imagem de alta definição com peso de ~30KB a 60KB)
    const { blob, dataUrl } = await comprimirImagemWebP(file, 800, 800, 0.8);

    // 4. Tentativa de upload para o Supabase Storage
    const nomeSeguro = produtoIdOuNome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const timestamp = Date.now();
    const caminhoArquivo = `${tenantId || 'geral'}/${nomeSeguro}-${timestamp}.webp`;

    const { error: erroUpload } = await supabase.storage
      .from('cardapio')
      .upload(caminhoArquivo, blob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!erroUpload) {
      const { data: publicUrlData } = supabase.storage
        .from('cardapio')
        .getPublicUrl(caminhoArquivo);

      if (publicUrlData?.publicUrl) {
        return {
          sucesso: true,
          url: publicUrlData.publicUrl,
          mensagem: 'Imagem enviada e armazenada na nuvem com sucesso!',
          armazenadoEmNuvem: true,
        };
      }
    }

    // 5. Se o bucket não existir ou a chave de API não tiver permissão no storage,
    // retorna a imagem comprimida otimizada para não travar o cliente, com aviso
    console.warn(
      'Supabase Storage bucket "cardapio" não acessível. Utilizando imagem comprimida otimizada WebP.',
      erroUpload
    );

    return {
      sucesso: true,
      url: dataUrl,
      mensagem:
        'Imagem otimizada em WebP com sucesso! (Para armazenamento permanente na nuvem, configure o bucket "cardapio" no Supabase).',
      armazenadoEmNuvem: false,
    };
  } catch (err: any) {
    console.error('Erro ao processar imagem:', err);
    return {
      sucesso: false,
      url: '',
      mensagem: err?.message || 'Falha ao processar e comprimir imagem.',
      armazenadoEmNuvem: false,
    };
  }
}
