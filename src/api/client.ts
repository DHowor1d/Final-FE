/**
 * @author 김대호
 * @description API 클라이언트 설정 - axios 기반 HTTP 클라이언트
 * Access Token을 메모리에 저장하고 요청에 자동 포함
 * Refresh Token은 HttpOnly 쿠키로 관리하여 보안 강화
 * 401 에러 발생 시 자동으로 토큰 갱신 시도하는 인터셉터 포함
 * 토큰 갱신 실패 시 로그인 페이지로 자동 리다이렉트
 */

import axios from "axios";

// const BASE_URL = "http://localhost:8080/api";
export const BASE_URL = "https://api.serverway.shop/api";

/**
 * Access Token을 메모리에 저장하기 위한 변수 (새로고침 시 초기화됨)
 * HttpOnly 쿠키로 Refresh Token을 관리하는 구조이므로 Access Token만 메모리 관리
 */
let accessTokenInMemory: string | null = null;

/**
 * @function setAccessToken
 * @description Access Token을 메모리에 저장
 * @param {string | null} token - 저장할 Access Token
 */
export const setAccessToken = (token: string | null) => {
  accessTokenInMemory = token;
};

/**
 * @function getAccessToken
 * @description 메모리에서 Access Token 가져오기
 * @returns {string | null} 저장된 Access Token
 */
export const getAccessToken = () => accessTokenInMemory;

/**
 * @constant client
 * @description axios 인스턴스 - 모든 API 요청에 사용
 */
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Refresh Token(HttpOnly Cookie) 자동 전송
});

/**
 * 요청 인터셉터
 * - In-Memory Access Token이 존재하면 Authorization 헤더 자동 추가
 */
client.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory) {
      config.headers["Authorization"] = `Bearer ${accessTokenInMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 *
 * - 401(Unauthorized) 발생 시 Refresh Token을 사용해 토큰 재발급 시도
 * - 재발급 성공 시 자동으로 원래 요청 재시도
 * - 실패 시 Access Token 삭제 및 메인 페이지로 리다이렉트
 */
client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // 401 + 재시도한 적 없는 요청만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token은 HttpOnly 쿠키로 자동 포함됨
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;

        // 새 Access Token 메모리에 저장
        setAccessToken(newToken);

        // 원래 요청에 새로운 토큰 적용
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return client(originalRequest);
      } catch (error) {
        console.error("Token refresh failed:", error);

        // 토큰 삭제 및 로그아웃 처리
        setAccessToken(null);
        window.location.href = "/";

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
