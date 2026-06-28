import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { calculateOrderPrice, isCustomSale } from "@/utils/format";

const CartContext = createContext(null);
const STORAGE_KEY = "parfum_cart";

function makeCartId(item) {
  return `${item.product_id}-${item.bottle_option_id || "regular"}`;
}

function calcItemSubtotal(product, { bottleOption, quantity = 1 }) {
  return calculateOrderPrice(product, { bottleOption, quantity });
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, options = {}) => {
    const { quantity = 1, bottleOption = null } = options;

    if (isCustomSale(product) && !bottleOption) {
      return { needsOptions: true };
    }

    const qty = parseInt(quantity) || 1;
    const subtotal = calcItemSubtotal(product, { bottleOption, quantity: qty });
    const cartItem = {
      cartId: makeCartId({ product_id: product.id, bottle_option_id: bottleOption?.id }),
      product_id: product.id,
      product_name: product.name,
      category_name: product.category_name,
      slug: product.slug,
      image_url: product.image_url,
      sale_type: isCustomSale(product) ? "custom" : "regular",
      price: product.price,
      price_per_ml: product.price_per_ml,
      quantity: qty,
      bottle_option_id: bottleOption?.id || null,
      bottle_type: bottleOption?.bottle_type || "",
      bottle_size: bottleOption ? `${bottleOption.size_ml}ml` : "",
      size_ml: bottleOption?.size_ml || null,
      bottle_price: bottleOption ? parseFloat(bottleOption.bottle_price) || 0 : 0,
      perfume_price: bottleOption
        ? (parseFloat(product.price_per_ml) || 0) * (parseInt(bottleOption.size_ml) || 0)
        : 0,
      unit_price: subtotal / qty,
      subtotal,
    };

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.cartId === cartItem.cartId);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = next[idx].quantity + qty;
        next[idx] = {
          ...next[idx],
          quantity: newQty,
          subtotal: calcItemSubtotal(product, {
            bottleOption: bottleOption || {
              bottle_price: next[idx].bottle_price,
              size_ml: next[idx].size_ml,
            },
            quantity: newQty,
          }),
        };
        toast.success("Jumlah di keranjang diperbarui");
        return next;
      }
      toast.success("Produk ditambahkan ke keranjang");
      return [...prev, cartItem];
    });

    return { needsOptions: false };
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    const qty = parseInt(quantity) || 1;
    if (qty < 1) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        const product = {
          price: item.price,
          price_per_ml: item.price_per_ml,
          sale_type: item.sale_type,
        };
        const bottleOption = item.bottle_option_id
          ? { bottle_price: item.bottle_price, size_ml: item.size_ml, bottle_type: item.bottle_type }
          : null;
        return {
          ...item,
          quantity: qty,
          subtotal: calcItemSubtotal(product, { bottleOption, quantity: qty }),
        };
      })
    );
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
    toast.success("Produk dihapus dari keranjang");
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + (i.subtotal || 0), 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
