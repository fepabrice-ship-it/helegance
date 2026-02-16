import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Plus,
  Calendar,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

type OrderStatus = "pending" | "processing" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  is_reseller_pack: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shipping_method: "pickup" | "delivery";
  total_amount: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
  order_items?: OrderItem[];
}

const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("orders").select("*, order_items(*)");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (dateFilter) {
        query = query
          .gte("created_at", `${dateFilter}T00:00:00`)
          .lte("created_at", `${dateFilter}T23:59:59`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchOrders();
  }, [user, isAdmin, fetchOrders]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-bold uppercase tracking-widest animate-pulse">
        Chargement Administration...
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "processing":
        return <Package size={14} />;
      case "delivered":
        return <CheckCircle2 size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
    }
  };

  return (
    <div className="pb-20 pt-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Tableau de Bord
            </h1>
            <p className="text-gray-400 text-sm italic">
              Gestion Helegance • {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all group"
            title="Déconnexion"
          >
            <LogOut
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "products" ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            Catalogue
          </button>
        </div>
      </div>

      {activeTab === "orders" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters & Orders List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-grow min-w-[200px]">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Rechercher un client ou téléphone..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:border-primary outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>

              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-white/5 rounded-2xl animate-pulse"
                  />
                ))
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
                  Aucune commande trouvée.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer ${selectedOrder?.id === order.id ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl bg-white/5 text-gray-400 group-hover:text-primary transition-colors`}
                        >
                          {order.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-lg">
                              {order.customer_name}
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase flex items-center gap-1.5 ${getStatusColor(order.status)}`}
                            >
                              {getStatusIcon(order.status)}{" "}
                              {order.status === "pending"
                                ? "Attente"
                                : order.status === "processing"
                                  ? "En cours"
                                  : order.status === "delivered"
                                    ? "Livré"
                                    : "Annulé"}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs flex items-center gap-2">
                            <Calendar size={12} />{" "}
                            {new Date(order.created_at).toLocaleDateString()} •{" "}
                            {order.customer_phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">
                          {order.total_amount.toLocaleString()} F
                        </p>
                        <p className="text-xs text-primary font-bold">
                          {order.shipping_method === "delivery"
                            ? "LIVRAISON"
                            : "RETRAIT"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-gray-900 border border-white/10 rounded-3xl p-6 glass-panel overflow-hidden">
              {selectedOrder ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                      Détails Commande
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-white"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                      Options du Statut
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "processing")
                        }
                        className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "delivered")
                        }
                        className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                      >
                        Livrée
                      </button>
                      <button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "cancelled")
                        }
                        className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">
                          Date de commande
                        </p>
                        <p className="text-white font-medium">
                          {new Date(selectedOrder.created_at).toLocaleString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">
                          Mode & Adresse
                        </p>
                        <p className="text-white font-medium">
                          {selectedOrder.shipping_method === "delivery"
                            ? "À Domicile"
                            : "En Agence"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {selectedOrder.customer_address ||
                            "Pas d'adresse (Retrait)"}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl italic text-yellow-400/80 text-sm">
                        " {selectedOrder.notes} "
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                      Articles ({selectedOrder.order_items?.length})
                    </p>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedOrder.order_items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm py-2 border-b border-white/5"
                        >
                          <div>
                            <p className="text-white font-bold">
                              {item.product_name}{" "}
                              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded uppercase">
                                {item.size}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} x{" "}
                              {item.unit_price.toLocaleString()} F
                            </p>
                          </div>
                          <span className="font-bold text-white">
                            {(item.unit_price * item.quantity).toLocaleString()}{" "}
                            F
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-2xl font-black text-white">
                      <span>TOTAL</span>
                      <span className="text-primary">
                        {selectedOrder.total_amount.toLocaleString()} F
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-center text-gray-500 p-8">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Package size={40} className="text-gray-700" />
                  </div>
                  <p className="font-bold mb-2">Sélectionnez une commande</p>
                  <p className="text-sm">
                    Cliquez sur une commande à gauche pour voir les détails
                    complets et imprimer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-3xl border border-white/10 p-12 text-center text-gray-500">
          <Package size={64} className="mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-white mb-2">
            Gestion du Catalogue
          </h3>
          <p className="max-w-md mx-auto mb-8 text-gray-400">
            Cette section vous permet d'ajouter des nouveaux tatouages, de
            modifier les prix et de gérer les catégories.
          </p>
          <button className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 mx-auto">
            <Plus size={20} /> Ajouter un produit
          </button>
          <p className="mt-6 text-xs text-primary font-bold uppercase tracking-widest animate-pulse">
            Développement en cours...
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
