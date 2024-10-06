import React from 'react';
import { Tabs } from 'antd';
import BrightWatermark from './brightWatermark';
import SpatialBinarization from './spatialBinarization';
import SpatialBinarization1 from './spatialBinarization1';
import DCTWatermark from './dctWatermark';
import type { TabsProps } from 'antd';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: '明水印',
    children: <BrightWatermark />,
  },
  {
    key: '2',
    label: '空域二值化图像水印',
    children: <SpatialBinarization />,
  },
  {
    key: '3',
    label: '空域二值化图像水印2',
    children: <SpatialBinarization1 />,
  },
  {
    key: '4',
    label: '变换域DCT水印',
    children: <DCTWatermark />,
  },
];

const TabWrapper: React.FC = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default TabWrapper;