import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, User, LogOut, Newspaper, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBadge } from './ui/Badge';
import { useState, useEffect } from 'react';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Simulate unread message count (in real app, fetch from API)
  useEffect(() => {
    // This would be replaced with actual API call
    setUnreadCount(0);
  }, []);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home', tab: null },
    { path: '/dashboard', icon: Search, label: 'Search', tab: 'search' },
    { path: '/feed', icon: Newspaper, label: 'Feed', tab: null },
    { path: '/dashboard', icon: MessageCircle, label: 'Messages', tab: 'chats', badge: unreadCount },
    { path: '/profile', icon: User, label: 'Profile', tab: null },
  ];

  const isNavItemActive = (item) => {
    if (item.tab) {
      return location.pathname === item.path && location.search.includes(item.tab);
    }
    return isActive(item.path);
  };

  const handleNavClick = (item) => {
    if (item.tab) {
      navigate(`${item.path}?tab=${item.tab}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-secondary-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <GraduationCap size={32} strokeWidth={2.5} />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  STARK Connect
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge > 0 && <NotificationBadge count={item.badge} />}
                  </button>
                );
              })}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-secondary-700 max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-secondary-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Bar (Floating) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/95 backdrop-blur-lg border border-secondary-200 rounded-2xl shadow-2xl px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(item);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge > 0 && <NotificationBadge count={item.badge} />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;

