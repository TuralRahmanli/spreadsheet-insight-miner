// Enterprise-grade sidebar with comprehensive navigation
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Warehouse,
  ClipboardList,
  BarChart3,
  Settings,
  PlusCircle,
  Users,
  Shield,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProductStore } from '@/lib/productStore';
import { useWarehouseStore } from '@/lib/warehouseStore';
import { ENV_CONFIG } from '@/config/environment';
import { log } from '@/utils/logger';

// Navigation item types
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
  external?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
  requiresAuth?: boolean;
}

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get dynamic data for badges
  const products = useProductStore(state => state.products);
  const warehouses = useWarehouseStore(state => state.warehouses);
  
  // Calculate dynamic values
  const lowStockProducts = products.filter(p => p.status === 'low_stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
  const totalProducts = products.length;
  const totalWarehouses = warehouses.length;

  // Navigation configuration
  const navigationGroups: NavGroup[] = [
    {
      label: 'Ana Menyu',
      defaultOpen: true,
      items: [
        {
          title: 'Ana Səhifə',
          url: '/',
          icon: Home,
          description: 'Sistemin ümumi görnüşü və statistikalar'
        },
        {
          title: 'Məhsullar',
          url: '/products-list',
          icon: Package,
          badge: totalProducts > 0 ? totalProducts : undefined,
          description: 'Məhsul kataloqu və idarəetmə'
        },
        {
          title: 'Anbarlar',
          url: '/warehouses',
          icon: Warehouse,
          badge: totalWarehouses > 0 ? totalWarehouses : undefined,
          description: 'Anbar sistemi və stok idarəetməsi'
        }
      ]
    },
    {
      label: 'Əməliyyatlar',
      items: [
        {
          title: 'Yeni Əməliyyat',
          url: '/add',
          icon: PlusCircle,
          description: 'Giriş və çıxış əməliyyatları'
        },
        {
          title: 'Hesabatlar',
          url: '/reports',
          icon: BarChart3,
          badge: lowStockProducts > 0 ? lowStockProducts : undefined,
          description: 'Analitik hesabatlar və statistikalar'
        }
      ]
    },
    {
      label: 'Sistem',
      items: [
        {
          title: 'Parametrlər',
          url: '/settings',
          icon: Settings,
          description: 'Sistem konfiqurasiyası və parametrləri'
        }
      ]
    }
  ];

  // Add development tools in development mode
  if (ENV_CONFIG.isDevelopment) {
    navigationGroups.push({
      label: 'Developer Tools',
      items: [
        {
          title: 'Performance',
          url: '/dev/performance',
          icon: Activity,
          description: 'Performance monitoring və debug',
          disabled: true
        },
        {
          title: 'Security',
          url: '/dev/security', 
          icon: Shield,
          description: 'Security scan və validation',
          disabled: true
        }
      ]
    });
  }

  // Navigation helpers
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }): string => {
    return isActive 
      ? 'bg-accent text-accent-foreground font-medium' 
      : 'text-sidebar-foreground hover:bg-accent/50 hover:text-accent-foreground';
  };

  const handleNavClick = (item: NavItem) => {
    // Close mobile sidebar when navigation item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
    
    log.debug('Navigation clicked', 'AppSidebar', {
      title: item.title,
      url: item.url,
      currentPath,
      isMobile
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className={isCollapsed ? 'w-14' : 'w-64'}
    >
      <SidebarContent>
        {/* Application Header */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {ENV_CONFIG.app.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                v{ENV_CONFIG.app.version}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group, groupIndex) => {
          const hasActiveItem = group.items.some(item => isActive(item.url));
          
          return (
            <SidebarGroup
              key={`nav-group-${group.label}-${groupIndex}`}
            >
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/90 uppercase tracking-wider">
                  {group.label}
                </SidebarGroupLabel>
              )}

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, itemIndex) => (
                    <SidebarMenuItem key={`nav-item-${item.title}-${itemIndex}`}>
                      <SidebarMenuButton
                        asChild
                        disabled={item.disabled}
                        tooltip={isCollapsed ? item.title : item.description}
                      >
                        <NavLink
                          to={item.url}
                          className={getNavClassName}
                          onClick={() => handleNavClick(item)}
                          aria-label={`Navigate to ${item.title}${item.description ? `: ${item.description}` : ''}`}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <Badge 
                                  variant={
                                    item.title === 'Hesabatlar' && lowStockProducts > 0 
                                      ? 'destructive' 
                                      : 'secondary'
                                  }
                                  className="ml-auto text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
              
              {groupIndex < navigationGroups.length - 1 && !isCollapsed && (
                <Separator className="my-2" />
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        {!isCollapsed ? (
          <div className="p-4 border-t">
            <div className="text-xs text-sidebar-foreground/80 space-y-1">
              <div>Məhsullar: {totalProducts}</div>
              <div>Anbarlar: {totalWarehouses}</div>
              {lowStockProducts > 0 && (
                <div className="text-warning">
                  Az stok: {lowStockProducts}
                </div>
              )}
              {outOfStockProducts > 0 && (
                <div className="text-destructive">
                  Stokda yoxdur: {outOfStockProducts}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" title="System Active" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}