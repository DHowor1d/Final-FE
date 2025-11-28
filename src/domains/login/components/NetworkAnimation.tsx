/**
 * @author 구희원
 * @description 네트워크 노드와 연결선을 애니메이션으로 시각화하는 컴포넌트
 *
 * - Framer Motion과 SVG를 활용하여 노드, 연결선, 입자 애니메이션 구현
 * - 노드의 크기, 색상, 위치 및 애니메이션 속성 정의
 * - 연결선(line)과 입자(particles) 애니메이션 포함
 * - 네트워크 그래프와 유사한 시각적 효과 제공
 */

import { motion } from "framer-motion";

/** 노드 설정 */
const nodes = [
  { cx: 100, cy: 100, r: 35, color: "#22c55e", delay: 0.1, duration: 2.2 },
  { cx: 250, cy: 80, r: 28, color: "#10b981", delay: 0.2, duration: 2.5 },
  { cx: 200, cy: 225, r: 32, color: "#10b981", delay: 0.3, duration: 2.7 },
  { cx: 350, cy: 200, r: 45, color: "#22c55e", delay: 0.4, duration: 2.0 },
  { cx: 450, cy: 120, r: 30, color: "#10b981", delay: 0.5, duration: 2.4 },
  { cx: 280, cy: 350, r: 28, color: "#10b981", delay: 0.6, duration: 2.6 },
  { cx: 500, cy: 280, r: 35, color: "#10b981", delay: 0.7, duration: 2.3 },
  { cx: 600, cy: 220, r: 40, color: "#22c55e", delay: 0.8, duration: 2.1 },
];

/** 연결선 설정 */
const lines = [
  { x1: 100, y1: 100, x2: 250, y2: 80, gradient: 1, delay: 0.1 },
  { x1: 100, y1: 100, x2: 200, y2: 225, gradient: 2, delay: 0.15 },
  { x1: 100, y1: 100, x2: 350, y2: 200, gradient: 1, delay: 0.2 },
  { x1: 250, y1: 80, x2: 200, y2: 225, gradient: 2, delay: 0.25 },
  { x1: 250, y1: 80, x2: 450, y2: 120, gradient: 1, delay: 0.3 },
  { x1: 250, y1: 80, x2: 350, y2: 200, gradient: 2, delay: 0.35 },
  { x1: 200, y1: 225, x2: 350, y2: 200, gradient: 1, delay: 0.4 },
  { x1: 200, y1: 225, x2: 280, y2: 350, gradient: 2, delay: 0.45 },
  { x1: 200, y1: 225, x2: 500, y2: 280, gradient: 1, delay: 0.5 },
  { x1: 350, y1: 200, x2: 450, y2: 120, gradient: 2, delay: 0.55 },
  { x1: 350, y1: 200, x2: 500, y2: 280, gradient: 1, delay: 0.6 },
  { x1: 350, y1: 200, x2: 600, y2: 220, gradient: 2, delay: 0.65 },
  { x1: 450, y1: 120, x2: 600, y2: 220, gradient: 1, delay: 0.7 },
  { x1: 450, y1: 120, x2: 500, y2: 280, gradient: 2, delay: 0.75 },
  { x1: 280, y1: 350, x2: 500, y2: 280, gradient: 1, delay: 0.8 },
  { x1: 500, y1: 280, x2: 600, y2: 220, gradient: 2, delay: 0.85 },
];

/** 입자 애니메이션 설정 */
const particles = [
  { path: "M100,100 L250,80", color: "#22c55e", duration: 2.5, begin: "0s" },
  { path: "M100,100 L200,225", color: "#10b981", duration: 3, begin: "0.3s" },
  { path: "M250,80 L350,200", color: "#22c55e", duration: 2.8, begin: "0.6s" },
  { path: "M200,225 L350,200", color: "#10b981", duration: 3.2, begin: "0.9s" },
  { path: "M350,200 L450,120", color: "#22c55e", duration: 2.6, begin: "1.2s" },
  { path: "M350,200 L500,280", color: "#10b981", duration: 3.1, begin: "1.5s" },
  { path: "M450,120 L600,220", color: "#22c55e", duration: 2.9, begin: "1.8s" },
  { path: "M500,280 L600,220", color: "#10b981", duration: 2.7, begin: "2.1s" },
];

/**
 * 네트워크 애니메이션 컴포넌트
 *
 * @returns {JSX.Element} 노드, 연결선, 입자 애니메이션이 포함된 SVG
 *
 * @example
 * <NetworkAnimation />
 */
function NetworkAnimation() {
  return (
    <div className="relative flex items-start justify-center px-8 -mt-8">
      <svg
        className="w-full h-full"
        viewBox="0 0 700 450"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 선 그라데이션 정의 */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 연결선 렌더링 */}
        {lines.map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`url(#lineGradient${line.gradient === 2 ? "2" : ""})`}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: line.delay }}
          />
        ))}

        {/* 노드 렌더링 */}
        {nodes.map((node, i) => {
          const innerR = node.r * 0.63;
          const coreR = node.r * 0.31;
          const minOpacity = node.color === "#22c55e" ? 0.6 : 0.5;
          const maxOpacity = node.color === "#22c55e" ? 0.9 : 0.8;

          return (
            <motion.g
              key={`node-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: node.delay }}
            >
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="none"
                stroke={node.color}
                strokeWidth="3"
                filter="url(#nodeGlow)"
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [minOpacity, maxOpacity, minOpacity],
                }}
                transition={{
                  duration: node.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: node.delay * 2,
                }}
                style={{
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  transformBox: "fill-box",
                }}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={innerR}
                fill={node.color}
                opacity={node.color === "#22c55e" ? 0.3 : 0.4}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={coreR}
                fill={node.color}
                opacity={node.color === "#22c55e" ? 0.8 : 0.9}
              />
            </motion.g>
          );
        })}

        {/* 입자 렌더링 */}
        {particles.map((particle, i) => (
          <motion.circle
            key={`particle-${i}`}
            r="4"
            fill={particle.color}
            opacity="0.9"
            filter="url(#nodeGlow)"
          >
            <animateMotion
              dur={`${particle.duration}s`}
              repeatCount="indefinite"
              path={particle.path}
              begin={particle.begin}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={`${particle.duration}s`}
              repeatCount="indefinite"
              begin={particle.begin}
            />
          </motion.circle>
        ))}
      </svg>
    </div>
  );
}

export default NetworkAnimation;
