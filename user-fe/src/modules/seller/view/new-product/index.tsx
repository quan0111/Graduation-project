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

  // ===== BASIC =====
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  // ===== ATTRIBUTE =====
  const [attributes, setAttributes] = useState<any[]>([]);

  // ===== VARIANT =====
  const [variants, setVariants] = useState<any[]>([]);

  // ===== SHIPPING =====
  const [enableShipping, setEnableShipping] = useState(false);

  // ===== ERROR =====
  const [errors, setErrors] = useState<string[]>([]);

  // ================= VALIDATE =================

  const validateBasic = () => {
    const err = [];

    if (!productName) err.push("Thiếu tên sản phẩm");
    if (images.length < 3) err.push("Cần ít nhất 3 ảnh");

    return err;
  };

  const validateVariant = () => {
    const err = [];

    if (attributes.length > 0 && variants.length === 0) {
      err.push("Phải tạo variant");
    }

    if (variants.length > 0) {
      const prices = variants.map(v => v.price || 0);
      const max = Math.max(...prices);
      const min = Math.min(...prices);

      if (min > 0 && max / min > 5) {
        err.push("Giá chênh lệch không được quá 5 lần");
      }
    }

    if (enableShipping) {
      variants.forEach(v => {
        if (!v.weight) err.push("Thiếu cân nặng");
        if (!v.length) err.push("Thiếu kích thước");
      });
    }

    return err;
  };

  // ================= TAB CONTROL =================

  const handleChangeTab = (tab: string) => {
    let err: string[] = [];

    if (activeTab === "basic") {
      err = validateBasic();
    }

    if (activeTab === "selling") {
      err = validateVariant();
    }

    if (err.length > 0) {
      setErrors(err);
      return;
    }

    setErrors([]);
    setActiveTab(tab);
  };

  // ================= BUILD DATA =================

  const formData = {
    name: productName,
    description,
    category_id: categoryId,
    images,
    attributes,
    variants,
  };

  return (
    <main>
      <ProductHeader />

      {/* ERROR UI */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          {errors.map((e, i) => (
            <p key={i} className="text-red-500 text-sm">• {e}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <ProductImages images={images} setImages={setImages} />

        <div className="col-span-3">
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={handleChangeTab}
          />

          {activeTab === 'basic' && (
            <ProductBasicTab
              productName={productName}
              setProductName={setProductName}
              setCategoryId={setCategoryId}
              attributes={attributes}
              setAttributes={setAttributes}
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
              variants={variants}
              setVariants={setVariants}
              attributes={attributes}
              enableShipping={enableShipping}
            />
          )}

          {activeTab === 'shipping' && (
            <ProductShippingTab
              enableShipping={enableShipping}
              setEnableShipping={setEnableShipping}
            />
          )}

          <ProductActions formData={formData} />
        </div>
      </div>
    </main>
  );
}