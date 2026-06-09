// 백엔드 DocResponse와 1:1
export interface DocResponse {
  doc_id: number;
  file_name: string | null;
  category: string | null;
  created_at: string | null;
  user_id: number;
  job_status: string | null;   // doc.status로 합쳤으면 status로
}