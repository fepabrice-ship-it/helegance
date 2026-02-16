import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Category {
  name: string;
  img: string;
  color: string;
}

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("tattoos")
          .select("style, image_url");

        if (error) throw error;

        if (data) {
          interface TattooStyleRecord {
            style: string[];
            image_url: string;
          }

          // Extract unique styles and find one image for each
          const styleMap = new Map<string, string>();
          (data as unknown as TattooStyleRecord[]).forEach((item) => {
            if (Array.isArray(item.style)) {
              item.style.forEach((s: string) => {
                if (!styleMap.has(s)) {
                  styleMap.set(s, item.image_url);
                }
              });
            }
          });

          // Define colors based on style name or index
          const colorSchemes = [
            "from-orange-500/80",
            "from-pink-500/80",
            "from-blue-500/80",
            "from-red-500/80",
            "from-emerald-500/80",
            "from-purple-500/80",
          ];

          const dynamicCategories: Category[] = Array.from(styleMap.entries())
            .slice(0, 4) // Limit to 4 for the homepage layout
            .map(([name, img], index) => ({
              name,
              img,
              color: colorSchemes[index % colorSchemes.length],
            }));

          setCategories(dynamicCategories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl mx-auto mt-4 bg-gradient-to-b from-primary-dark via-primary to-primary-light">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590246294586-2470678d5986?q=80&w=2576&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white mb-6 tracking-tight"
          >
            L'Élégance à Fleur de Peau
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 font-light"
          >
            Découvrez notre collection exclusive de tatouages éphémères et
            d'accessoires de mode.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/tattoos"
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2"
            >
              Découvrir la Collection <ArrowRight size={20} />
            </Link>
            <Link
              to="/reseller"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full font-medium transition-all flex items-center justify-center"
            >
              Espace Revendeur
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features / UVP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
            <Star size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Qualité Premium
          </h3>
          <p className="text-gray-400">
            Des designs uniques et une tenue exceptionnelle pour sublimer votre
            style.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Hypoallergénique
          </h3>
          <p className="text-gray-400">
            Respecte votre peau avec des encres testées et approuvées
            dermatologiquement.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4">
            <Truck size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Livraison Rapide
          </h3>
          <p className="text-gray-400">
            Expédition sous 24/48h partout au Cameroun. Retrait gratuit en
            agence.
          </p>
        </div>
      </section>

      {/* Categories Preview */}
      <section>
        <div className="flex items-end justify-between mb-8 px-4">
          <h2 className="text-3xl font-bold text-white">Nos Univers</h2>
          <Link
            to="/tattoos"
            className="text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? // Skeleton loader
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-white/5 animate-pulse"
                ></div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/tattoos?style=${cat.name}`}
                  className="group relative h-80 rounded-2xl overflow-hidden block"
                >
                  <div className="absolute inset-0 bg-gray-900">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}
                  ></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {cat.name}
                    </h3>
                    <span className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 block">
                      Explorer la collection
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
