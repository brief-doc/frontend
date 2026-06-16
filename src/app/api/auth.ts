import { API_BASE_URL } from "../../lib/api";

export interface LoginRequest {
    email: string;
    password: string;
}


export async function signupAPI(email: string, name: string, roles?: string[]) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email,
            password: "000000",
            name,
            roles
        }),
    });

    if (!response.ok) {
        let detailMessage = "회원가입 실패";
        try {
            const error = await response.json();
            const detail = error.detail;
            if (Array.isArray(detail)) {
                const emailError = detail.find((d: any) =>
                    d.loc?.includes("email") || d.type?.includes("email")
                );
                detailMessage = emailError ? "이메일 형식이 올바르지 않습니다." : "회원가입 실패";
            } else if (typeof detail === "string") {
                detailMessage = detail;
            }
        } catch {
            const text = await response.text();
            if (text) {
                detailMessage = text;
            }
        }
        throw new Error(detailMessage);
    }

    return response.json();
}

export async function getMeAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (!data.authenticated) return null;
        return data;
    } catch {
        return null;
    }
}



export async function loginAPI(data: LoginRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // 쿠키 수신을 위해 필수
    });

    const result = await response.json();

    if (!response.ok) {
        const detail = result.detail;
        if (Array.isArray(detail)) {
            const emailError = detail.find((d: any) =>
                d.loc?.includes("email") || d.type?.includes("email")
            );
            throw new Error(emailError ? "이메일 형식이 올바르지 않습니다." : "로그인에 실패했습니다.");
        }
        throw new Error(typeof detail === "string" ? detail : "로그인에 실패했습니다.");
    }

}

export async function logoutAPI(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // 쿠키 전송을 위해 필수
    });
}

export async function changePasswordAPI(
    email: string,
    userId: number,
    currentPassword: string,
    newPassword: string
) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email,
            userId,
            current_password: currentPassword,
            new_password: newPassword,
        }),
    });

    if (!response.ok) {
        let message = "비밀번호 변경에 실패했습니다.";
        try {
            const err = await response.json();
            if (typeof err.detail === "string") message = err.detail; // 예: "현재 비밀번호가 올바르지 않습니다"
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }
    return response.json();
}

export interface UserListItem {
    id: number;
    email: string;
    name: string;
    roles: string[];
    user_login: string | null;
    user_create: string | null;
}

export async function getUsersAPI(): Promise<UserListItem[]> {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "사용자 목록을 불러오지 못했습니다.");
    }

    return response.json();
}

// 회원 비밀번호 초기화
export async function resetUserPasswordAPI(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "암호 초기화에 실패했습니다.");
    }
}

export async function forceLogoutUserAPI(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/force-logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "로그아웃 처리에 실패했습니다.");
    }
}