import React, { useState, useEffect } from "react";
import { Filter, X, ShoppingBag } from "lucide-react";
import { useLocation } from "react-router-dom";
import ProductModal from "../components/ProductModal";
import { useCart, type Product } from "../context/CartContext";
import { supabase } from "../lib/supabase";

// Mock Data

const STYLES = [
  "Papillons",
  "Fleurs",
  "Animaux",
  "Designs minimalistes",
  "Designs tribaux",
  "Géométrique",
  "Spirituel",
];

const SIZES = [
  { label: "Petit", value: "small" },
  { label: "Moyen", value: "medium" },
  { label: "Grand", value: "large" },
];

const TattoosPage: React.FC = () => {
  const location = useLocation();
  const [tattoos, setTattoos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(() => {
    const params = new URLSearchParams(location.search);
    const styleParam = params.get("style");
    return styleParam ? [styleParam] : [];
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  // Fetch tattoos from Supabase
  useEffect(() => {
    const fetchTattoos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tattoos").select("*");

        if (error) throw error;

        // Map database fields to application model
        if (data) {
          interface TattooRecord {
            id: string;
            name: string;
            price: number;
            size: "small" | "medium" | "large";
            style: string[];
            image_url: string;
          }

          const mappedTattoos: Product[] = (
            data as unknown as TattooRecord[]
          ).map((t) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price),
            size: t.size,
            style: t.style,
            imageUrl: t.image_url,
          }));
          setTattoos(mappedTattoos);
        }
      } catch (err) {
        console.error("Error fetching tattoos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTattoos();
  }, []);

  // Initialize filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const styleParam = params.get("style");
    if (styleParam) {
      setSelectedStyles((prev) => {
        if (prev.length === 1 && prev[0] === styleParam) return prev;
        return [styleParam];
      });
    }
  }, [location.search]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const filteredTattoos = tattoos.filter((t) => {
    const styleMatch =
      selectedStyles.length === 0 ||
      t.style.some((s) => selectedStyles.includes(s));
    const sizeMatch =
      selectedSizes.length === 0 || selectedSizes.includes(t.size);
    return styleMatch && sizeMatch;
  });

  const handleAddToCart = (
    product: Product,
    size: "small" | "medium" | "large",
    quantity: number,
    isReseller: boolean,
  ) => {
    let finalPrice = 0;
    if (isReseller) {
      if (size === "small") finalPrice = 5000 / 30;
      if (size === "medium") finalPrice = 6000 / 12;
      if (size === "large") finalPrice = 1500;
    } else {
      if (size === "small") finalPrice = 500;
      if (size === "medium") finalPrice = 1000;
      if (size === "large") finalPrice = 3000;
    }

    addToCart({
      ...product,
      size,
      price: finalPrice,
      quantity,
      isResellerPack: isReseller,
    });
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen text-white pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 space-y-8">
          <div className="sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Filter size={20} /> Filtres
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Tailles</h4>
                <div className="space-y-2">
                  {SIZES.map((size) => (
                    <label
                      key={size.value}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-colors ${selectedSizes.includes(size.value) ? "bg-primary border-primary" : "group-hover:border-primary"}`}
                      >
                        {selectedSizes.includes(size.value) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedSizes.includes(size.value)}
                        onChange={() => toggleSize(size.value)}
                      />
                      <span
                        className={`text-sm ${selectedSizes.includes(size.value) ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                      >
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Styles</h4>
                <div className="space-y-2">
                  {STYLES.map((style) => (
                    <label
                      key={style}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-colors ${selectedStyles.includes(style) ? "bg-primary border-primary" : "group-hover:border-primary"}`}
                      >
                        {selectedStyles.includes(style) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedStyles.includes(style)}
                        onChange={() => toggleStyle(style)}
                      />
                      <span
                        className={`text-sm ${selectedStyles.includes(style) ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                      >
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center mb-4 sticky top-16 z-30 bg-background/95 backdrop-blur py-2 border-b border-white/10">
          <span className="font-semibold">
            {filteredTattoos.length} Résultat(s)
          </span>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm"
          >
            <Filter size={16} /> Filtrer
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-4/5 bg-gray-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Filtres</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">Tailles</h4>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => toggleSize(size.value)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedSizes.includes(size.value) ? "bg-primary border-primary text-white" : "border-gray-700 text-gray-400"}`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedStyles.includes(style) ? "bg-primary border-primary text-white" : "border-gray-700 text-gray-400"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary py-3 rounded-lg font-bold"
                >
                  Voir {filteredTattoos.length} résultats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/5 rounded-xl overflow-hidden aspect-[3/4] animate-pulse"
                >
                  <div className="h-2/3 bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredTattoos.map((tattoo) => (
                <div
                  key={tattoo.id}
                  onClick={() => setSelectedProduct(tattoo)}
                  className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-800">
                    <img
                      src={tattoo.imageUrl}
                      alt={tattoo.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {tattoo.style.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-black/60 backdrop-blur px-2 py-0.5 rounded text-white"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                      {tattoo.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-semibold">
                        À partir de {tattoo.price} FCFA
                      </span>
                      <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTattoos.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
              <p className="text-gray-400 text-lg">
                Aucun tatouage ne correspond à ces filtres.
              </p>
              <button
                onClick={() => {
                  setSelectedStyles([]);
                  setSelectedSizes([]);
                }}
                className="mt-4 text-primary hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        key={selectedProduct ? selectedProduct.id : "closed"}
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default TattoosPage;
