<<<<<<< HEAD
import { useState, useEffect } from "react";
import {
  Building2,
  Lock,
  Users,
  Phone,
  Home,
  LogOut,
  LogIn,
  BookOpen,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Package,
  Scale,
  TrendingUp,
  DoorOpen,
  ArrowLeftRight,
  Stethoscope,
  AlertTriangle,
  HeartHandshake,
  DollarSign,
  Fingerprint,
  FileText,
  Settings,
  LucideIcon,
  Menu,
  X,
} from "lucide-react";
import { StationDashboard } from "./components/station/StationDashboard";
import { AdmissionDashboard } from "./components/admission/AdmissionDashboard";
import { LoginScreen } from "./components/authentication/LoginScreen";
import { ManualLockupScreen } from "./components/station/ManualLockupScreen";
import { StaffEntryExitScreen } from "./components/station/StaffEntryExitScreen";
import { JournalScreen } from "./components/station/JournalScreen";
import { StaffDeploymentScreen } from "./components/station/StaffDeploymentScreen";
import ComplaintsScreen from "./components/station/ComplaintsScreen";
import PrisonerAdmissionScreen from "./components/admission/PrisonerAdmissionScreen";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/sonner";
import { Skeleton } from "./components/ui/skeleton";
import ugandaPrisonsLogo from "figma:asset/a1a2171c301702e7d1411052b77e2080575d2c9e.png";
import {
  fetchMenus,
  ApiMenuItem,
} from "./services/menuService";

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  page?: string;
  children?: MenuItem[];
};

// Map icon names from API to Lucide React components
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Lock,
  Users,
  Phone,
  Home,
  LogOut,
  LogIn,
  BookOpen,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  Package,
  Scale,
  TrendingUp,
  DoorOpen,
  ArrowLeftRight,
  Stethoscope,
  AlertTriangle,
  HeartHandshake,
  DollarSign,
  Fingerprint,
  FileText,
  Settings,
};

// Helper to get icon from string name
const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Building2; // Default to Building2 if icon not found
};

