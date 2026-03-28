import { ProductHeader } from '../../component/product-header';
import { ProductImages } from '../../component/productImages';
import { ProductTabs } from '../../component/productTab';
import { ProductBasicTab } from '../../component/basicTab';
import { ProductDescriptionTab } from '../../component/descriptionTab';
import { ProductSellingTab } from '../../component/sellingTab';
import { ProductShippingTab } from '../../component/shippingTab';
import { ProductActions } from '../../component/ActionButton';
import { useState } from 'react';
export default function AddProductPage() {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <main>
      <ProductHeader />

      <div className="grid grid-cols-4 gap-6">
        <ProductImages />

        <div className="col-span-3">
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === 'basic' && <ProductBasicTab />}
          {activeTab === 'description' && <ProductDescriptionTab />}
          {activeTab === 'selling' && <ProductSellingTab />}
          {activeTab === 'shipping' && <ProductShippingTab />}

          <ProductActions />
        </div>
      </div>
    </main>
  );
}