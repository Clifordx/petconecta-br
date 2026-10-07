import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Converts a File object to the format required by the Gemini API
 */
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if the uploaded image is a valid Brazilian ID (CNH, RG, or CPF)
 * Returns true if valid, false if not.
 */
export async function validateDocumentWithAI(file: File): Promise<{ isValid: boolean; message: string }> {
  if (!genAI) {
    console.warn('Gemini API key is not configured. Skipping AI validation.');
    return { isValid: true, message: 'Validação de IA pulada (chave não configurada).' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
    Você é um sistema rigoroso de segurança de uma ONG. 
    Sua tarefa é analisar a imagem fornecida e determinar se ela é uma foto legível de um documento de identificação brasileiro válido.
    
    Tipos de documentos aceitos:
    - CNH (Carteira Nacional de Habilitação)
    - RG (Carteira de Identidade)
    - CPF (Cartão de CPF físico ou digital)
    
    Regras:
    1. Se for claramente um documento de identidade brasileiro, retorne um JSON exato: {"isValid": true, "message": "Documento verificado com sucesso."}
    2. Se a imagem NÃO for um documento (ex: foto de cachorro, paisagem, objeto aleatório, selfie sem segurar documento), retorne: {"isValid": false, "message": "A imagem não parece ser um documento de identificação válido (CNH, RG ou CPF)."}
    3. Se a imagem estiver extremamente borrada a ponto de ser ilegível, retorne: {"isValid": false, "message": "O documento está muito borrado. Por favor, envie uma foto mais nítida."}
    
    Retorne APENAS o JSON puro, sem formatação markdown ou crases.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      return { isValid: false, message: 'Erro ao analisar o documento.' };
    }
  } catch (error) {
    console.error('Error validating document:', error);
    return { isValid: false, message: 'Falha na comunicação com o sistema de verificação.' };
  }
}