// Helper to convert API menu items to app menu structure
const buildMenuTree = (apiMenus: ApiMenuItem[]): MenuItem[] => {
  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // First pass: create all menu items
  apiMenus
    .filter((menu) => menu.is_active)
    .forEach((menu) => {
      const menuItem: MenuItem = {
        id: menu.id,
        label: menu.name,
        icon: getIcon(menu.icon),
        page:
          menu.url.replace(/^\//, "").replace(/\//g, "-") ||
          undefined,
        children: [],
      };
      menuMap.set(menu.id, menuItem);
    });

  // Second pass: build tree structure
  apiMenus
    .filter((menu) => menu.is_active)
    .forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      if (!menuItem) return;

      if (menu.parent) {
        const parentItem = menuMap.get(menu.parent);
        if (parentItem) {
          if (!parentItem.children) {
            parentItem.children = [];
          }
          parentItem.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

  return rootMenus;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState("");
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set([])); // Start with all collapsed
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load menus from API
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setMenusLoading(true);
        const response = await fetchMenus();
        const menus = buildMenuTree(response.results);
        setMenuItems(menus);
      } catch (error) {
        console.error("Failed to load menus:", error);
      } finally {
        setMenusLoading(false);
      }
    };

    if (isAuthenticated) {
      loadMenus();
    }
  }, [isAuthenticated]);

  // Helper function to find all parent IDs leading to active page
  const findParentsOfActivePage = (
    items: MenuItem[],
    path: string[] = [],
  ): string[] => {
    for (const item of items) {
      if (item.page === activePage) {
        return path;
      }
      if (item.children && item.children.length > 0) {
        const found = findParentsOfActivePage(item.children, [
          ...path,
          item.id,
        ]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  // Auto-expand parent of active menu item
  useEffect(() => {
    if (menuItems.length > 0) {
      const parentIds = findParentsOfActivePage(menuItems);
      if (parentIds.length > 0) {
        // Expand all parents in the chain
        setExpandedItems(new Set(parentIds));
      } else {
        setExpandedItems(new Set([]));
      }
    }
  }, [activePage, menuItems]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        // Collapse the item
        newSet.delete(id);
      } else {
        // Expand the item
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderMenuItem = (
    item: MenuItem,
    level: number = 0,
  ) => {
    const hasChildren =
      item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const Icon = item.icon;
    const isActive = activePage === item.page;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else if (item.page) {
              setActivePage(item.page);
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? "bg-primary text-white"
              : "hover:bg-muted text-foreground"
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left text-sm">
            {item.label}
          </span>
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) =>
              renderMenuItem(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPage = () => {
    // Map URLs to components
    switch (activePage) {
      case "admissions-management-admissions":
        return (
          <AdmissionDashboard onNavigate={setActivePage} />
        );
      case "admissions-management-prisoner-admission":
        return <PrisonerAdmissionScreen />;
      case "station-management-lockup-manual":
        return <ManualLockupScreen />;
      case "station-management-entry-exit-staff":
        return <StaffEntryExitScreen />;
      case "station-management-entry-exit-prisoners":
        return (
          <div className="space-y-6">
            <div>
              <h1>Prisoner Entry and Exit</h1>
              <p className="text-muted-foreground">
                Manage prisoner entry and exit records with
                barcode scanning
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">
                Prisoner Entry & Exit Module
              </h3>
              <p className="text-muted-foreground">
                This module is under development
              </p>
            </div>
          </div>
        );
      case "station-management-journals":
        return <JournalScreen />;
      case "station-management-staff-deployment":
        return <StaffDeploymentScreen />;
      case "station-management-complaints":
        return <ComplaintsScreen />;
      case "station-dashboard":
      case "station-management-overview":
      case "station-management-lockup-system":
      case "station-management-lockup":
      case "station-management-entry-exit":
      case "station-management-housing":
        return <StationDashboard onNavigate={setActivePage} />;
      case "admissions-management-pending-approvals":
        return (
          <div className="space-y-6">
            <div>
              <h1>Pending Approvals</h1>
              <p className="text-muted-foreground">
                Review and approve pending admissions
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-12 text-center">
              <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Pending Approvals Module</h3>
              <p className="text-muted-foreground">
                This section will display admissions pending
                approval
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1>
                {activePage
                  .split("-")
                  .map(
                    (w) =>
                      w.charAt(0).toUpperCase() + w.slice(1),
                  )
                  .join(" ")}
              </h1>
              <p className="text-muted-foreground">
                Module under development
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-12 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                This module is under development
              </p>
            </div>
          </div>
        );
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActivePage("station-management-lockup"); // Default to Lockup page
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActivePage("station-management-overview");
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
=======
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './components/authentication/LoginScreen';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
>>>>>>> upstream/main
  }

  return (
    <>
<<<<<<< HEAD
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`bg-white border-r border-border flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <div
            className={`${isSidebarOpen ? "block" : "hidden"}`}
          >
            {/* Logo/Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-white border border-border flex items-center justify-center p-1 shrink-0">
                  <img
                    src={ugandaPrisonsLogo}
                    alt="Uganda Prisons Service"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm truncate">
                    Uganda Prisons Service
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    PMIS - Station Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <ScrollArea className="flex-1 py-4">
              <div className="px-3 space-y-1">
                {/* Menu Items */}
                {menusLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-9 w-full"
                      />
                    ))}
                  </div>
                ) : (
                  menuItems.map((item) => renderMenuItem(item))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="text-xs text-muted-foreground text-center mt-2">
                © 2025 Prison Management System
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Toggle Button */}
          <div className="sticky top-0 z-10 bg-white border-b border-border">
            <div className="px-6 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hover:bg-muted"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <div className="p-6">{renderPage()}</div>
        </div>
      </div>
=======
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={location.state?.from || '/station-management/overview'} replace />
            ) : (
              <LoginScreen />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} replace />
            )
          }
        />
      </Routes>
>>>>>>> upstream/main
      <Toaster />
    </>
  );
}