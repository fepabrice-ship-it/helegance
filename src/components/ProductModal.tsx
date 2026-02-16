import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { type Product } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: "small" | "medium" | "large",
    quantity: number,
    isReseller: boolean,
  ) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { addToast } = useToast();
  const [size, setSize] = useState<"small" | "medium" | "large">("small");
  const [isReseller, setIsReseller] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSize("small");
      setIsReseller(false);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const getUnitPrice = () => {
    if (isReseller) {
      if (size === "small") return 5000 / 30;
      if (size === "medium") return 6000 / 12;
      if (size === "large") return 1500;
    } else {
      if (size === "small") return 500;
      if (size === "medium") return 1000;
      if (size === "large") return 3000;
    }
    return 0;
  };

  const getTotalPrice = () => {
    if (isReseller) {
      if (size === "small") return 5000 * quantity;
      if (size === "medium") return 6000 * quantity;
      if (size === "large") return 1500 * quantity;
    } else {
      return getUnitPrice() * quantity;
    }
    return 0;
  };

  const handleAdd = () => {
    onAddToCart(product, size, quantity, isReseller);
    addToast(`${product.name} ajouté au panier !`, "success", {
      label: "Voir le panier",
      to: "/cart",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-y-auto max-h-[98vh] shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white z-20 bg-black/50 rounded-full p-1.5 transition-colors"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image */}
          <div className="md:w-5/12 h-40 md:h-auto bg-gray-800 relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
              <h3 className="text-xl font-bold text-white leading-tight">
                {product.name}
              </h3>
              <div className="flex gap-1.5 mt-0.5">
                {product.style?.map((s: string) => (
                  <span
                    key={s}
                    className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="md:w-7/12 p-4 md:p-6 flex flex-col gap-4 md:gap-5">
            {/* Mode Revendeur Toggle */}
            <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5">
              <span className="text-sm font-semibold text-gray-200">
                Mode Revendeur
              </span>
              <button
                onClick={() => {
                  setIsReseller(!isReseller);
                  setQuantity(1);
                }}
                className={`w-12 h-6 md:w-14 md:h-7 rounded-full p-1 transition-colors ${isReseller ? "bg-primary" : "bg-gray-700"}`}
              >
                <div
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-white transition-transform ${isReseller ? "translate-x-6 md:translate-x-7" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <label className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-500 block px-1">
                Taille disponible
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl border transition-all ${size === s ? "border-primary bg-primary/10 text-white ring-1 ring-primary/30" : "border-gray-800 hover:border-gray-600 text-gray-300 bg-white/5"}`}
                  >
                    <span className="text-sm md:text-base font-bold capitalize">
                      {s === "small"
                        ? "Petit"
                        : s === "medium"
                          ? "Moyen"
                          : "Grand"}
                    </span>
                    {isReseller ? (
                      <span className="text-sm md:text-base font-black text-primary">
                        {s === "small"
                          ? "30 pcs / 5k"
                          : s === "medium"
                            ? "12 pcs / 6k"
                            : "1.5k / pcs"}
                      </span>
                    ) : (
                      <span className="text-sm md:text-base font-black text-primary">
                        {s === "small"
                          ? "500 F"
                          : s === "medium"
                            ? "1k F"
                            : "3k F"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Price Row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1.5 gap-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 active:scale-90 transition-all border border-white/5"
                >
                  <Minus size={18} strokeWidth={3} />
                </button>
                <span className="w-10 text-center font-black text-white text-lg md:text-xl">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 active:scale-90 transition-all border border-white/5"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest">
                  Total à payer
                </span>
                <span className="text-2xl md:text-3xl font-black text-primary-light">
                  {getTotalPrice().toLocaleString()} F
                </span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl shadow-primary/25 active:scale-95 flex items-center justify-center gap-2"
            >
              AJOUTER AU PANIER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
