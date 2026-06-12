import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast, { Toaster } from "react-hot-toast";
import { changePasswordAPI } from "../api/auth";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  email?: string;
  userId?: string | number;
}

export function PasswordChangeModal({ open, onClose, email, userId }: PasswordChangeModalProps) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.current) {
      toast.error("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (!email || userId === undefined || userId === null) {
      toast.error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePasswordAPI(
        email,
        Number(userId),
        passwords.current,
        passwords.new
      );
      toast.success("비밀번호가 변경되었습니다.");
      setPasswords({ current: "", new: "", confirm: "" });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <Toaster position="top-center" />
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>초기 비밀번호 변경</DialogTitle>
            <DialogDescription>
              보안을 위해 초기 비밀번호를 변경해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="현재 비밀번호 입력"
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="새 비밀번호 (최소 6자)"
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="비밀번호 확인"
                className="bg-input-background"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
