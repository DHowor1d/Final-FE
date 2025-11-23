import axios from "axios";

// const BASE_URL = "http://localhost:8080/api";
export const BASE_URL = "https://api.serverway.shop/api";

// 메모리에 토큰 저장
let accessTokenInMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenInMemory = token;
};

export const getAccessToken = () => accessTokenInMemory;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // HttpOnly 쿠키 전송 (Refresh Token)
});

// 요청 인터셉터
client.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory) {
      config.headers["Authorization"] = `Bearer ${accessTokenInMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token은 HttpOnly 쿠키로 자동 전송됨
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;
        setAccessToken(newToken); // 메모리에 저장

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (error) {
        console.error("Token refresh failed:", error);
        setAccessToken(null);
        window.location.href = "/";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
