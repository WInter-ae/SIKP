import { Link, useLocation } from "react-router";
import {
  Menu,
  X,
  Sparkles,
  Home,
  Building2,
  Info,
  Phone,
  LogIn,
} from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "~/components/ui/navigation-menu";

// Navigation items
const NAV_ITEMS = [
  { path: "/", label: "Beranda", icon: Home },
  { path: "/referensi", label: "Referensi", icon: Building2 },
  { path: "/tentang", label: "Tentang", icon: Info },
  { path: "/kontak", label: "Kontak", icon: Phone },
];

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function checkIsActive(path: string): boolean {
    return location.pathname === path;
  }

  function handleToggleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Main header with glassmorphism */}
      <div className={cn("backdrop-blur-xl border-b transition-all duration-300")}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-r from-primary to-secondary",
                  )}
                />
                <div
                  className={cn(
                    "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    "bg-gradient-to-br from-primary to-secondary",
                  )}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                SIKP
              </span>
            </Link>

            {/* Desktop Navigation using shadcn NavigationMenu */}
            <NavigationMenu className="hidden md:flex" viewport={false}>
              <NavigationMenuList className="gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = checkIsActive(item.path);
                  return (
                    <NavigationMenuItem key={item.path}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "group inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
                            "hover:bg-primary/10",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-gray-600 hover:text-gray-900",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                              isActive && "text-primary",
                            )}
                          />
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Login button - Desktop */}
              <Link to="/login" className="hidden md:block">
                <Button
                  className={cn(
                    "rounded-xl font-semibold px-5 transition-all duration-300",
                    "bg-gradient-to-r from-primary to-secondary text-white",
                    "hover:shadow-lg hover:shadow-primary/25 hover:scale-105",
                  )}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={handleToggleMobileMenu}
                className={cn(
                  "md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200",
                )}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu with glassmorphism */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 transition-all duration-500 overflow-hidden",
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="backdrop-blur-xl border-b bg-white/90 border-gray-200/50">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = checkIsActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-200">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-center font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-primary to-secondary text-white",
                )}
              >
                <LogIn className="h-5 w-5" />
                Masuk
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
