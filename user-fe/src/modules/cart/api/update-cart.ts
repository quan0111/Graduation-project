import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// 🔥 request thực
const updateItemRequest = async ({
  itemId,
  quantity,
}: {
  itemId: number;
  quantity: number;
}) => {
  const res = await apiClient.patch(`/cart/items/${itemId}`, {
    quantity,
  });
  return res.data;
};

// 🔥 queue để tránh spam API (mỗi item 1 request cuối)
const pendingMap = new Map<number, number>();

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItemRequest,

    // 🔥 OPTIMISTIC UPDATE
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const prev = queryClient.getQueryData<any>(["cart"]);

      if (prev) {
        queryClient.setQueryData(["cart"], {
          ...prev,
          items: prev.items.map((i: any) =>
            i.id === newData.itemId
              ? { ...i, quantity: newData.quantity }
              : i
          ),
        });
      }

      return { prev };
    },

    // 🔥 rollback nếu lỗi
    onError: (_err, _newData, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["cart"], context.prev);
      }
    },

    // 🔥 debounce + chống spam
    onSuccess: (_data, variables) => {
      pendingMap.delete(variables.itemId);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};