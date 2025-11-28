/**
 * @author 구희원
 * @description 이미지 로드 훅
 */

import { useState, useEffect } from "react";

/**
 * 이미지 로드 훅
 * @param {string} src - 이미지 소스 URL
 * @returns {HTMLImageElement | null} 로드된 이미지 객체 (로드 전에는 null)
 */
export function useImageLoad(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
    return () => {
      img.onload = null;
    };
  }, [src]);
  return image;
}
