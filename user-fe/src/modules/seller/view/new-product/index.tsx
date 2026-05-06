import { type ReactNode, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Package,
  ShieldAlert,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/modules/auth/api/get-auth-me";
import { useCreateProduct } from "@/modules/product/api/add-product";
import { useGetShopByOwnerId } from "@/modules/shop/api/myshop";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useUploadImage } from "@/modules/upload/api/upload-image";
import { apiClient } from "@/lib/api";

type WizardStep = "media" | "detail" | "selling" | "shipping";

type UploadedImage = {
  url: string;
  position: number;
  isPrimary: boolean;
};

type AttributeRow = {
  key: string;
  value: string;
};

type VariantGroup = {
  name: string;
  values: string[];
};

type VariantDraft = {
  key: string;
  name: string;
  optionMap: Record<string, string>;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  imageUrl: string;
};

type ShippingDraft = {
  weightMode: "per-variant" | "shop-default";
  packageLength: string;
  packageWidth: string;
  packageHeight: string;
  packageWeight: string;
  shippingNote: string;
};

type Category = {
  id: number;
  name: string;
  slug?: string | null;
};

const STEPS: Array<{ id: WizardStep; label: string; description: string }> = [
  { id: "media", label: "1. Hinh anh va ten", description: "Anh, ten san pham, nganh hang" },
  { id: "detail", label: "2. Thong tin chi tiet", description: "Thuoc tinh va mo ta" },
  { id: "selling", label: "3. Thong tin ban hang", description: "Phan loai, gia, kho" },
  { id: "shipping", label: "4. Van chuyen", description: "Thong tin tam thoi" },
];

