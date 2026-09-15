import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { can, ROLE_LABELS } from '../../lib/roles';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  MessageSquare, 
  Users,
  ChevronRight,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard, allow: can.accessAdmin },
  { name: 'Products', path: '/admin/products', icon: Package, allow: can.manageCatalog },
  { name: 'Categories', path: '/admin/categories', icon: Tags, allow: can.manageCatalog },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, allow: can.manageOrders },
  { name: 'Transactions', path: '/admin/transactions', icon: CreditCard, allow: can.viewTransactions },
  { name: 'Settings', path: '/admin/settings', icon: Settings, allow: can.manageSettings },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare, allow: can.accessAdmin },
  { name: 'Team & Roles', path: '/admin/team', icon: Users, allow: can.manageTeam },
];

export default function AdminSidebar() {
  const { logout, profile, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 relative">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-xl flex items-center justify-center text-xl font-bold font-serif">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] tracking-wide text-gray-900 leading-tight">
              LIVING SPACE <span className="text-[#D4A373]">HUB</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider mt-0.5">
              ADMIN PANEL • V1.0
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.filter((item) => item.allow(role)).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#5A5A40]/10 text-[#5A5A40]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="px-4 py-2">
          <p className="text-sm font-bold text-gray-900 truncate">{profile?.name}</p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[role]}</p>
        </div>
        <Link 
          to="/"
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-3">
            <ChevronRight size={18} />
            Back to Store
          </span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-3">
            <LogOut size={18} />
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
