/**
 * @author dhowor1d
 * @description 로그인 페이지 - 사용자 인증을 처리하는 메인 로그인 페이지
 * 이메일 형식 아이디와 비밀번호를 입력받아 서버 인증 수행
 * 한글 입력 방지 및 실시간 유효성 검사 기능 포함
 * 네트워크 애니메이션과 배경 효과로 현대적인 UI 제공
 */

import { useState } from "react";
import AnimationBackground from "./components/AnimationBackground";
import Input from "./components/Input";
import Button from "./components/Button";
import EmailIcon from "./assets/email.svg";
import PasswordIcon from "./assets/password.svg";
import "./css/LoginPage.css";
import NetworkAnimation from "./components/NetworkAnimation";
import { motion } from "framer-motion";
import {
  validateEmail,
  validatePassword,
  hasKorean,
  removeKorean,
} from "./utils/loginValidation";
import { useLogin } from "./hooks/useLogin";
import LoadingSpinner from "@/shared/loading/LoadingSpinner";

/**
 * @function LoginPage
 * @description 로그인 페이지 컴포넌트 - 사용자 인증 처리
 * @returns {JSX.Element} 로그인 페이지 UI
 */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const mutation = useLogin();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (hasKorean(value)) {
      setEmailError("영문과 숫자만 입력 가능합니다.");
    } else {
      setEmailError("");
    }
    const filteredValue = removeKorean(value);
    setEmail(filteredValue);
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setEmailError("");
    setPasswordError("");

    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    mutation.mutate({
      userName: email,
      password: password,
    });
  };

  return (
    <div className="login-page">
      {mutation.isPending && <LoadingSpinner message="로그인 중..." />}
      <AnimationBackground />
      <div className="login-container">
        <div className="login-form-container">
          <img src="/logo.svg" alt="logo" className="login-logo" />
          <form className="login-form" onSubmit={handleLogin}>
            <Input
              label="아이디"
              id="email"
              placeholder="아이디를 입력하세요."
              type="text"
              value={email}
              onChange={handleEmailChange}
              icon={<img src={EmailIcon} alt="email" />}
              error={emailError}
              disabled={mutation.isPending}
            />
            <Input
              label="비밀번호"
              id="password"
              placeholder="비밀번호를 입력하세요."
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<img src={PasswordIcon} alt="password" />}
              error={passwordError}
              disabled={mutation.isPending}
            />
            {mutation.isError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                로그인 실패: {mutation.error?.message || "다시 시도해주세요."}
              </div>
            )}
            <Button text="로그인" disabled={mutation.isPending} />
          </form>
        </div>
        <div className="rotating-logo-container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="hero-text-gradient">Serverway</span>
            </motion.div>

            <motion.div
              className="hero-subtext"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              언제 어디서나 서버실을 모니터링하고
              <br />
              제어할 수 있는 통합 관리 솔루션
            </motion.div>
          </div>
          <div className="network-animation-wrapper">
            <NetworkAnimation />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
