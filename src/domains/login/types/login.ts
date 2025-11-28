/**
 * @author 구희원
 * @description 로그인 요청/응답 타입 정의
 */

/**
 * @interface LoginRequest
 * @description 로그인 API 호출 시 전송하는 데이터
 * @property {string} userName - 사용자 아이디
 * @property {string} password - 비밀번호
 */
export interface LoginRequest {
  userName: string;
  password: string;
}

/**
 * @interface LoginResponse
 * @description 로그인 API 응답 데이터
 * @property {string} accessToken - 인증용 액세스 토큰
 * @property {number} id - 사용자 고유 ID
 * @property {string} userName - 사용자 아이디
 * @property {string} name - 사용자 이름
 * @property {string} role - 사용자 역할
 * @property {string} companyName - 소속 회사 이름
 * @property {number} [companyId] - 소속 회사 ID (선택)
 */
export interface LoginResponse {
  accessToken: string;
  id: number;
  userName: string;
  name: string;
  role: string;
  companyName: string;
  companyId?: number;
}
