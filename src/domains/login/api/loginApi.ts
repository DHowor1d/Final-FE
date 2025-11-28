/**
 * @author dhowor1d
 * @description 로그인 API - 사용자 인증을 처리하는 API 호출
 * 아이디와 비밀번호를 서버로 전송하여 인증 토큰 및 사용자 정보 반환
 * 응답은 API 표준 형식(status_code, status_message, result)을 따름
 */

import client from "@api/client";
import type { LoginRequest, LoginResponse } from "../types/login";

interface LoginApiResponse {
  status_code: number;
  status_message: string;
  result: LoginResponse;
}

/**
 * @function loginApi
 * @description 로그인 API 호출 - 사용자 인증 요청
 * @param {LoginRequest} data - 사용자 아이디와 비밀번호
 * @returns {Promise<LoginResponse>} 로그인 성공 시 Access Token 및 사용자 정보
 */
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  console.log("Using client:", client.defaults.withCredentials);
  const response = await client.post<LoginApiResponse>("/auth/login", data);
  return response.data.result;
};
