import React from "react";
import {
  ShoppingBag,
  Package,
  Tags,
  Layers,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onSignOut: () => void;
  userEmail?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onSignOut,
  userEmail,
}) => {
  const menuItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "orders", label: "Commandes", icon: <ShoppingBag size={20} /> },
    { id: "products", label: "Produits", icon: <Package size={20} /> },
    { id: "categories", label: "Catégories", icon: <Tags size={20} /> },
    {
      id: "subcategories",
      label: "Sous-catégories",
      icon: <Layers size={20} />,
    },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-white/10 h-screen sticky top-0 flex flex-col pt-8">
      <div className="px-6 mb-10">
        <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-xs">
            H
          </div>
          Helegance
        </h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">
          Admin Panel
        </p>
      </div>

      <nav className="grow px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`${activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-primary"} transition-colors`}
              >
                {item.icon}
              </span>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={14} />}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="px-4 py-3 bg-white/5 rounded-2xl mb-4">
          <p className="text-[10px] text-gray-500 font-bold uppercase truncate">
            {userEmail}
          </p>
          <p className="text-xs text-white font-medium">Administrateur</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
