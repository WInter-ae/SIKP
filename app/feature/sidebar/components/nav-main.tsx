import { ChevronRight, Lock } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { NavItem } from "../types";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar";

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isUrlActive = (url: string) => {
    if (!url || url === "#") {
      return false;
    }
    // Dashboard root paths should match exactly
    if (["/mahasiswa", "/admin", "/dosen", "/mentor"].includes(url)) {
      return pathname === url;
    }
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const isItemActive = (item: NavItem): boolean => {
    if (isUrlActive(item.url)) {
      return true;
    }
    return Boolean(item.items?.some(isItemActive));
  };

  const renderSubItems = (subItems: NavItem[], depth = 0) => {
    return subItems.map((subItem) => {
      const hasNestedItems = Boolean(subItem.items?.length);
      const subItemActive = isItemActive(subItem);

      if (!hasNestedItems) {
        return (
          <SidebarMenuSubItem key={`${depth}-${subItem.title}`}>
            <SidebarMenuSubButton
              asChild={!subItem.disabled}
              isActive={subItemActive}
              className={`h-8 rounded-lg text-[13px] font-medium transition-all duration-200 will-change-transform ${
                subItem.disabled
                  ? "opacity-50 cursor-not-allowed grayscale"
                  : "hover:translate-x-1 hover:bg-yellow-300/15 hover:shadow-sm data-[active=true]:bg-yellow-300/80 data-[active=true]:text-black data-[active=true]:shadow-md"
              }`}
            >
              {subItem.disabled ? (
                <div className="flex w-full items-center justify-between">
                  <span>{subItem.title}</span>
                  <Lock className="h-3 w-3" />
                </div>
              ) : (
                <Link to={subItem.url} onClick={handleLinkClick}>
                  <span>{subItem.title}</span>
                </Link>
              )}
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      }

      return (
        <SidebarMenuSubItem key={`${depth}-${subItem.title}`}>
          <Collapsible
            defaultOpen={subItem.isActive || subItemActive}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuSubButton
                isActive={subItemActive}
                className="h-8 rounded-lg text-[13px] font-semibold transition-all duration-200 will-change-transform hover:translate-x-1 hover:bg-yellow-300/15 hover:shadow-sm data-[active=true]:bg-yellow-300 data-[active=true]:text-black data-[active=true]:shadow-md"
              >
                <span>{subItem.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuSubButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {renderSubItems(subItem.items ?? [], depth + 1)}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSubItem>
      );
    });
  };

  return (
    <SidebarGroup className="px-2 py-3">
      <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold tracking-[0.12em] uppercase">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const itemActive = isItemActive(item);

          // Jika tidak ada sub items, render sebagai link biasa
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!item.disabled}
                  tooltip={item.title}
                  isActive={itemActive}
                  disabled={item.disabled}
                  className={`h-10 rounded-xl px-3 text-[15px] font-medium transition-all duration-200 will-change-transform ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed grayscale"
                      : "hover:translate-x-1 hover:bg-yellow-300/15 hover:shadow-sm data-[active=true]:bg-yellow-300 data-[active=true]:text-black data-[active=true]:shadow-md"
                  }`}
                >
                  {item.disabled ? (
                    <div className="flex w-full items-center">
                      {item.icon && <item.icon />}
                      <span className="flex-1">{item.title}</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  ) : (
                    <Link to={item.url} onClick={handleLinkClick}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Jika ada sub items, render dengan collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || itemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={itemActive}
                    className="h-10 rounded-xl px-3 text-[15px] font-semibold transition-all duration-200 will-change-transform hover:translate-x-1 hover:bg-yellow-300/15 hover:shadow-sm data-[active=true]:bg-yellow-300 data-[active=true]:text-black data-[active=true]:shadow-md"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {renderSubItems(item.items ?? [])}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
