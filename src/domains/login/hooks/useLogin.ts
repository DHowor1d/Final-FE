/**
 * @author 김대호
 * @description 로그인 훅 - 로그인 처리를 위한 React Query mutation hook
 * 로그인 API를 호출하고 성공 시 인증 상태를 스토어에 저장하고 대시보드로 리다이렉트
 * 실패 시 에러 로그5 및 사용자에게 피드백 표시
 */

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { loginApi } from "../api/loginApi";
import type { LoginRequest } from "../types/login";

/**
 * @function useLogin
 * @description 로그인 mutation hook - 로그인 요청 처리 및 네비게이션
 * @returns {UseMutationResult} React Query mutation 객체
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
