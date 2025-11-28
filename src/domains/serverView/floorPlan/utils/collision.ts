/**
 * @author 최산하
 */
import type { Asset } from '../types';

export const checkCollision = (
  targetAsset: Omit<Asset, 'id'>,
  allAssets: Asset[],
): boolean => {
  for (const asset of allAssets) {
    if (asset.layer !== targetAsset.layer) {
      continue;
    }
    if (
      targetAsset.gridX < asset.gridX + asset.widthInCells &&
      targetAsset.gridX + targetAsset.widthInCells > asset.gridX &&
      targetAsset.gridY < asset.gridY + asset.heightInCells &&
      targetAsset.gridY + targetAsset.heightInCells > asset.gridY
    ) {
      return true;
    }
  }
  return false;
};