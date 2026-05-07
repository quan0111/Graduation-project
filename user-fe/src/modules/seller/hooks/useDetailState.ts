import { useCallback, useMemo, useState } from "react";

import type { AttributeRow } from "../types/addproduct";

export function useDetailState() {
  const [attributes, setAttributes] = useState<AttributeRow[]>([{ key: "", value: "" }]);
  const [description, setDescription] = useState("");

  const filteredAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.key.trim() && attribute.value.trim()),
    [attributes],
  );

  const detailErrors = useMemo(() => {
    const errors: string[] = [];
    if (filteredAttributes.length === 0) errors.push("Cần ít nhất 1 thuộc tính chi tiết.");
    if (description.trim().length < 30) errors.push("Mô tả sản phẩm phải từ 30 ký tự trở lên.");
    return errors;
  }, [description, filteredAttributes.length]);

  const updateAttribute = useCallback((index: number, field: keyof AttributeRow, value: string) => {
    setAttributes((current) =>
      current.map((attribute, attributeIndex) =>
        attributeIndex === index ? { ...attribute, [field]: value } : attribute,
      ),
    );
  }, []);

  const addAttribute = useCallback(() => {
    setAttributes((current) => [...current, { key: "", value: "" }]);
  }, []);

  const removeAttribute = useCallback((index: number) => {
    setAttributes((current) => current.filter((_, attributeIndex) => attributeIndex !== index));
  }, []);

  return {
    attributes,
    description,
    filteredAttributes,
    detailErrors,
    setDescription,
    updateAttribute,
    addAttribute,
    removeAttribute,
  };
}
