import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { UploadedImage, VariantDraft, VariantGroup } from "../types/addproduct";

export function useSellingState(images: UploadedImage[]) {
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    { name: "Mau sac", values: [""] },
  ]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const sellingErrors = useMemo(() => {
    const errors: string[] = [];
    if (variants.length === 0) errors.push("Bạn cần tạo ít nhất 1 biến thể.");
    variants.forEach((variant, index) => {
      if (!variant.price || variant.price <= 0) errors.push(`Biến thể ${index + 1} chưa có giá hợp lệ.`);
      if (variant.stock < 0) errors.push(`Biến thể ${index + 1} có tồn kho không hợp lệ.`);
      if (!variant.imageUrl) errors.push(`Biến thể ${index + 1} chưa gắn ảnh.`);
    });
    return Array.from(new Set(errors));
  }, [variants]);

  const updateGroupName = useCallback((index: number, value: string) => {
    setVariantGroups((current) =>
      current.map((group, groupIndex) => (groupIndex === index ? { ...group, name: value } : group)),
    );
  }, []);

  const updateGroupValue = useCallback((groupIndex: number, valueIndex: number, value: string) => {
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
  }, []);

  const addGroup = useCallback(() => {
    setVariantGroups((current) => [...current, { name: "", values: [""] }]);
  }, []);

  const addGroupValue = useCallback((groupIndex: number) => {
    setVariantGroups((current) =>
      current.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex ? { ...group, values: [...group.values, ""] } : group,
      ),
    );
  }, []);

  const removeGroup = useCallback((groupIndex: number) => {
    setVariantGroups((current) => current.filter((_, index) => index !== groupIndex));
  }, []);

  const removeGroupValue = useCallback((groupIndex: number, valueIndex: number) => {
    setVariantGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) return group;
        return {
          ...group,
          values: group.values.filter((_, index) => index !== valueIndex),
        };
      }),
    );
  }, []);

  const generateVariants = useCallback(() => {
    const cleanGroups = variantGroups
      .map((group) => ({
        name: group.name.trim(),
        values: group.values.map((value) => value.trim()).filter(Boolean),
      }))
      .filter((group) => group.name && group.values.length > 0);

    if (cleanGroups.length === 0) {
      toast.error("Cần ít nhất 1 nhóm phân loại có tên và giá trị hợp lệ.");
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
    toast.success("Đã tạo bảng phân loại");
  }, [images, variantGroups, variants]);

  const updateVariant = useCallback(
    (index: number, field: keyof VariantDraft, value: string | number) => {
      setVariants((current) => {
        const next = [...current];
        next[index] = {
          ...next[index],
          [field]: value,
        };
        return next;
      });
    },
    [],
  );

  return {
    variantGroups,
    variants,
    sellingErrors,
    updateGroupName,
    updateGroupValue,
    addGroup,
    addGroupValue,
    removeGroup,
    removeGroupValue,
    generateVariants,
    updateVariant,
  };
}
