import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Define a basic product type for now
export interface Product {
  id: string;
  name: string;
  price: number;
  size: "small" | "medium" | "large";
  style: string[];
  imageUrl: string;
}

export interface CartItem extends Product {
  cartItemId: string; // Unique key for the variation (ID + size + reseller)
  quantity: number;
  isResellerPack?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "cartItemId">) => {
    const cartItemId = `${item.id}-${item.size}-${item.isResellerPack ? "reseller" : "retail"}`;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prevCart.map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prevCart, { ...item, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
