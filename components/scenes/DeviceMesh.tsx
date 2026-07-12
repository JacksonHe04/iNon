import React from 'react';
import type { DeviceMeta } from './devices/types';
import { LaptopMesh } from './devices/LaptopMesh';
import { PhoneMesh } from './devices/PhoneMesh';
import { TabletMesh } from './devices/TabletMesh';

interface DeviceMeshProps {
  device: DeviceMeta;
  active: boolean;
  onSelect: (detail: DeviceMeta['detail']) => void;
}

export default function DeviceMesh({ device, active, onSelect }: DeviceMeshProps) {
  switch (device.type) {
    case 'laptop':
      return <LaptopMesh device={device} active={active} onSelect={onSelect} />;
    case 'phone':
      return <PhoneMesh device={device} active={active} onSelect={onSelect} />;
    case 'tablet':
      return <TabletMesh device={device} active={active} onSelect={onSelect} />;
    default:
      return null;
  }
}
export type { DeviceMeta };
