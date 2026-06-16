// 백엔드 DocResponse와 1:1
export interface DocResponse {
  doc_id: number;
  file_name: string | null;
  category: string | null;
  created_at: string | null;
  user_id: number;
  job_status: string | null;   // doc.status로 합쳤으면 status로
}

export interface DocDetailResponse{
  doc_id: number;
  file_name: string;
  category: string | "기타";
  created_at: string | null;
  user_id: number;
  job_status: string; 
  content_sum: string;
  content_full: string;
  file_type: string;
  updated_at: string;
}

export interface DocUpdateParams {
  title?: string;
  category?: string;
  summary?: string;
}

// UI 목록용 (toDocItem 변환 결과)
export interface DocItem {
  id: number;
  title: string;
  category: string;
  date: string;
  status: string;
}

// UI 상세용 (toDocDetailItem 변환 결과)
export interface DocDetailItem {
  id: number;
  title: string;
  category: string;
  date: string;
  status: string;
  summary: string;
  content: string;
  fileType: string;
}