"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_TITLE } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, Package, ShoppingCart, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  const activeMenuItem = menuItems.find((item) => item.path === pathname);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 border-b">
          <h1 className="font-bold truncate">{APP_TITLE}</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => router.push(item.path)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="text-sm text-left overflow-hidden">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        {/* Navigation - Dark Brown Header */}
        <nav style={{ backgroundColor: 'var(--header-bg)' }} className="text-white shadow-md relative z-50 w-full">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isMobile && <SidebarTrigger className="text-white" />}
                <Link href="/">
                  <img
                    src="/logo.jpg"
                    alt="Boulangerie Saint Marc"
                    className="h-12 md:h-16 cursor-pointer"
                  />
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-6 items-center">
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                  <Link href="/products">Products</Link>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 w-full overflow-x-auto">{children}</main>
      </SidebarInset>
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
