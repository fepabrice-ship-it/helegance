import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Percent,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

interface ResellerPack {
  name: string;
  price: string;
  items: string;
  profit: string;
  features: string[];
}

const ResellerPage: React.FC = () => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddPack = (pack: ResellerPack) => {
    // Determine size and price based on pack name
    let size: "small" | "medium" | "large" = "small";
    let unitPrice = 0;

    if (pack.name.includes("Découverte")) {
      size = "small";
      unitPrice = 1000 / 30;
    } else if (pack.name.includes("Croissance")) {
      size = "medium";
      unitPrice = 6000 / 12;
    } else {
      size = "large";
      unitPrice = 1500;
    }

    addToCart({
      id: `pack-${size}`,
      name: pack.name,
      price: unitPrice,
      size: size,
      style: ["Selection Mixte"],
      imageUrl:
        "https://images.unsplash.com/photo-1590246294586-2470678d5986?q=80&w=2576&auto=format&fit=crop", // Placeholder
      quantity: 1,
      isResellerPack: true,
    });

    addToast(`${pack.name} ajouté au panier !`, "success", {
      label: "Voir le panier",
      to: "/cart",
    });
  };

  const benefits = [
    {
      icon: <Percent className="text-primary" size={24} />,
      title: "Marges Avantageuses",
      description:
        "Bénéficiez de remises allant jusqu'à 50% sur nos tarifs publics pour maximiser vos profits.",
    },
    {
      icon: <Package className="text-purple-400" size={24} />,
      title: "Packs Prêts à l'Emploi",
      description:
        "Nos packs sont conçus pour une revente immédiate avec un packaging élégant et professionnel.",
    },
    {
      icon: <TrendingUp className="text-emerald-400" size={24} />,
      title: "Support Marketing",
      description:
        "Accès à nos visuels haute définition et supports de communication pour booster vos ventes.",
    },
    {
      icon: <ShieldCheck className="text-blue-400" size={24} />,
      title: "Exclusivité",
      description:
        "Possibilité de devenir revendeur exclusif dans votre zone géographique (sous conditions).",
    },
  ];

  const packs: ResellerPack[] = [
    {
      name: "Pack Découverte",
      price: "1 000",
      items: "30 Tatouages (Small)",
      profit: "Gain estimé: +14 000 FCFA",
      features: [
        "Sélection aléatoire",
        "Packaging standard",
        "Support digital",
      ],
    },
    {
      name: "Pack Croissance",
      price: "6 000",
      items: "12 Tatouages (Medium)",
      profit: "Gain estimé: +6 000 FCFA",
      features: [
        "Choix des styles",
        "Présentoir cartonné",
        "Support digital + physique",
      ],
    },
    {
      name: "Pack Premium",
      price: "15 000",
      items: "10 Tatouages (Large)",
      profit: "Gain estimé: +15 000 FCFA",
      features: [
        "Designs exclusifs",
        "Présentoir luxe",
        "Partenariat réseaux sociaux",
      ],
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden rounded-3xl bg-white/5 border border-white/10 mt-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-tighter"
          >
            Devenez Partenaire <span className="text-primary">Helegance</span>
          </motion.h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Rejoignez notre réseau de revendeurs et développez votre propre
            activité avec des produits premium et une marque forte.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                const element = document.getElementById("reseller-packs");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              Commander un Pack <ArrowRight size={20} />
            </button>
            <button
              onClick={() =>
                window.open("https://wa.me/237693267462", "_blank")
              }
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              Nous Contacter <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pourquoi nous rejoindre ?
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="mb-6 p-4 rounded-xl bg-white/5 inline-block group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reseller Packs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Nos Packs Revendeurs
          </h2>
          <p className="text-gray-400">
            Des solutions adaptées à chaque étape de votre croissance.
          </p>
        </div>
        <div
          id="reseller-packs"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24"
        >
          {packs.map((pack, index) => (
            <div
              key={index}
              className={`p-10 rounded-3xl border transition-all hover:translate-y-[-8px] ${
                index === 1
                  ? "bg-gradient-to-b from-primary/20 to-transparent border-primary/30 shadow-2xl shadow-primary/10"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {pack.name}
              </h3>
              <p className="text-primary font-medium mb-6">{pack.items}</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-white">
                  {pack.price}
                </span>
                <span className="text-gray-400">FCFA</span>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold mb-8">
                {pack.profit}
              </div>
              <ul className="space-y-4 mb-10">
                {pack.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleAddPack(pack)}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  index === 1
                    ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Choisir ce Pack
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-primary to-purple-600 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tighter">
              Prêt à commencer l'aventure ?
            </h2>
            <p className="text-white/80 mb-10 text-lg max-w-2xl mx-auto">
              Nos conseillers sont disponibles pour répondre à toutes vos
              questions et vous guider dans le choix de votre premier pack.
            </p>
            <button
              onClick={() =>
                window.open("https://wa.me/237693267462", "_blank")
              }
              className="px-10 py-5 bg-white text-primary rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-2 mx-auto"
            >
              <MessageSquare size={24} /> DISCUTER SUR WHATSAPP
            </button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
        </div>
      </section>
    </div>
  );
};

export default ResellerPage;
