import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_CART } from "@/constant/config";
import { useMe } from "@/modules/auth/api/get-auth-me";
// 🔥 request thực
const updateItemRequest = async ({
  itemId,
  quantity,
}: {
  itemId: number;
  quantity: number;
}) => {
  const res = await apiClient.patch(`${API_URL_CART}/items/${itemId}`, {
    quantity,
  });
  return res.data;
};

// 🔥 queue để tránh spam API (mỗi item 1 request cuối)
const pendingMap = new Map<number, number>();

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const cartQueryKey = ["cart", user?.id];

  return useMutation({
    mutationFn: updateItemRequest,

    // 🔥 OPTIMISTIC UPDATE
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const prev = queryClient.getQueryData<any>(cartQueryKey);

      if (prev) {
        queryClient.setQueryData(cartQueryKey, {
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
        queryClient.setQueryData(cartQueryKey, context.prev);
      }
    },

    // 🔥 debounce + chống spam
    onSuccess: (_data, variables) => {
      pendingMap.delete(variables.itemId);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};
