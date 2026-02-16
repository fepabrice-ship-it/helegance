import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Home,
  MapPin,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");

  const dynamicPlaceholder = React.useMemo(() => {
    const allStyles = Array.from(
      new Set(cart.flatMap((item) => item.style || [])),
    );

    if (allStyles.includes("Animaux")) {
      return "Ex: Je souhaite principalement des lions, loups ou aigles...";
    }
    if (allStyles.includes("Fleurs")) {
      return "Ex: Je préfère les roses, les pivoines ou les fleurs de lotus...";
    }
    if (allStyles.includes("Insectes")) {
      return "Ex: Je recherche des motifs de papillons ou de scorpions...";
    }
    if (allStyles.includes("Géométrique")) {
      return "Ex: Je souhaite des motifs mandalas ou des formes triangulaires...";
    }
    if (allStyles.includes("Spirituel")) {
      return "Ex: Je recherche des symboles bouddhistes, zen ou chakras...";
    }
    if (allStyles.includes("Minimaliste")) {
      return "Ex: Je préfère des petits traits fins et des designs discrets...";
    }

    return "Ex: Précisez ici vos préférences de motifs (ex: plus de fleurs, lions, etc.)";
  }, [cart]);

  const shippingFee = shippingMethod === "delivery" ? 1000 : 0;
  const finalTotal = cartTotal + shippingFee;
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const canDeliver = totalQuantity >= 4;

  // Auto-switch to pickup if delivery is selected but quantity is too low
  React.useEffect(() => {
    if (!canDeliver && shippingMethod === "delivery") {
      setShippingMethod("pickup");
    }
  }, [canDeliver, shippingMethod]);

  const handleCheckout = async () => {
    try {
      // 1. Prepare Order Data for Supabase
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address:
          shippingMethod === "delivery" ? customerAddress : null,
        shipping_method: shippingMethod,
        total_amount: finalTotal,
        status: "pending",
        notes: notes,
      };

      // 2. Prepare Items Data
      const itemsData = cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price,
        is_reseller_pack: !!item.isResellerPack,
      }));

      // 1. Create Order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const itemsToInsert = itemsData.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Format message for WhatsApp
      const orderItems = cart
        .map((item) => {
          const type = item.isResellerPack ? "(Gros)" : "";
          return `- ${item.quantity}x ${item.name} ${item.size.toUpperCase()} ${type}: ${(item.price * item.quantity).toLocaleString()} FCFA`;
        })
        .join("\n");

      const message = `Bonjour Helegance !

Je souhaite passer une commande :

PANIER :
${orderItems}

RECAPITULATIF :
- Sous-total : ${cartTotal.toLocaleString()} FCFA
- Livraison : ${shippingMethod === "delivery" ? "A domicile (1 000 FCFA)" : "Retrait sur place (Gratuit)"}
- TOTAL : ${finalTotal.toLocaleString()} FCFA

INFOS CLIENT :
- Nom : ${customerName}
- Televephone : ${customerPhone}
${shippingMethod === "delivery" ? `- Adresse : ${customerAddress}` : ""}
${notes ? `- Note : ${notes}` : ""}

Merci de confirmer ma commande !`;

      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/237693267462?text=${encodedMessage}`,
        "_blank",
      );
    } catch (error) {
      console.error("Error saving order:", error);
      alert(
        "Une erreur est survenue lors de la validation. Veuillez réessayer.",
      );
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Votre panier est vide
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Explorez notre collection et trouvez le design qui vous correspond.
        </p>
        <Link
          to="/tattoos"
          className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/25"
        >
          Découvrir les Tatouages
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Votre Panier</h1>
        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">
          {cart.length} Articles
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-panel">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">
              Articles sélectionnés
            </h3>
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.cartItemId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="py-6 flex gap-4 md:gap-6"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            {item.name}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-300 uppercase">
                              {item.size}
                            </span>
                            {item.isResellerPack && (
                              <span className="text-xs px-2 py-0.5 bg-primary/20 rounded text-primary font-bold">
                                MODE REVENDEUR
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-bold text-white text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
              <p className="text-sm text-gray-300">
                💡{" "}
                <span className="text-white font-medium">
                  Vous pouvez rajouter plus de produits
                </span>{" "}
                dans votre panier avant de valider pour profiter des frais de
                livraison groupés !
              </p>
              <Link
                to="/tattoos"
                className="text-primary text-xs font-bold hover:underline mt-2 inline-block"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-panel">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 px-1">
              Coordonnées & Livraison
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Votre nom..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase px-1 block">
                  Mode de récupération
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShippingMethod("pickup")}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${shippingMethod === "pickup" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingMethod === "pickup" ? "bg-primary text-white" : "bg-white/10 text-gray-400"}`}
                    >
                      <Home size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-white text-sm">
                        Retrait en agence
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        Gratuit
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => canDeliver && setShippingMethod("delivery")}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all relative ${shippingMethod === "delivery" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-white/10 bg-white/5 hover:border-white/20"} ${!canDeliver ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {!canDeliver && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap animate-pulse">
                        MIN. 4 ARTICLES
                      </div>
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingMethod === "delivery" ? "bg-primary text-white" : "bg-white/10 text-gray-400"}`}
                    >
                      <Truck size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-white text-sm">
                        Livraison à domicile
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        à partir de 1 000 FCFA
                      </span>
                    </div>
                  </button>
                </div>
                {!canDeliver && (
                  <p className="text-[11px] text-red-400 italic px-1 flex items-center gap-2">
                    ⚠️ La livraison est disponible uniquement pour les commandes
                    de 4 tatouages ou plus.
                  </p>
                )}
              </div>

              {shippingMethod === "delivery" && (
                <div className="space-y-2 animate-slide-up">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">
                    Adresse de livraison
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Quartier, Précisions..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">
                  Notes spéciales (Motifs souhaités, etc.)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={dynamicPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-panel sticky top-24">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">
              Récapitulatif
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Sous-total</span>
                <span className="text-white font-medium">
                  {cartTotal.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between text-gray-400 border-b border-white/5 pb-4">
                <span>Livraison</span>
                <span className="text-white font-medium">
                  {shippingMethod === "delivery" ? "1 000 FCFA" : "Gratuit"}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2">
                <span className="text-white">Total</span>
                <span className="text-primary">
                  {finalTotal.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                !customerName ||
                !customerPhone ||
                (shippingMethod === "delivery" && !customerAddress)
              }
              className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Passer la commande <ArrowRight size={20} />
            </button>

            <p className="mt-4 text-[10px] text-gray-500 text-center leading-relaxed italic">
              En validant, vous serez redirigé vers WhatsApp pour confirmer les
              détails avec notre service client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
