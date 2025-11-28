/**
 * @author 김대호
 * @description 인증 상태 관리 Zustand 스토어 - 사용자 로그인 상태와 토큰을 관리
 * Access Token은 메모리에만 저장하고, Refresh Token은 httpOnly 쿠키로 관리하여 보안 강화
 * 사용자 정보는 localStorage에 persist하여 페이지 새로고침 후에도 로그인 상태 유지
 * restoreAuth로 토큰 갱신 및 자동 로그인 복구 기능 제공
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse } from "../types/login";
import { setAccessToken } from "@api/client";
import { refreshTokenApi } from "../api/refreshApi";

/**
 * @typedef User
 * @description 로그인 응답에서 Access Token을 제외한 사용자 정보
 */
type User = Omit<LoginResponse, "accessToken">;

/**
 * @interface AuthStore
 * @description 인증 스토어 타입 정의 - 로그인 상태, 사용자 정보, 인증 관련 메서드
 */
interface AuthStore {
  accessToken: string | null;
  user: User | null;
  authenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  restoreAuth: () => void;
}

/**
 * @constant useAuthStore
 * @description 인증 상태를 관리하는 Zustand 스토어 - 로그인/로그아웃, 토큰 관리
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      authenticated: false,

      /**
       * @function login
       * @description 로그인 성공 시 토큰과 사용자 정보를 스토어에 저장
       * @param {LoginResponse} response - 로그인 API 응답 (액세스 토큰 및 사용자 정보)
       */
      login: (response) => {
        const { accessToken, ...user } = response;
        setAccessToken(accessToken);
        set({
          accessToken,
          user,
          authenticated: true,
        });
      },

      /**
       * @function logout
       * @description 로그아웃 시 모든 인증 정보를 제거하고 초기화
       */
      logout: () => {
        setAccessToken(null);
        set({
          accessToken: null,
          user: null,
          authenticated: false,
        });
      },

      /**
       * @function restoreAuth
       * @description 페이지 로드 시 localStorage의 인증 상태로부터 세션 복구
       * Refresh Token을 사용하여 새로운 Access Token 발급
       */
      restoreAuth: async () => {
        const state = get();
        if (state.authenticated && state.user) {
          try {
            const newAccessToken = await refreshTokenApi();
            setAccessToken(newAccessToken);
            set({ accessToken: newAccessToken });
          } catch (error) {
            console.error("Failed to restore auth:", error);
            set({
              accessToken: null,
              user: null,
              authenticated: false,
            });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // 보안을 위해 Access Token은 localStorage에 저장하지 않음
        user: state.user,
        authenticated: state.authenticated,
      }),
    }
  )
);
