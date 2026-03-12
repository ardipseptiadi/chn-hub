import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Experience", path: "/experience" },
  { label: "Consultations", path: "/consultations" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [settings] = useSettings();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="font-serif text-2xl text-foreground">
          {settings.businessName}<span className="text-primary">.</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Auth Links */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/portal" className="cursor-pointer">
                    <UserIcon size={16} className="mr-2" />
                    Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="sm" className="h-9 px-3" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="rounded-full h-9 px-4" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild size="sm" className="w-full rounded-full">
                <Link to="/products" onClick={() => setMobileOpen(false)}>
                  Shop Now
                </Link>
              </Button>

              {/* Mobile Auth Links */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start w-full"
                    asChild
                  >
                    <Link to="/portal" onClick={() => setMobileOpen(false)}>
                      <UserIcon size={16} className="mr-2" />
                      My Portal
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start w-full text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full rounded-full" asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
