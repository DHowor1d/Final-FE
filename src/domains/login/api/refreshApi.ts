/**
 * @author 구희원
 * @description Access Token 갱신 API 호출 유틸리티
 *
 * - 서버에 Refresh Token 기반 요청
 * - 새 Access Token을 반환
 */

import client from "@api/client";

/**
 * @interface RefreshApiResponse
 * @description Refresh API 응답 타입
 * @property {number} status_code - 상태 코드
 * @property {string} status_message - 상태 메시지
 * @property {{ accessToken: string }} result - 새로 발급된 Access Token
 */
interface RefreshApiResponse {
  status_code: number;
  status_message: string;
  result: {
    accessToken: string;
  };
}

/**
 * @function refreshTokenApi
 * @description Refresh Token으로 새로운 Access Token 발급
 * @returns {Promise<string>} - 새 Access Token
 */
export const refreshTokenApi = async (): Promise<string> => {
  const response = await client.post<RefreshApiResponse>("/auth/refresh");
  return response.data.result.accessToken;
};
