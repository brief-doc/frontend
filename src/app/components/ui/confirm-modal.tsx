import React from "react";
import { Button } from "./button"; // 기존 프로젝트의 Button 컴포넌트 경로에 맞게 조절

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;          // 💡 모달 제목 (기본값 설정 가능)
  description?: string;    // 💡 모달 본문 (기본값 설정 가능)
  confirmText?: string;    // 💡 확인 버튼 텍스트
  cancelText?: string;     // 💡 취소 버튼 텍스트 (이 값이 없으면 버튼 1개만 노출)
  variant?: "destructive" | "default" | "primary"; // 💡 버튼 색상 스타일 선택용
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "확인", 
  description = "이 작업을 진행하시겠습니까?",
  confirmText = "확인",
  cancelText, // 💡 전달하지 않으면 자연스럽게 버튼 1개 모달이 됩니다.
  variant = "default",
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* 모달 박스 */}
      <div className="bg-background border border-border p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* 텍스트 영역 */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
        </div>

        {/* 버튼 영역 */}
        <div className={`flex gap-3 ${cancelText ? "grid grid-cols-2" : "justify-center"}`}>
          {/* 💡 취소 텍스트가 있을 때만 '취소' 버튼을 렌더링 (버튼 2개 모드) */}
          {cancelText && (
            <Button variant="outline" onClick={onClose} className="w-full">
              {cancelText}
            </Button>
          )}
          
          {/* 확인 버튼 */}
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"} 
            onClick={onConfirm} 
            className={cancelText ? "w-full" : "w-32"}
          >
            {confirmText}
          </Button>
        </div>

      </div>
    </div>
  );
}