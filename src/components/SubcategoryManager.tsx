import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Search, Layers } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  categories?: Category;
}

const SubcategoryManager: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(catData || []);

      const { data: subData, error } = await supabase
        .from("subcategories")
        .select("*, categories(name)")
        .order("name", { ascending: true });

      if (error) throw error;
      setSubcategories(subData || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSub = async () => {
    if (!newSubName.trim() || !selectedCategoryId) return;
    try {
      const { error } = await supabase
        .from("subcategories")
        .insert([{ name: newSubName.trim(), category_id: selectedCategoryId }]);

      if (error) throw error;
      setNewSubName("");
      setIsAdding(false);
      fetchData();
      addToast("Sous-catégorie créée", "success");
    } catch (err) {
      addToast("Erreur lors de l'ajout", "error");
      console.error(err);
    }
  };

  const handleUpdateSub = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const { error } = await supabase
        .from("subcategories")
        .update({ name: editingName.trim() })
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      fetchData();
      addToast("Sous-catégorie mise à jour", "success");
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
      console.error(err);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Supprimer cette sous-catégorie ?")) return;
    try {
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
      addToast("Sous-catégorie supprimée", "success");
    } catch (err) {
      addToast("Erreur lors de la suppression", "error");
      console.error(err);
    }
  };

  const filteredSubs = subcategories.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.categories?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Gestion des Sous-Catégories
          </h1>
          <p className="text-gray-400 text-sm italic">
            Précisez les types de produits par catégorie
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> Nouvelle Sous-Catégorie
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel">
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Rechercher une sous-catégorie ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {isAdding && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-slide-up">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
              >
                <option value="">Choisir une catégorie...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                autoFocus
                type="text"
                placeholder="Nom de la sous-catégorie..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddSub}
                  className="grow p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Check size={20} className="mx-auto" />
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-2xl animate-pulse"
              />
            ))
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-500 font-bold uppercase tracking-widest text-xs">
              <Layers size={48} className="mx-auto mb-4 opacity-10" />
              Aucune sous-catégorie trouvée
            </div>
          ) : (
            filteredSubs.map((sub) => (
              <div
                key={sub.id}
                className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all font-medium"
              >
                {editingId === sub.id ? (
                  <div className="grow flex gap-3">
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdateSub(sub.id)
                      }
                      className="grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleUpdateSub(sub.id)}
                      className="p-2 bg-primary text-white rounded-lg"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Layers size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-lg">
                            {sub.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300 uppercase font-black">
                            {sub.categories?.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          Créée le{" "}
                          {new Date(sub.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(sub.id);
                          setEditingName(sub.name);
                        }}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryManager;
