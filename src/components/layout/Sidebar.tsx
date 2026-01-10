import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Table,
  Search,
  BarChart3,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import ugandaPrisonsLogo from 'figma:asset/a1a2171c301702e7d1411052b77e2080575d2c9e.png';
import { fetchMenus, ApiMenuItem } from '../../services/menuService';
import { fetchReports } from '../../services/reportsService';
import { Report } from '../../models/reports';
import { useAuth } from '../../contexts/AuthContext';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
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
  BarChart3,
};

// Helper to get icon from string name
const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Building2;
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
        path: menu.url || undefined,
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

// Helper to integrate reports into menu structure grouped by module
const integrateReportsIntoMenus = (menus: MenuItem[], reports: Report[]): MenuItem[] => {
  if (!reports || reports.length === 0) {
    return menus;
  }

  // Group reports by module (normalize to lowercase for matching)
  const reportsByModule = reports.reduce((acc, report) => {
    const module = (report.module || 'general').toLowerCase().trim();
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  // Process each top-level menu to add Reports submenu if module matches
  const updatedMenus = menus.map((menu) => {
    const menuCopy = { ...menu };
    
    // Normalize menu label for matching (e.g., "Automated Gate Management" -> "gate")
    // Try to match against report module names
    const menuLabel = menu.label.toLowerCase();
    
    // Find matching reports by checking if module name is contained in menu label
    // or if menu label contains the module name
    let matchingReports: Report[] = [];
    
    Object.entries(reportsByModule).forEach(([module, reports]) => {
      // Check for various matching patterns:
      // 1. Module name in menu label (e.g., "gate" in "Automated Gate Management")
      // 2. Menu label in module name
      // 3. Exact match
      if (menuLabel.includes(module) || module.includes(menuLabel) || 
          menuLabel.replace(/\s+/g, '').includes(module.replace(/\s+/g, '')) ||
          module.replace(/\s+/g, '').includes(menuLabel.replace(/\s+/g, ''))) {
        matchingReports = [...matchingReports, ...reports];
      }
    });
    
    if (matchingReports.length > 0) {
      // Ensure children array exists
      if (!menuCopy.children) {
        menuCopy.children = [];
      }
      
      // Find or create Reports submenu
      let reportsMenu = menuCopy.children.find(child => child.label === 'Reports');
      
      if (!reportsMenu) {
        reportsMenu = {
          id: `${menu.id}-reports`,
          label: 'Reports',
          icon: BarChart3,
          children: [],
        };
        menuCopy.children.push(reportsMenu);
      }
      
      // Ensure children array exists
      if (!reportsMenu.children) {
        reportsMenu.children = [];
      }
      
      // Add report items as children (avoid duplicates)
      matchingReports.forEach((report) => {
        const reportId = `report-${report.id}`;
        if (!reportsMenu!.children!.some(child => child.id === reportId)) {
          reportsMenu!.children!.push({
            id: reportId,
            label: report.name,
            icon: FileText,
            path: `/reports/viewer/${report.id}`,
          });
        }
      });
    }
    
    return menuCopy;
  });

  return updatedMenus;
};

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([]));
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  // Load menus from API
  const loadMenus = async () => {
    try {
      setMenusLoading(true);
      const [menusResponse, reportsResponse] = await Promise.all([
        fetchMenus(),
        fetchReports().catch(() => ({ results: [] })),
      ]);
      
      const menus = buildMenuTree(menusResponse.results);
      const activeReports = reportsResponse.results?.filter(r => r.is_active) || [];
      setReports(activeReports);
      
      // Integrate reports into menu structure
      const menusWithReports = integrateReportsIntoMenus(menus, activeReports);
      setMenuItems(menusWithReports);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setMenusLoading(false);
    }
  };

  // Load menus on mount and when location filters change
  // useFilterRefresh(loadMenus);
  useEffect(() => {
    loadMenus();
  }, []);

  // Helper function to find all parent IDs leading to active page
  const findParentsOfActivePath = (
    items: MenuItem[],
    path: string[] = []
  ): string[] => {
    for (const item of items) {
      if (item.path === location.pathname) {
        return path;
      }
      if (item.children && item.children.length > 0) {
        const found = findParentsOfActivePath(item.children, [...path, item.id]);
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
      const parentIds = findParentsOfActivePath(menuItems);
      if (parentIds.length > 0) {
        setExpandedItems(new Set(parentIds));
      } else {
        setExpandedItems(new Set([]));
      }
    }
  }, [location.pathname, menuItems]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const isTopLevel = level === 0;

    //alert(hasChildren);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'hover:bg-muted text-foreground'
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}>
            
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left text-sm">{item.label}</span>
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>
        {hasChildren && isExpanded && (
          <>
            <div className="mt-1">
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </div>
            {isTopLevel && (
              <div className="my-2 mx-3 border-t border-border" />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white border-r border-border flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
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
              <h2 className="text-sm truncate">Uganda Prisons Service</h2>
              <p className="text-xs text-muted-foreground truncate">
                PMIS - Station Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-1">
            {menusLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <>
                {menuItems.map((item) => renderMenuItem(item))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={async () => {
              await logout();
            }}
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
  );
}
