import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  size: "small" | "medium" | "large";
  style: string[];
  image_url: string;
  category_id: string | null;
  subcategory_id: string | null;
  categories?: Category;
  subcategories?: Subcategory;
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | "bulk" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    size: "small" as "small" | "medium" | "large",
    image_url: "",
    category_id: "",
    subcategory_id: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(catData || []);

      const { data: subData } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
      setSubcategories(subData || []);

      const { data: prodData, error } = await supabase
        .from("tattoos")
        .select("*, categories(name), subcategories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(prodData || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('tatoo_images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tatoo_images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if (!formData.image_url) {
      alert("Veuillez uploader une image d'abord");
      return;
    }
    const dataToSave = {
      name: formData.name,
      price: parseFloat(formData.price),
      size: formData.size,
      image_url: formData.image_url,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("tattoos")
          .update(dataToSave)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tattoos").insert([dataToSave]);
        if (error) throw error;
      }

      setIsAdding(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
      setUploadPreview(null);
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
      console.error(err);
    }
  };

  const confirmDelete = (id: string | "bulk") => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete === "bulk") {
        const { error } = await supabase.from("tattoos").delete().in("id", selectedIDs);
        if (error) throw error;
        setSelectedIDs([]);
      } else {
        const { error } = await supabase.from("tattoos").delete().eq("id", itemToDelete);
        if (error) throw error;
        setSelectedIDs(prev => prev.filter(id => id !== itemToDelete));
      }
      fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
      console.error(err);
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIDs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIDs.length === filteredProducts.length) {
      setSelectedIDs([]);
    } else {
      setSelectedIDs(filteredProducts.map(p => p.id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      size: "small",
      image_url: "",
      category_id: "",
      subcategory_id: "",
    });
    setUploadPreview(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      size: product.size,
      image_url: product.image_url,
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
    });
    setUploadPreview(product.image_url);
    setIsAdding(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Catalogue Produits
          </h1>
          <p className="text-gray-400 text-sm italic">
            Gérez vos tatouages et leurs caractéristiques
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isAdding && selectedIDs.length > 0 && (
            <button
               onClick={() => confirmDelete("bulk")}
               className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Trash2 size={20} /> Supprimer ({selectedIDs.length})
            </button>
          )}
          {!isAdding && (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={20} /> Ajouter un Tatouage
            </button>
          )}
        </div>
      </div>

      {isAdding ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 glass-panel animate-slide-up">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">
              {editingProduct ? "Modifier le Produit" : "Nouveau Produit"}
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingProduct(null);
              }}
              className="text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Nom du Tatouage
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Prix (FCFA)
              </label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Taille
              </label>
              <select
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value as "small" | "medium" | "large" })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              >
                <option value="small">Petit (Small)</option>
                <option value="medium">Moyen (Medium)</option>
                <option value="large">Grand (Large)</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Image du Tatouage
              </label>
              <div 
                className={`relative h-64 border-2 border-dashed rounded-3xl overflow-hidden transition-all flex flex-col items-center justify-center gap-4 ${isUploading ? "bg-white/5 border-primary/50 animate-pulse" : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/[0.07]"}`}
              >
                {uploadPreview || formData.image_url ? (
                  <>
                    <img 
                      src={uploadPreview || formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center gap-2">
                         <Upload size={32} className="text-white" />
                         <span className="text-xs font-black text-white uppercase">Changer l'image</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-white font-bold">Cliquez pour uploader</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG ou WEBP jusqu'à 5 Mo</p>
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Upload en cours...</span>
                  </div>
                )}

                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  disabled={isUploading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Catégorie
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                    subcategory_id: "",
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              >
                <option value="">Aucune</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Sous-Catégorie
              </label>
              <select
                value={formData.subcategory_id}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory_id: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              >
                <option value="">Aucune</option>
                {subcategories
                  .filter(
                    (sub) =>
                      !formData.category_id ||
                      sub.category_id === formData.category_id,
                  )
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all font-black text-lg"
              >
                {editingProduct ? "Mettre à jour" : "Créer le Produit"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${selectedIDs.length === filteredProducts.length && filteredProducts.length > 0 ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
              >
                {selectedIDs.length === filteredProducts.length && filteredProducts.length > 0 ? "Désélectionner tout" : "Tout sélectionner"}
              </button>
              {selectedIDs.length > 0 && <span className="text-xs text-gray-500 font-bold uppercase">{selectedIDs.length} sélectionné(s)</span>}
            </div>

            <div className="relative grow max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white/5 rounded-3xl animate-pulse"
                />
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="md:col-span-3 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500 font-bold uppercase tracking-widest text-xs">
                Aucun produit trouvé
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-gray-900 border border-white/10 rounded-3xl overflow-hidden hover:border-primary/50 transition-all"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                         type="checkbox"
                         checked={selectedIDs.includes(product.id)}
                         onChange={() => toggleSelect(product.id)}
                         className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary cursor-pointer transition-all"
                      />
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[10px] px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-white font-black uppercase border border-white/10">
                        {product.size}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-lg truncate pr-2">
                        {product.name}
                      </h4>
                      <span className="font-black text-primary whitespace-nowrap">
                        {product.price.toLocaleString()} F
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.categories && (
                        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400 uppercase font-bold">
                          {product.categories.name}
                        </span>
                      )}
                      {product.subcategories && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 rounded text-primary uppercase font-bold">
                          {product.subcategories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Confirmation</h3>
            <p className="text-gray-400 text-sm mb-8">
              {itemToDelete === "bulk" 
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedIDs.length} produits ? Cette action est irréversible.`
                : "Êtes-vous sûr de vouloir supprimer ce tatouage ? Cette action est irréversible."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleExecuteDelete}
                className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
