export type DeviceDetail = {
  title: string;
  description: string;
  tags?: string[];
  link?: string;
};

export type DeviceMeta = {
  id: string;
  type: 'laptop' | 'phone' | 'tablet';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  detail: DeviceDetail;
};
