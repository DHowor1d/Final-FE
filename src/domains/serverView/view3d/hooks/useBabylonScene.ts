/**
 * @author 김대호
 * @description Babylon.js 씬 초기화 및 관리 훅 - 3D 렌더링 엔진과 씬을 설정
 * Babylon.js Engine과 Scene을 생성하고 카메라, 조명을 초기화
 * 아이소메트릭 뷰를 위한 ArcRotateCamera 설정 (상단에서 비스듬히 내려다보는 시점)
 * 렌더 루프 관리 및 윈도우 리사이즈 이벤트 처리
 * 컴포넌트 언마운트 시 엔진과 씬을 정리하여 메모리 누수 방지
 */

import { useRef, useEffect, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color4 } from '@babylonjs/core';
import { CAMERA_CONFIG } from '../../constants/config';
import type { GridConfig } from '../../types';

interface UseBabylonSceneParams {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gridConfig: GridConfig;
  isLoading?: boolean;
}

/**
 * @function useBabylonScene
 * @description Babylon.js 씬 초기화 및 관리 훅
 * @param {UseBabylonSceneParams} params - canvas ref, 그리드 설정, 로딩 상태
 * @returns {Object} 씬 객체, 씬 준비 상태, 카메라 리셋 함수
 */
export function useBabylonScene({ canvasRef, gridConfig, isLoading = false }: UseBabylonSceneParams) {
  const engineRef = useRef<Engine | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const renderLoopRef = useRef<boolean>(true);

  // 씬 초기화
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    // 엔진 생성
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // 씬 생성
    const newScene = new Scene(engine);
    newScene.clearColor = new Color4(0, 0, 0, 0); // 완전 투명
    setScene(newScene);

    // 카메라 생성 (아이소메트릭 뷰)
    const camera = new ArcRotateCamera(
      'camera',
      CAMERA_CONFIG.alpha,
      CAMERA_CONFIG.beta,
      CAMERA_CONFIG.radius,
      new Vector3(
        (gridConfig.columns * gridConfig.cellSize) / 2,
        0,
        (gridConfig.rows * gridConfig.cellSize) / 2
      ),
      newScene
    );

    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = CAMERA_CONFIG.wheelPrecision;
    camera.panningSensibility = CAMERA_CONFIG.panningSensibility;
    camera.lowerRadiusLimit = CAMERA_CONFIG.lowerRadiusLimit;
    camera.upperRadiusLimit = CAMERA_CONFIG.upperRadiusLimit;
    camera.lowerBetaLimit = CAMERA_CONFIG.lowerBetaLimit;
    camera.upperBetaLimit = CAMERA_CONFIG.upperBetaLimit;

    // 조명 생성
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), newScene);
    light.intensity = 0.8;

    const light2 = new HemisphericLight('light2', new Vector3(0, -1, 0), newScene);
    light2.intensity = 0.3;

    setIsSceneReady(true);

    // 렌더링 루프
    renderLoopRef.current = true;
    engine.runRenderLoop(() => {
      if (renderLoopRef.current) {
        newScene.render();
      }
    });

    // 리사이즈 핸들러
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderLoopRef.current = false;
      window.removeEventListener('resize', handleResize);
      
      if (newScene) {
        newScene.dispose();
      }
      if (engine) {
        engine.stopRenderLoop();
        engine.dispose();
      }
      
      setScene(null);
      setIsSceneReady(false);
    };
  }, [canvasRef, gridConfig.columns, gridConfig.rows, gridConfig.cellSize, isLoading]);

  // 렌더링 일시정지/재개
  const pauseRendering = () => {
    renderLoopRef.current = false;
  };

  const resumeRendering = () => {
    renderLoopRef.current = true;
  };

  return {
    scene,
    engine: engineRef.current,
    isSceneReady,
    pauseRendering,
    resumeRendering,
  };
}
