import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Search, Tags } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase
        .from("categories")
        .insert([{ name: newCategoryName.trim() }]);

      if (error) throw error;
      setNewCategoryName("");
      setIsAdding(false);
      fetchCategories();
      addToast("Catégorie créée avec succès", "success");
    } catch (err) {
      addToast("Erreur lors de l'ajout", "error");
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editingName.trim() })
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      fetchCategories();
      addToast("Catégorie mise à jour", "success");
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cela supprimera également les sous-catégories associées.",
      )
    )
      return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      fetchCategories();
      addToast("Catégorie supprimée", "success");
    } catch (err) {
      addToast("Erreur lors de la suppression", "error");
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Gestion des Catégories
          </h1>
          <p className="text-gray-400 text-sm italic">
            Organisez vos produits par grands thèmes
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> Nouvelle Catégorie
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
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {isAdding && (
            <div className="grow bg-white/5 border border-primary/20 rounded-2xl animate-slide-up flex gap-3 p-4">
              <input
                autoFocus
                type="text"
                placeholder="Nom de la catégorie..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
              />
              <button
                onClick={handleAddCategory}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                title="Valider"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                title="Annuler"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-2xl animate-pulse"
              />
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-500">
              <Tags size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">
                Aucune catégorie trouvée
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all"
              >
                {editingId === category.id ? (
                  <div className="grow flex gap-3">
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdateCategory(category.id)
                      }
                      className="grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleUpdateCategory(category.id)}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Tags size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {category.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Créée le{" "}
                          {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Supprimer"
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

export default CategoryManager;
