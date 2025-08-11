"use client"

import React, { useState, useEffect } from "react"
import {
  Frame,
  GalleryVerticalEnd,
  Home,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardService } from "@/sdk/services/dashboard-service";
import { Spinner } from "@/components/ui/spinner";



function getNavigation(items: string[]) {

  const tablesNav = items.map((item) => ({
    title: item,
    url: `/dashboard/data?name=${item}`,
    icon: Frame,
  }));

  return [
    {
      title: "Content",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "Calendar",
          url: "/dashboard/calendar",
          icon: Date,
        },
        {
          title: "Posts",
          url: "/dashboard/posts",
          icon: Document,
        },
        {
          title: "Media",
          url: "/dashboard/media",
          icon: Image,
        }
      ],
    },
    {
      title: "Data",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: tablesNav
    },
    {
      title: "Logs",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "marketing-service",
          url: "#",
        },
        {
          title: "dashboard-service",
          url: "#",
        },
        {
          title: "OllamaProvider",
          url: "#",
        },
        {
          title: "SchedulerPlugin",
          url: "#",
        },
        
      ],
    }
  ];
}

const defaultMenu = {
  user: {
    name: "admin",
    email: "admin@admin.com",
    avatar: "",
  },
  teams: [
    {
      name: "Admin Dashboard",
      logo: GalleryVerticalEnd,
      plan: "Basic",
    }
  ],
  navMain: [],
  projects: [
    {
      name: "New Year Campaign",
      url: "/dashboard/data?name=campaigns",
      icon: Frame,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<any>(defaultMenu);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tableNames = await DashboardService.getTableNames();

        menu.navMain = getNavigation(tableNames);

        setMenu(menu);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{loading && <Spinner size="small" />}
        <TeamSwitcher teams={menu.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu.navMain} />
        <NavProjects projects={menu.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={menu.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
