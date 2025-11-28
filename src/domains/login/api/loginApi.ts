/**
 * @author 구희원
 * @description 로그인 API 호출 모듈
 *
 * - 서버에 로그인 요청을 보내고 Access Token 발급
 * - 반환된 데이터는 LoginResponse 타입으로 변환
 * - Axios 인스턴스(@api/client) 사용
 */

import client from "@api/client";
import type { LoginRequest, LoginResponse } from "../types/login";

/**
 * API 응답 타입 정의
 */
interface LoginApiResponse {
  status_code: number;
  status_message: string;
  result: LoginResponse;
}

/**
 * 로그인 요청 함수
 *
 * @param {LoginRequest} data - 로그인 요청 데이터 (username, password 등)
 * @returns {Promise<LoginResponse>} 로그인 성공 시 반환되는 사용자 정보 및 토큰
 *
 * @example
 * const loginData = { username: "user1", password: "1234" };
 * const result = await loginApi(loginData);
 * console.log(result.accessToken);
 */
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  console.log("Using client:", client.defaults.withCredentials);

  const response = await client.post<LoginApiResponse>("/auth/login", data);

  // API의 result 필드만 반환
  return response.data.result;
};
