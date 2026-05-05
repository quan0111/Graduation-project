import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const updateItem = async (data: {
  item_id: number;
  quantity: number;
}) => {
  const res = await apiClient.patch(`/cart/items/${data.item_id}`, {
    quantity: data.quantity,
  });
  return res.data;
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItem,

    // 🔥 optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const prev = queryClient.getQueryData<any>(["cart"]);

      if (prev) {
        queryClient.setQueryData(["cart"], {
          ...prev,
          items: prev.items.map((i: any) =>
            i.id === newData.item_id
              ? { ...i, quantity: newData.quantity }
              : i
          ),
        });
      }

      return { prev };
    },

    onError: (_err, _newData, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["cart"], context.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};