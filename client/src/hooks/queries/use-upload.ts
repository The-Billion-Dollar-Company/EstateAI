import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

async function getSignature(): Promise<CloudinarySignature> {
  const res = await api.get<ApiResponse<CloudinarySignature>>('/upload/signature');
  return res.data.data;
}

/** Upload a file directly to Cloudinary using a server-side signed request. */
export async function uploadToCloudinary(file: File): Promise<string> {
  const sig = await getSignature();
  const form = new FormData();
  form.append('file', file);
  form.append('timestamp', String(sig.timestamp));
  form.append('api_key', sig.apiKey);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = (await res.json()) as CloudinaryUploadResult;
  return data.secure_url;
}

export interface PdfUploadResult {
  pdfId: string;
  filename: string;
  sizeBytes: number;
}

/** Upload a PDF to the server and get back a pdfId for AI chat. */
export function useUploadPdf(): UseMutationResult<PdfUploadResult, unknown, File> {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post<ApiResponse<PdfUploadResult>>('/upload/pdf', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
  });
}
