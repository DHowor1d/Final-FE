/**
 * @author 구희원
 * @description 로그인 API 연동 및 상태 관리 훅
 *
 * - React Query의 useMutation을 사용하여 로그인 요청 처리
 * - 로그인 성공 시 Zustand를 통해 인증 상태 갱신
 * - 로그인 성공 시 대시보드 페이지로 이동
 * - 로그인 실패 시 콘솔에 에러 출력
 */

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { loginApi } from "../api/loginApi";
import type { LoginRequest } from "../types/login";

/**
 * @function useLogin
 * @returns {Mutation<LoginResponse, unknown, LoginRequest>}
 *   - login: 로그인 요청 함수
 *   - isLoading, isError 등 React Query 상태 포함
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const mutation = useMutation({
    // 로그인 API 호출
    mutationFn: (data: LoginRequest) => loginApi(data),

    // 로그인 성공 시 처리
    onSuccess: (response) => {
      login(response); // Zustand 상태 업데이트
      navigate("/dashboard"); // 대시보드 페이지 이동
    },

    // 로그인 실패 시 처리
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  return mutation;
};
