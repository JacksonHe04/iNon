'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { TextInput, StringListEditor, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Laptop } from 'lucide-react';

export default function ProductsEditor({ initialData }: { initialData: ReadmeData }) {
  const [products, setProducts] = useState(initialData.products);
  const { saveStatus, errorMessage } = useSectionSave('products', products);

  return (
    <EditorSectionCard
      title="7. 硬件设备与产品推荐 (Products)"
      description="管理个人电子设备清单 (EDC)、喜爱的软件产品、推荐产品与品牌"
      icon={Laptop}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="space-y-3 pb-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">我的硬件设备 My Hardware</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            label="手机 Phone"
            value={products.my_hardware?.phone || ''}
            onChange={(val) =>
              setProducts({ ...products, my_hardware: { ...products.my_hardware, phone: val } })
            }
          />
          <TextInput
            label="电脑 Computer"
            value={products.my_hardware?.computer || ''}
            onChange={(val) =>
              setProducts({ ...products, my_hardware: { ...products.my_hardware, computer: val } })
            }
          />
          <TextInput
            label="平板 Tablet"
            value={products.my_hardware?.tablet || ''}
            onChange={(val) =>
              setProducts({ ...products, my_hardware: { ...products.my_hardware, tablet: val } })
            }
          />
          <TextInput
            label="手表 Smartwatch"
            value={products.my_hardware?.smartwatch || ''}
            onChange={(val) =>
              setProducts({ ...products, my_hardware: { ...products.my_hardware, smartwatch: val } })
            }
          />
        </div>
        <StringListEditor
          label="耳机 Headphones"
          value={products.my_hardware?.headphones || []}
          onChange={(val) =>
            setProducts({ ...products, my_hardware: { ...products.my_hardware, headphones: val } })
          }
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="最喜爱的产品 Favorite Products"
          items={products.favorite_products}
          onChange={(next) => setProducts({ ...products, favorite_products: next })}
          createItem={() => ({ name: '', link: '', intro: '', tags: [], image_url: '' })}
          getItemTitle={(item) => item.name || '产品名称'}
          fields={[
            { key: 'name', label: '产品名称' },
            { key: 'link', label: '产品链接' },
            { key: 'intro', label: '简短介绍', type: 'textarea' },
            { key: 'tags', label: '标签', type: 'string-list' },
            { key: 'image_url', label: '产品配图 URL', type: 'image' },
          ]}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="推荐产品 Recommended Products"
          items={products.recommended_products}
          onChange={(next) => setProducts({ ...products, recommended_products: next })}
          createItem={() => ({ name: '', link: '', intro: '', tags: [], image_url: '' })}
          getItemTitle={(item) => item.name || '产品名称'}
          fields={[
            { key: 'name', label: '产品名称' },
            { key: 'link', label: '产品链接' },
            { key: 'intro', label: '简短介绍', type: 'textarea' },
            { key: 'tags', label: '标签', type: 'string-list' },
            { key: 'image_url', label: '产品配图 URL', type: 'image' },
          ]}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="喜爱品牌 Favorite Brands"
          items={products.favorite_brands}
          onChange={(next) => setProducts({ ...products, favorite_brands: next })}
          createItem={() => ({ name: '', link: '', intro: '', tags: [], image_url: '' })}
          getItemTitle={(item) => item.name || '品牌名称'}
          fields={[
            { key: 'name', label: '品牌名称' },
            { key: 'link', label: '品牌官网' },
            { key: 'intro', label: '品牌介绍', type: 'textarea' },
            { key: 'tags', label: '标签', type: 'string-list' },
            { key: 'image_url', label: '品牌配图 / Logo URL', type: 'image' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
