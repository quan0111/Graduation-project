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
  
  // Form state for API integration
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  // Build form data for submission
  const formData = {
    name: productName,
    description,
    price,
    stock,
    category_id: categoryId,
    images,
  };

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

          {activeTab === 'basic' && (
            <ProductBasicTab
              productName={productName}
              setProductName={setProductName}
              category={category}
              setCategory={setCategory}
              setCategoryId={setCategoryId}
            />
          )}
          {activeTab === 'description' && (
            <ProductDescriptionTab
              description={description}
              setDescription={setDescription}
            />
          )}
          {activeTab === 'selling' && (
            <ProductSellingTab
              price={price}
              setPrice={setPrice}
              stock={stock}
              setStock={setStock}
            />
          )}
          {activeTab === 'shipping' && <ProductShippingTab />}

          <ProductActions formData={formData} />
        </div>
      </div>
    </main>
  );
}