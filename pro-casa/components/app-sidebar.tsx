"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  Users,
  Building2,
  Grid3x3,
  Calendar,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
    roles: ["ADMIN", "BROKER", "DEVELOPER"],
  },
  {
    title: "Пользователи",
    icon: Shield,
    url: "/dashboard/users",
    roles: ["ADMIN"],
  },
  {
    title: "Клиенты",
    icon: Users,
    url: "/dashboard/clients",
    roles: ["ADMIN", "BROKER"],
  },
  {
    title: "Новостройки",
    icon: Building2,
    url: "/dashboard/projects",
    roles: ["ADMIN", "BROKER", "DEVELOPER"],
  },
  {
    title: "Шахматка",
    icon: Grid3x3,
    url: "/dashboard/chess",
    roles: ["ADMIN", "BROKER", "DEVELOPER"],
  },
  {
    title: "Брони",
    icon: Calendar,
    url: "/dashboard/bookings",
    roles: ["ADMIN", "BROKER", "DEVELOPER"],
  },
  {
    title: "Калькулятор",
    icon: Calculator,
    url: "/dashboard/calculator",
    roles: ["ADMIN", "BROKER"],
  },
  {
    title: "Аналитика",
    icon: BarChart3,
    url: "/dashboard/analytics",
    roles: ["ADMIN", "BROKER", "DEVELOPER"],
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {}

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!user.firstName || !user.lastName) return "U"
    return `${user.firstName[0]}${user.lastName[0]}`
  }

  // Фильтруем пункты меню по роли пользователя
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role || "BROKER")
  )

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">PRO.casa.kz</h2>
            <p className="text-xs text-muted-foreground">Управление недвижимостью</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Настройки</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Настройки</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === "ADMIN" && "Администратор"}
              {user.role === "BROKER" && "Брокер"}
              {user.role === "DEVELOPER" && "Застройщик"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
