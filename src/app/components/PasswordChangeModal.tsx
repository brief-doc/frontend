import { useState } from "react";
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

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ open, onClose }: PasswordChangeModalProps) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwords.new.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    alert("비밀번호가 변경되었습니다.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>초기 비밀번호 변경</DialogTitle>
            <DialogDescription>
              보안을 위해 초기 비밀번호를 변경해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-900">
                현재 비밀번호: <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono">000000</code>
              </p>
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
            <Button type="submit" className="w-full">
              비밀번호 변경
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
