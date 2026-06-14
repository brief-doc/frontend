import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationRead,
  subscribeSSE,
  linkToRoute,
  relativeTime,
  type NotificationOut,
} from "../api/notification";

export interface NotificationItem {
  id: number;
  message: string;
  time: string;
  unread: boolean;
  link: string | null;
}

/**
 * 알림 상태를 관리하는 공통 훅.
 * - 마운트 시 초기 목록을 API에서 로드
 * - SSE 구독으로 실시간 수신
 * - latest: 가장 최근에 수신된 알림 (컴포넌트가 SSE 이벤트에 반응할 때 활용)
 */
export function useNotifications() {
  const [items, setItems] = useState<NotificationOut[]>([]);
  const [latest, setLatest] = useState<NotificationOut | null>(null);

  // 초기 목록 로드
  useEffect(() => {
    getNotifications(0, 20)
      .then((res) => setItems(res.items))
      .catch(() => {});
  }, []);

  // SSE 실시간 구독
  useEffect(() => {
    const es = subscribeSSE((noti) => {
      setItems((prev) => [noti, ...prev]);
      setLatest(noti);
    });
    return () => es.close();
  }, []);

  // 읽음 처리
  const markRead = useCallback((notiId: number) => {
    markNotificationRead(notiId)
      .then(() =>
        setItems((prev) =>
          prev.map((n) => (n.noti_id === notiId ? { ...n, is_read: true } : n))
        )
      )
      .catch(() => {});
  }, []);

  // Header/NotificationDropdown 에서 사용하는 형태로 변환
  const notifications: NotificationItem[] = items.map((n) => ({
    id: n.noti_id,
    message: n.message,
    time: relativeTime(n.created_at),
    unread: !n.is_read,
    link: linkToRoute(n.link),
  }));

  return { notifications, markRead, latest };
}
