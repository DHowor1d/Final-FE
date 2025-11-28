/**
 * @author 최산하
 */
import { EQUIPMENT_PALETTE } from '../constants/config';
import type { EquipmentType } from '../types';
import { EquipmentPalette } from '@/shared/equipment';

interface EquipmentPalette3DProps {
  onAddEquipment: (type: EquipmentType) => void;
}

function EquipmentPalette3D({ onAddEquipment }: EquipmentPalette3DProps) {
  const handleAddEquipment = (type: string) => {
    onAddEquipment(type as EquipmentType);
  };

  return (
    <EquipmentPalette
      items={EQUIPMENT_PALETTE}
      onAddEquipment={handleAddEquipment}
    />
  );
}

export default EquipmentPalette3D