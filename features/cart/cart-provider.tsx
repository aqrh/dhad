"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type CartItem = {
  id: string;

  variantId: number;
  sku: string;

  name: string;
  price: number;
  image: string;

  size: string;
  color: string;
  deliveryPrice: number | null;
  maxStock: number;

  quantity: number;
};

type AddCartItem = Omit<CartItem, "quantity">;

type CartContextType = {
  items: CartItem[];

  addItem: (item: AddCartItem) => void;

  removeItem: (variantId: number) => void;

  increaseQuantity: (variantId: number) => void;

  decreaseQuantity: (variantId: number) => void;

  clearCart: () => void;

  itemCount: number;
  total: number;
};

const CartContext =
  createContext<CartContextType | null>(null);

/*
 * v2 because our cart structure changed.
 * This prevents old cart items without variantId/sku
 * from breaking the new cart.
 */
const STORAGE_KEY = "iraq-heritage-cart-v5";

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (
    event: StorageEvent
  ) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    listeners.delete(listener);

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return (
      window.localStorage.getItem(
        STORAGE_KEY
      ) ?? "[]"
    );
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

function isCartItem(
  item: unknown
): item is CartItem {
  if (
    typeof item !== "object" ||
    item === null
  ) {
    return false;
  }

  const cartItem = item as CartItem;

  return (
    typeof cartItem.id === "string" &&
    typeof cartItem.variantId === "number" &&
    typeof cartItem.sku === "string" &&
    typeof cartItem.name === "string" &&
    typeof cartItem.price === "number" &&
    typeof cartItem.image === "string" &&
    typeof cartItem.size === "string" &&
    typeof cartItem.color === "string" &&
    typeof cartItem.maxStock === "number" &&
    typeof cartItem.quantity === "number" &&
    cartItem.deliveryPrice === null || typeof cartItem.deliveryPrice === "number"
  );
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );

    emitChange();
  } catch (error) {
    console.error(
      "Could not save cart:",
      error
    );
  }
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storedCart = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const items = useMemo<CartItem[]>(() => {
    try {
      const parsed: unknown =
        JSON.parse(storedCart);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(isCartItem);
    } catch {
      return [];
    }
  }, [storedCart]);

  const addItem = (
  newItem: AddCartItem
) => {
  const current = readCart();

  const existingIndex =
    current.findIndex(
      (item) =>
        item.variantId ===
        newItem.variantId
    );

  if (existingIndex !== -1) {
    const updated = current.map(
      (item, index) => {
        if (
          index !== existingIndex
        ) {
          return item;
        }

        return {
          ...item,
          ...newItem,

          quantity: Math.min(
            item.quantity + 1,
            newItem.maxStock
          ),
        };
      }
    );

    writeCart(updated);
    return;
  }

  if (newItem.maxStock < 1) {
    return;
  }

  writeCart([
    ...current,
    {
      ...newItem,
      quantity: 1,
    },
  ]);
  };

  const removeItem = (
    variantId: number
  ) => {
    const current = readCart();

    const updated = current.filter(
      (item) =>
        item.variantId !== variantId
    );

    writeCart(updated);
  };

  const increaseQuantity = (
  variantId: number
) => {
  const current = readCart();

  const updated = current.map(
    (item) => {
      if (
        item.variantId !== variantId
      ) {
        return item;
      }

      return {
        ...item,

        quantity: Math.min(
          item.quantity + 1,
          item.maxStock
        ),
      };
    }
  );

  writeCart(updated);
};

  const decreaseQuantity = (
    variantId: number
  ) => {
    const current = readCart();

    const updated = current
      .map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item
      )
      .filter(
        (item) => item.quantity > 0
      );

    writeCart(updated);
  };

  const clearCart = () => {
    writeCart([]);
  };

  const itemCount = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [items]);

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}