export default function AddProductPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useMe();
  const { data: shop, isLoading: isShopLoading } = useGetShopByOwnerId({
    enabled: user?.role === "SELLER",
    retry: false,
    throwOnError: false as never,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["seller", "categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories");
      return response.data;
    },
  });

  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: createProduct, isPending: isSubmitting } = useCreateProduct();

  const [currentStep, setCurrentStep] = useState<WizardStep>("media");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [attributes, setAttributes] = useState<AttributeRow[]>([{ key: "", value: "" }]);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    { name: "Mau sac", values: [""] },
  ]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [shipping, setShipping] = useState<ShippingDraft>({
    weightMode: "per-variant",
    packageLength: "",
    packageWidth: "",
    packageHeight: "",
    packageWeight: "",
    shippingNote: "",
  });

  const filteredAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.key.trim() && attribute.value.trim()),
    [attributes],
  );

  const mediaErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Ten san pham la bat buoc.");
    if (!categoryId) errors.push("Ban phai chon nganh hang.");
    if (images.length < 3) errors.push("Can toi thieu 3 hinh anh.");
    return errors;
  }, [categoryId, images.length, name]);

  const detailErrors = useMemo(() => {
    const errors: string[] = [];
    if (filteredAttributes.length === 0) errors.push("Can it nhat 1 thuoc tinh chi tiet.");
    if (description.trim().length < 30) errors.push("Mo ta san pham phai tu 30 ky tu tro len.");
    return errors;
  }, [description, filteredAttributes.length]);

  const sellingErrors = useMemo(() => {
    const errors: string[] = [];
    if (variants.length === 0) errors.push("Can tao it nhat 1 bien the.");
    variants.forEach((variant, index) => {
      if (!variant.price || variant.price <= 0) errors.push(`Bien the ${index + 1} chua co gia hop le.`);
      if (variant.stock < 0) errors.push(`Bien the ${index + 1} co ton kho khong hop le.`);
      if (!variant.imageUrl) errors.push(`Bien the ${index + 1} chua gan anh.`);
    });
    return Array.from(new Set(errors));
  }, [variants]);

  const allErrorsByStep = {
    media: mediaErrors,
    detail: detailErrors,
    selling: sellingErrors,
    shipping: [] as string[],
  };

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file, index) =>
          uploadImage({ file, folder: "datn/products" }).then((result) => ({
            url: result.url,
            position: images.length + index + 1,
            isPrimary: images.length === 0 && index === 0,
          })),
        ),
      );

      setImages((current) => {
        const next = [...current, ...uploaded];
        if (!next.some((image) => image.isPrimary) && next[0]) {
          next[0] = { ...next[0], isPrimary: true, position: 1 };
        }
        return next.map((image, index) => ({
          ...image,
          position: index + 1,
          isPrimary: index === 0 ? image.isPrimary || true : image.isPrimary,
        }));
      });
      toast.success("Da tai hinh anh san pham");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong tai duoc hinh anh");
    }
  };

  const setCoverImage = (index: number) => {
    setImages((current) => {
      const selected = current[index];
      const rest = current.filter((_, imageIndex) => imageIndex !== index);
      return [selected, ...rest].map((image, imageIndex) => ({
        ...image,
        position: imageIndex + 1,
        isPrimary: imageIndex === 0,
      }));
    });
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, imageIndex) => ({
          ...image,
          position: imageIndex + 1,
          isPrimary: imageIndex === 0,
        })),
    );
  };

  const updateAttribute = (index: number, field: keyof AttributeRow, value: string) => {
    setAttributes((current) =>
      current.map((attribute, attributeIndex) =>
        attributeIndex === index ? { ...attribute, [field]: value } : attribute,
      ),
    );
  };

  const addAttribute = () => {
    setAttributes((current) => [...current, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes((current) => current.filter((_, attributeIndex) => attributeIndex !== index));
  };

  const updateGroupName = (index: number, value: string) => {
    setVariantGroups((current) =>
      current.map((group, groupIndex) => (groupIndex === index ? { ...group, name: value } : group)),
    );
  };

  const updateGroupValue = (groupIndex: number, valueIndex: number, value: string) => {
    setVariantGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) return group;
        return {
          ...group,
          values: group.values.map((item, currentValueIndex) =>
            currentValueIndex === valueIndex ? value : item,
          ),
        };
      }),
    );
  };

  const addGroup = () => {
    setVariantGroups((current) => [...current, { name: "", values: [""] }]);
  };

  const addGroupValue = (groupIndex: number) => {
    setVariantGroups((current) =>
      current.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex ? { ...group, values: [...group.values, ""] } : group,
      ),
    );
  };

  const removeGroup = (groupIndex: number) => {
    setVariantGroups((current) => current.filter((_, index) => index !== groupIndex));
  };

  const removeGroupValue = (groupIndex: number, valueIndex: number) => {
    setVariantGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) return group;
        return {
          ...group,
          values: group.values.filter((_, index) => index !== valueIndex),
        };
      }),
    );
  };

  const generateVariants = () => {
    const cleanGroups = variantGroups
      .map((group) => ({
        name: group.name.trim(),
        values: group.values.map((value) => value.trim()).filter(Boolean),
      }))
      .filter((group) => group.name && group.values.length > 0);

    if (cleanGroups.length === 0) {
      toast.error("Hay nhap it nhat 1 nhom phan loai va gia tri");
      return;
    }

    const existingMap = new Map(variants.map((variant) => [variant.key, variant]));

    const combine = (
      index: number,
      optionMap: Record<string, string>,
    ): Array<Record<string, string>> => {
      if (index >= cleanGroups.length) return [optionMap];
      const group = cleanGroups[index];
      return group.values.flatMap((value) =>
        combine(index + 1, { ...optionMap, [group.name]: value }),
      );
    };

    const combinations = combine(0, {});
    const nextVariants = combinations.map((optionMap) => {
      const key = cleanGroups.map((group) => `${group.name}:${optionMap[group.name]}`).join("|");
      const existing = existingMap.get(key);
      return {
        key,
        name: cleanGroups.map((group) => optionMap[group.name]).join(" / "),
        optionMap,
        sku: existing?.sku || "",
        price: existing?.price || 0,
        stock: existing?.stock || 0,
        weight: existing?.weight || 0,
        imageUrl: existing?.imageUrl || images[0]?.url || "",
      };
    });

    setVariants(nextVariants);
    toast.success("Da tao bang phan loai");
  };

  const updateVariant = (index: number, field: keyof VariantDraft, value: string | number) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const goNext = () => {
    const errors = allErrorsByStep[currentStep];
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const nextStep = STEPS[currentStepIndex + 1];
    if (nextStep) setCurrentStep(nextStep.id);
  };

  const goPrev = () => {
    const previousStep = STEPS[currentStepIndex - 1];
    if (previousStep) setCurrentStep(previousStep.id);
  };

  const handleSubmit = async () => {
    const finalErrors = [...mediaErrors, ...detailErrors, ...sellingErrors];
    if (finalErrors.length > 0) {
      toast.error(finalErrors[0]);
      return;
    }

    try {
      await createProduct({
        name: name.trim(),
        slug: slugify(name),
        categoryId: Number(categoryId),
        description: description.trim(),
        images: images.map((image, index) => ({
          url: image.url,
          position: index + 1,
          isPrimary: index === 0,
        })),
        attributes: filteredAttributes,
        variants: variants.map((variant, index) => ({
          name: variant.name,
          sku: variant.sku || `SKU-${slugify(name).toUpperCase()}-${index + 1}`,
          price: variant.price,
          stock: variant.stock,
          weight: shipping.weightMode === "per-variant" ? variant.weight : Number(shipping.packageWeight || 0),
          images: variant.imageUrl
            ? [
                {
                  url: variant.imageUrl,
                  position: 1,
                },
              ]
            : [],
        })),
      });

      toast.success("San pham da gui len admin o trang thai draft");
      navigate("/seller/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong tao duoc san pham");
    }
  };

  if (isUserLoading || (user?.role === "SELLER" && isShopLoading)) {
    return (
      <SellerDashboardLayout>
        <div className="rounded-3xl border bg-white p-8">Dang tai...</div>
      </SellerDashboardLayout>
    );
  }

  if (!user) {
    return (
      <SellerDashboardLayout>
        <AccessCard
          icon={<ShieldAlert className="size-6" />}
          title="Can dang nhap de them san pham"
          description="Ban can dang nhap truoc khi gui yeu cau mo shop va dang san pham."
          primaryLabel="Dang nhap"
          primaryHref="/login"
        />
      </SellerDashboardLayout>
    );
  }

  if (user.role !== "SELLER" || !shop) {
    return (
      <SellerDashboardLayout>
        <AccessCard
          icon={<Store className="size-6" />}
          title="Tai khoan chua co quyen seller"
          description="Hay gui yeu cau tro thanh nguoi ban. Sau khi duoc phe duyet, ban se vao seller dashboard va co the them san pham."
          primaryLabel="Mo shop ngay"
          primaryHref="/seller"
        />
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_44%,#ffedd5_100%)] p-6 shadow-sm ring-1 ring-orange-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-orange-700">
                <Package className="size-3.5" />
                Seller Product Wizard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Them san pham moi</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Nhap tung buoc giong luong dang san pham cua san thuong mai: hinh anh, chi tiet, phan loai ban hang va van chuyen.
                Khi submit, san pham se duoc gui len admin o trang thai draft de phe duyet.
              </p>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-orange-100">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Shop hien tai</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{shop.name}</p>
              <p className="text-sm text-slate-500">Chu shop: {user.fullName || user.email}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="space-y-4">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isDone = index < currentStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-orange-300 bg-orange-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isDone ? "bg-emerald-500 text-white" : isActive ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {isDone ? <CheckCircle2 className="size-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{step.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <Card className="border-0 bg-slate-950 text-white">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold">Rule duyet nhanh</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>Can toi thieu 3 anh va 1 anh bia.</li>
                  <li>Mo ta ro rang, thuoc tinh day du.</li>
                  <li>Moi bien the phai co gia, ton kho, anh.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            {currentStep === "media" && (
              <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                <CardHeader>
                  <CardTitle>Hinh anh, ten san pham va nganh hang</CardTitle>
                  <CardDescription>
                    Can it nhat 3 anh. Anh dau tien la anh bia va duoc uu tien hien thi ngoai trang chu.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/60 p-6">
                    <label className={`flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-orange-200 bg-white px-6 py-10 text-center transition hover:bg-orange-50 ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
                      <ImagePlus className="size-8 text-orange-500" />
                      <p className="mt-4 font-medium text-slate-900">Tai anh san pham len Cloudinary</p>
                      <p className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP. Tai nhieu file cung luc.</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleUploadFiles(event.target.files)}
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={image.url} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <img src={image.url} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                          {index === 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                              Anh bia
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="text-xs text-slate-500">Vi tri hien thi: {index + 1}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled={index === 0} onClick={() => setCoverImage(index)}>
                              Dat anh bia
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeImage(index)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Ten san pham">
                      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Vi du: Ao khoac bomber unisex" />
                    </Field>
                    <Field label="Nganh hang">
                      <select
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : "")}
                        className="h-10 w-full rounded-3xl border border-input bg-input/30 px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/40"
                      >
                        <option value="">Chon nganh hang</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <ValidationList errors={mediaErrors} />
                </CardContent>
              </Card>
            )}

            {currentStep === "detail" && (
              <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                <CardHeader>
                  <CardTitle>Thong tin chi tiet va mo ta</CardTitle>
                  <CardDescription>
                    Phan nay dung cho cac thuoc tinh san pham nhu chat lieu, thuong hieu, xuat xu... Sau do nhap mo ta day du.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {attributes.map((attribute, index) => (
                      <div key={`${attribute.key}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                          value={attribute.key}
                          onChange={(event) => updateAttribute(index, "key", event.target.value)}
                          placeholder="Thuoc tinh: Thuong hieu"
                        />
                        <Input
                          value={attribute.value}
                          onChange={(event) => updateAttribute(index, "value", event.target.value)}
                          placeholder="Gia tri: Local Brand"
                        />
                        <Button variant="ghost" onClick={() => removeAttribute(index)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addAttribute}>Them thuoc tinh</Button>
                  </div>

                  <Field label="Mo ta san pham">
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="min-h-52"
                      placeholder="Mo ta noi bat, chat lieu, doi tuong su dung, huong dan bao quan..."
                    />
                  </Field>
                  <ValidationList errors={detailErrors} />
                </CardContent>
              </Card>
            )}

            {currentStep === "selling" && (
              <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                <CardHeader>
                  <CardTitle>Thong tin ban hang va phan loai</CardTitle>
                  <CardDescription>
                    Tao cac nhom phan loai nhu mau sac, size, gioi tinh... Sau do sinh bang bien the va nhap gia, kho, anh cho tung loai.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {variantGroups.map((group, groupIndex) => (
                      <div key={`${group.name}-${groupIndex}`} className="rounded-[24px] border border-slate-200 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <Input
                            value={group.name}
                            onChange={(event) => updateGroupName(groupIndex, event.target.value)}
                            placeholder="Ten nhom: Mau sac, Size, Gioi tinh"
                          />
                          <Button variant="ghost" onClick={() => removeGroup(groupIndex)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {group.values.map((value, valueIndex) => (
                            <div key={`${group.name}-${valueIndex}`} className="flex gap-2">
                              <Input
                                value={value}
                                onChange={(event) => updateGroupValue(groupIndex, valueIndex, event.target.value)}
                                placeholder="Gia tri: Den, Trang, XL, Nam..."
                              />
                              <Button variant="ghost" onClick={() => removeGroupValue(groupIndex, valueIndex)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Button variant="outline" onClick={() => addGroupValue(groupIndex)}>
                            Them gia tri
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={addGroup}>Them nhom phan loai</Button>
                      <Button onClick={generateVariants}>Tao bang phan loai</Button>
                    </div>
                  </div>

                  {variants.length > 0 && (
                    <div className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 text-left text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-medium">Phan loai</th>
                              <th className="px-4 py-3 font-medium">Anh</th>
                              <th className="px-4 py-3 font-medium">SKU</th>
                              <th className="px-4 py-3 font-medium">Gia</th>
                              <th className="px-4 py-3 font-medium">Ton kho</th>
                              <th className="px-4 py-3 font-medium">Can nang (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant, index) => (
                              <tr key={variant.key} className="border-t border-slate-100 align-top">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-slate-900">{variant.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {Object.entries(variant.optionMap).map(([key, value]) => `${key}: ${value}`).join(" | ")}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={variant.imageUrl}
                                    onChange={(event) => updateVariant(index, "imageUrl", event.target.value)}
                                    className="h-10 min-w-44 rounded-3xl border border-input bg-input/30 px-3 text-sm outline-none"
                                  >
                                    <option value="">Chon anh</option>
                                    {images.map((image) => (
                                      <option key={image.url} value={image.url}>
                                        Anh {image.position}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    value={variant.sku}
                                    onChange={(event) => updateVariant(index, "sku", event.target.value)}
                                    placeholder="SKU tu sinh hoac tu nhap"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    value={variant.price}
                                    onChange={(event) => updateVariant(index, "price", Number(event.target.value))}
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(event) => updateVariant(index, "stock", Number(event.target.value))}
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    value={variant.weight}
                                    onChange={(event) => updateVariant(index, "weight", Number(event.target.value))}
                                    placeholder="0.5"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <ValidationList errors={sellingErrors} />
                </CardContent>
              </Card>
            )}

            {currentStep === "shipping" && (
              <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                <CardHeader>
                  <CardTitle>Thong tin van chuyen</CardTitle>
                  <CardDescription>
                    Phan nay tam thoi de thong tin co ban. Khi backend shipping hoan thien hon, co the noi tiep vao bang cau hinh rieng.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Hien tai thong tin van chuyen dang o muc tam. San pham van duoc gui draft cho admin duyet, sau nay co the bo sung phi van chuyen / kho / khoi luong chi tiet hon.
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Dai (cm)">
                      <Input value={shipping.packageLength} onChange={(event) => setShipping((current) => ({ ...current, packageLength: event.target.value }))} placeholder="30" />
                    </Field>
                    <Field label="Rong (cm)">
                      <Input value={shipping.packageWidth} onChange={(event) => setShipping((current) => ({ ...current, packageWidth: event.target.value }))} placeholder="20" />
                    </Field>
                    <Field label="Cao (cm)">
                      <Input value={shipping.packageHeight} onChange={(event) => setShipping((current) => ({ ...current, packageHeight: event.target.value }))} placeholder="10" />
                    </Field>
                    <Field label="Can nang mac dinh (kg)">
                      <Input value={shipping.packageWeight} onChange={(event) => setShipping((current) => ({ ...current, packageWeight: event.target.value }))} placeholder="0.5" />
                    </Field>
                  </div>
                  <Field label="Ghi chu van chuyen">
                    <Textarea
                      value={shipping.shippingNote}
                      onChange={(event) => setShipping((current) => ({ ...current, shippingNote: event.target.value }))}
                      placeholder="Vi du: hang de vo, can boc them, uu tien giao nhanh..."
                    />
                  </Field>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                {currentStep === "shipping"
                  ? "Khi bam Gui duyet, san pham se len admin voi trang thai draft."
                  : "Chi khi validate dat yeu cau thi moi sang duoc buoc tiep theo."}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" disabled={currentStepIndex === 0} onClick={goPrev}>
                  <ChevronLeft className="size-4" />
                  Quay lai
                </Button>
                {currentStep !== "shipping" ? (
                  <Button onClick={goNext}>
                    Tiep theo
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button disabled={isSubmitting || isUploading} onClick={handleSubmit}>
                    <Truck className="size-4" />
                    {isSubmitting ? "Dang gui duyet..." : "Gui admin duyet"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ValidationList({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Validate buoc nay da dat, ban co the sang buoc tiep theo.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {errors.map((error) => (
        <p key={error}>- {error}</p>
      ))}
    </div>
  );
}

function AccessCard({
  icon,
  title,
  description,
  primaryLabel,
  primaryHref,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
}) {
  return (
    <div className="rounded-[32px] border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
        {icon}
      </div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{description}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={primaryHref}>
          <Button>{primaryLabel}</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Ve trang chu</Button>
        </Link>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
