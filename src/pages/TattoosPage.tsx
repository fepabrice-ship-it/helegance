import React, { useState, useEffect, useCallback } from "react";
import {
  Filter,
  X,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  Home,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { useRegion } from "../context/RegionContext";
import type { Product } from "../context/CartContext";
import emailjs from "@emailjs/browser";

// Constants
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

const ProductSkeleton = () => (
  <div className="w-full h-full shrink-0 flex items-center justify-center p-2 relative animate-pulse">
    <div className="w-full h-full bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
      <div className="w-20 h-20 bg-white/5 rounded-full" />
    </div>
  </div>
);

const TattoosPage: React.FC = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const { region } = useRegion();
  
  // Data State
  const [tattoos, setTattoos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [selectedStyles, setSelectedStyles] = useState<string[]>(() => {
    const params = new URLSearchParams(location.search);
    const styleParam = params.get("style");
    return styleParam ? [styleParam] : [];
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["small"]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Order State
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [chosenDate, setChosenDate] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery" | "shipping">("pickup");
  const [pickupCity, setPickupCity] = useState<"Yaoundé" | "Douala">("Yaoundé");
  const [shippingCity, setShippingCity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;

  // Fetch tattoos
  const fetchTattoos = useCallback(async (page: number, append: boolean = false) => {
    if (page === 0) setLoading(true);
    try {
      let query = supabase
        .from("tattoos")
        .select("id, name, price, size, style, image_url");
      
      // Server-side filtering
      if (selectedStyles.length > 0) {
        query = query.overlaps("style", selectedStyles);
      }
      if (selectedSizes.length > 0) {
        query = query.in("size", selectedSizes);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      if (data) {
        const mappedTattoos: Product[] = (data as Array<{id: string, name: string, price: number, size: string, style: string[], image_url: string}>).map((t) => ({
          id: t.id,
          name: t.name,
          price: Number(t.price),
          size: t.size as "small" | "medium" | "large",
          style: t.style,
          imageUrl: t.image_url,
        }));

        setTattoos(prev => append ? [...prev, ...mappedTattoos] : mappedTattoos);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error fetching tattoos:", err);
    } finally {
      if (page === 0) setLoading(false);
    }
  }, [selectedStyles, selectedSizes]);

  useEffect(() => {
    fetchTattoos(0);
  }, [fetchTattoos]);

  // Proactive background pre-fetching
  useEffect(() => {
    if (!loading && hasMore && tattoos.length > 0) {
      const nextPage = Math.floor(tattoos.length / PAGE_SIZE);
      // Small delay to ensure the UI is responsive before triggering next background fetch
      const timer = setTimeout(() => {
        fetchTattoos(nextPage, true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tattoos.length, hasMore, loading, fetchTattoos]);

  // Update styles from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const styleParam = params.get("style");
    if (styleParam) {
      setSelectedStyles([styleParam]);
    }
  }, [location.search]);

  // Adjust mode based on region
  useEffect(() => {
    if (region === "CG") {
      setShippingMethod("delivery");
    }
  }, [region]);

  // Reset active index when filters change
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [selectedStyles, selectedSizes]);

  const filteredTattoos = tattoos;

  const activeTattoo = filteredTattoos[activeIndex];
  const currentItemQuantity = activeTattoo ? (cartItems[activeTattoo.id] || 0) : 0;

  // Pricing Logic

  const getSubtotalForProduct = (tattoo: Product, qty: number) => {
    if (tattoo.size === "small") return 5000 * qty; // New price: 5000 FCFA per pack
    if (tattoo.size === "medium") return 6000 * qty;
    if (tattoo.size === "large") return 15000 * qty;
    return 0;
  };

  const getTotalPrice = () => {
    return Object.entries(cartItems).reduce((acc, [id, qty]) => {
      const tattoo = tattoos.find(t => t.id === id);
      if (!tattoo || qty <= 0) return acc;
      return acc + getSubtotalForProduct(tattoo, qty); // Use global buyMode for pricing
    }, 0);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const totalItemsCount = Object.values(cartItems).reduce((acc, qty) => acc + qty, 0);
  const selectedItemsSummaryText = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const tattoo = tattoos.find(t => t.id === id);
      return tattoo ? `${qty} ${tattoo.name.split(" ")[0]}` : null;
    })
    .filter(Boolean)
    .join(" + ");

  // Carousel Navigation
  const paginate = (newDirection: number) => {
    const nextIndex = activeIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < filteredTattoos.length) {
      setActiveIndex(nextIndex);
    }
  };

  const handleNext = () => paginate(1);
  const handlePrev = () => paginate(-1);

  const handleQuickOrder = async () => {
    setIsSubmitting(true);
    try {
      const finalTotal = getTotalPrice() + (shippingMethod === "delivery" ? 1000 : 0);
      
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: shippingMethod === "delivery" ? customerAddress : null,
        neighborhood: shippingMethod === "delivery" ? neighborhood : null,
        delivery_date: chosenDate,
        shipping_method: shippingMethod,
        total_amount: finalTotal,
        status: "pending",
        notes: `Selection: ${selectedItemsSummaryText} | Ville: ${shippingMethod === "pickup" ? pickupCity : shippingMethod === "shipping" ? shippingCity : "N/A"} | Notes: ${notes}`,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert all items
      const itemsToInsert = Object.entries(cartItems).map(([id, qty]) => {
        const tattoo = tattoos.find(t => t.id === id);
        return {
          order_id: order.id,
          product_id: id,
          product_name: tattoo?.name || "Tatouage",
          size: tattoo?.size || "small",
          quantity: qty,
          unit_price: tattoo ? (tattoo.size === "small" ? 5000/30 : tattoo.size === "medium" ? 6000/12 : 1500) : 0,
          is_reseller_pack: true,
        };
      });

      const { error: itemError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemError) throw itemError;

      const orderItemsText = Object.entries(cartItems)
        .map(([id, qty]) => {
          const tattoo = tattoos.find(t => t.id === id);
          return `- ${tattoo?.name} (Pack) x${qty}`;
        })
        .join("\n");

      const orderMessage = `Bonjour Tatoo Pinterest !
      
COMMANDE MULTIPLE (PACKS) :
${orderItemsText}

PRIX TOTAL : ${finalTotal.toLocaleString()} FCFA

CLIENT : ${customerName}
TEL : ${customerPhone}
${shippingMethod === "delivery" ? `LIVRAISON : ${neighborhood}` : shippingMethod === "pickup" ? `RETRAIT : Agence ${pickupCity}` : `EXPÉDITION : Ville ${shippingCity}`}
DATE SOUHAITÉE : ${new Date(chosenDate).toLocaleDateString("fr-FR")}

${notes ? `NOTES : ${notes}` : ""}

Merci de confirmer ma commande !`;

      // Email Notification (EmailJS)
      try {
        const templateParams = {
          to_email: "belloboemmanuel@gmail.com, fepabrice@gmail.com",
          to_name: "Tatoo Pinterest Admin",
          from_name: customerName,
          customer_phone: customerPhone,
          customer_address: neighborhood || customerAddress || "Agence/Expédition",
          order_total: `${finalTotal.toLocaleString()} FCFA`,
          order_items: orderItemsText,
          delivery_date: new Date(chosenDate).toLocaleDateString("fr-FR"),
          shipping_method: shippingMethod,
          notes: notes || "Aucune note",
        };

        if (import.meta.env.VITE_EMAILJS_TEMPLATE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID") {
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
          console.log("Email notification sent successfully.");
        }
      } catch (emailErr) {
        console.error("EmailJS Error:", emailErr);
      }

      window.open(`https://wa.me/237692317909?text=${encodeURIComponent(orderMessage)}`, "_blank");
      
      setIsOrderModalOpen(false);
      setCartItems({});
      setNotes("");
      setShippingCity("");
      addToast("Commande envoyée !", "success");
    } catch (err) {
      console.error("Order error:", err);
      addToast("Erreur lors de la commande", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col text-white pb-6 pt-2 overflow-hidden bg-background">
      {/* Mini Header / Filters Button */}
      <div className="px-4 flex justify-between items-center mb-2 shrink-0">
        <h1 className="text-xl font-black uppercase tracking-tighter">
          TATOO PINTEREST <span className="text-primary italic">TATTOOS</span>
        </h1>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1.5 rounded-full text-[10px] font-black hover:bg-primary/30 transition-all text-primary-light uppercase"
        >
          <Filter size={12} strokeWidth={3} /> Filtrer
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-between gap-4 max-w-lg mx-auto w-full px-4 overflow-hidden">
          <div className="w-full relative flex-1 flex flex-col min-h-0">
            <div className="relative flex-1 bg-black/20 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex">
              <ProductSkeleton />
            </div>
          </div>
          <div className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md space-y-4 shrink-0 animate-pulse">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="flex justify-between">
              <div className="h-10 w-24 bg-white/5 rounded-xl" />
              <div className="h-10 w-32 bg-white/5 rounded-xl" />
            </div>
            <div className="h-12 bg-white/5 rounded-2xl" />
          </div>
        </div>
      ) : filteredTattoos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
           <p className="text-gray-400 mb-4 font-medium">Aucun tatouage disponible pour ces filtres.</p>
           <button onClick={() => {setSelectedStyles([]); setSelectedSizes(["small"])}} className="bg-primary px-6 py-2 rounded-full font-bold">Réinitialiser</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between gap-4 max-w-lg mx-auto w-full px-4 overflow-hidden">
          <div className="w-full relative flex-1 flex flex-col min-h-0 bg-black/20 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <motion.div 
              className="relative flex-1 flex items-center cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                if (swipe) {
                  const direction = offset.x > 0 ? -1 : 1;
                  paginate(direction);
                }
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.9, x: 100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full h-full shrink-0 flex items-center justify-center p-2 absolute inset-0"
                >
                  <img
                    src={activeTattoo?.imageUrl}
                    alt={activeTattoo?.name}
                    className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    loading="eager"
                  />
                  
                  {/* LABELS OVERLAY */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {activeTattoo?.style.slice(0, 2).map(s => (
                      <span key={s} className="bg-primary/90 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ARROWS - FLOATING OVER THE SCROLLABLE AREA */}
            <button 
              onClick={handlePrev} 
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10 active:scale-90 transition-transform"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10 active:scale-90 transition-transform"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
            
            <div className="absolute bottom-16 right-6 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 z-10">
              {activeIndex + 1} / {filteredTattoos.length}
            </div>
            
            <div className="h-8 flex items-center justify-center mt-2">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={activeTattoo?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-black text-center uppercase truncate w-full"
                >
                   {activeTattoo?.name}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>

          {/* QUICK ORDER CONTROLS - VISIBLE ON SAME VIEWPORT */}
          <div className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md space-y-4 shrink-0">
            
            <div className={`flex p-1 bg-black/40 rounded-xl border border-white/10 ${region === "CG" ? "opacity-50 pointer-events-none" : ""}`}>
              <div 
                className="flex-1 py-3 rounded-lg text-[11px] font-black transition-all bg-primary text-white text-center"
              >
                PAQUET DE 30 À 5000 FCFA
              </div>
            </div>

            {/* Quantity & Price Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-1 gap-1">
                <button 
                  onClick={() => activeTattoo && updateQuantity(activeTattoo.id, -1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white active:scale-90"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="w-8 text-center font-black text-sm">{currentItemQuantity}</span>
                <button 
                  onClick={() => activeTattoo && updateQuantity(activeTattoo.id, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white active:scale-90"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-primary tracking-tighter">
                  {getTotalPrice().toLocaleString()} <span className="text-xs">FCFA</span>
                </span>
              </div>
            </div>

            {/* MAIN ACTION BUTTON */}
            <button 
              onClick={() => setIsOrderModalOpen(true)}
              disabled={totalItemsCount === 0}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
            >
              PASSER LA COMMANDE {totalItemsCount > 0 && `(${totalItemsCount})`} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-end px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-[300px] h-fit max-h-[90vh] bg-gray-900 rounded-4xl border border-white/10 p-6 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic">Filtres</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-1.5 bg-white/10 rounded-full"><X size={18} /></button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto pr-1 small-scrollbar">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tailles</h4>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                      <button 
                        key={s.value}
                        onClick={() => {
                          setSelectedSizes([s.value]);
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${selectedSizes.includes(s.value) ? "bg-primary border-primary text-white" : "border-white/10 text-gray-400"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(style => (
                      <button 
                        key={style}
                        onClick={() => setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedStyles.includes(style) ? "bg-primary border-primary text-white" : "border-white/10 text-gray-400"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="w-full bg-white text-black py-3 mt-4 rounded-xl font-black text-xs uppercase">Appliquer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOrderModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-gray-900 rounded-4xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-primary/20 flex justify-between items-center bg-primary/5">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Votre commande</h3>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)} className="p-2 text-white/50 hover:text-white"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto small-scrollbar">
                
                {/* Product Summary List */}
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase text-primary-light tracking-widest border-b border-primary/10 pb-2 mb-2">Résumé de votre sélection</h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 small-scrollbar">
                    {Object.entries(cartItems).map(([id, qty]) => {
                      const tattoo = tattoos.find(t => t.id === id);
                      if (!tattoo || qty <= 0) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-[11px] font-bold">
                          <p className="text-gray-400">L'expérience Tatoo Pinterest</p>
                          <span className="text-gray-300 truncate max-w-[150px]">{tattoo.name}</span>
                          <span className="text-primary whitespace-nowrap">x{qty} (Pack)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Noms</label>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ex: John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Téléphone (WhatsApp)</label>
                      <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="00237..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none" />
                   </div>
                </div>

                <div className={`grid ${region === "CM" ? "grid-cols-3" : "grid-cols-1"} gap-2`}>
                    {region === "CM" && (
                      <button onClick={() => setShippingMethod("pickup")} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[9px] font-bold uppercase transition-all ${shippingMethod === "pickup" ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-gray-500"}`}><Home size={14} /> Retrait</button>
                    )}
                    <button onClick={() => setShippingMethod("delivery")} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[9px] font-bold uppercase transition-all ${shippingMethod === "delivery" ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-gray-500"}`}><Truck size={14} /> Livraison</button>
                    {region === "CM" && (
                      <button onClick={() => setShippingMethod("shipping")} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[9px] font-bold uppercase transition-all ${shippingMethod === "shipping" ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-gray-500"}`}><ArrowRight size={14} /> Expédition</button>
                    )}
                </div>

                {shippingMethod === "pickup" && (
                  <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setPickupCity("Yaoundé")} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${pickupCity === "Yaoundé" ? "bg-white/10 text-white" : "text-gray-500"}`}>Yaoundé</button>
                    <button onClick={() => setPickupCity("Douala")} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${pickupCity === "Douala" ? "bg-white/10 text-white" : "text-gray-500"}`}>Douala</button>
                  </div>
                )}

                {shippingMethod === "delivery" && (
                  <div className="space-y-3">
                        <>
                          <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Quartier..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                          <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Adresse précise..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                        </>
                  </div>
                )}

                {shippingMethod === "shipping" && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-primary-light font-bold italic px-1">
                      Si vous n'êtes ni à Yaoundé ni à Douala, vous pouvez vous faire expédier votre colis via une agence de transport.
                    </p>
                    <input 
                      type="text" 
                      value={shippingCity} 
                      onChange={e => setShippingCity(e.target.value)} 
                      placeholder="Votre ville d'expédition..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                )}

                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Choix des motifs (Facultatif)</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: 2 motifs lions, 3 papillons..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary min-h-[80px]"
                  />
                  <p className="text-[9px] text-gray-500 italic mt-1 px-1">
                    ✨ Ne vous inquiétez pas, vous pourrez également faire vos choix définitifs directement parmi notre panoplie lors de la confirmation !
                  </p>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Date souhaitée</label>
                  <input type="date" value={chosenDate} onChange={e => setChosenDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none scheme-dark" />
                </div>
              </div>

              <div className="p-6 bg-black/40 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Total</span>
                  <span className="text-xl font-black text-primary">{(getTotalPrice() + (shippingMethod === "delivery" ? 1000 : 0)).toLocaleString()} F</span>
                </div>
                <button 
                  disabled={!customerName || !customerPhone || !chosenDate || (shippingMethod === "delivery" && !neighborhood) || isSubmitting}
                  onClick={handleQuickOrder}
                  className="w-full bg-primary py-4 rounded-xl font-black text-xs tracking-widest uppercase disabled:opacity-50"
                >
                  {isSubmitting ? "CHARGEMENT..." : `VALIDER LA COMMANDE (${totalItemsCount})`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .small-scrollbar::-webkit-scrollbar { width: 4px; }
        .small-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TattoosPage;
