/**
 * @author 구희원 김대호
 * @description Zustand 기반 인증 상태 관리 스토어
 *
 * - Access Token과 사용자 정보 관리
 * - 로그인, 로그아웃, 인증 상태 복원 기능 제공
 * - localStorage에는 보안상 토큰을 저장하지 않고 사용자 정보와 인증 상태만 저장
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
 * @description 인증 상태 및 관련 메서드 정의
 * @property {string | null} accessToken - 메모리에 저장된 Access Token
 * @property {User | null} user - 사용자 정보
 * @property {boolean} authenticated - 인증 여부
 * @property {(response: LoginResponse) => void} login - 로그인 처리
 * @property {() => void} logout - 로그아웃 처리
 * @property {() => Promise<void>} restoreAuth - 인증 상태 복원
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
 * @function useAuthStore
 * @description Zustand 인증 스토어 훅
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      authenticated: false,

      /**
       * 로그인 처리
       * - 메모리에 Access Token 저장
       * - 사용자 정보와 인증 상태 업데이트
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
       * 로그아웃 처리
       * - 메모리에서 Access Token 제거
       * - 사용자 정보 및 인증 상태 초기화
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
       * 인증 상태 복원
       * - localStorage에서 사용자 정보와 인증 상태 확인
       * - refresh token으로 새 Access Token 발급 시도
       * - 실패 시 로그아웃 처리
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
