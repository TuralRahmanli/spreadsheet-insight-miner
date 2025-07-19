import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Package, Home, FileText, Settings, BarChart3, Plus, Menu, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { title: "Ana Səhifə", href: "/", icon: Home },
  { title: "Anbarlar", href: "/warehouses", icon: Package },
  { title: "Məhsullar", href: "/products-list", icon: ShoppingCart },
  { title: "Hesabatlar", href: "/reports", icon: BarChart3 },
  { title: "Şablonlar", href: "/templates", icon: FileText },
  { title: "Yeni Əməliyyat", href: "/add", icon: Plus },
  { title: "Parametrlər", href: "/settings", icon: Settings },
];

const SidebarContent = ({ isMobile = false, onItemClick }: { isMobile?: boolean; onItemClick?: () => void }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-14 items-center border-b px-4 lg:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <Package className="h-6 w-6 text-primary" />
        <span>İnventar Sistemi</span>
      </div>
    </div>
    <div className="flex-1 overflow-auto py-2">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  </div>
);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:w-64 md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Header & Main Content Container */}
      <div className="flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6 md:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Navigation menyusunu aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SidebarContent isMobile onItemClick={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-sm sm:text-base">İnventar Sistemi</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 w-full min-w-0">
          <div className="w-full max-w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}