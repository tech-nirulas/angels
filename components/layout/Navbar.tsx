"use client";

import { logout } from "@/features/auth/authSlice";
import { RootState } from "@/store";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Container } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartBadge from "../ui/CartBadge";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Custom Cakes", href: "#custom-cakes" },
];

export default function Navbar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigation = (href: string) => {
    const isHomePage = pathname === "/";

    if (isHomePage) {
      // If on home page, just scroll to the section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, navigate to home page with the hash
      router.push(`/${href}`);
    }

    // Close mobile drawer if open
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  // Handle scroll after navigation from other pages
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [pathname]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? `1px solid ${theme.palette.primary.light}40`
            : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Container maxWidth="lg" sx={{
          px: { xs: 1, md: 0 },
        }}>
          <Toolbar sx={{ justifyContent: "space-between", py: 0, px: 0 }}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Link href="/">
                  <Box sx={{ position: "relative", width: 240, height: 46 }}>
                    <Image
                      src="/assets/logo/angels_header_logo.svg"
                      alt="Angels in my Kitchen Logo"
                      fill
                      sizes="240px"
                      style={{ objectFit: "contain" }}
                      loading="eager"
                    />
                  </Box>
                </Link>
              </Box>
            </motion.div>

            {/* Desktop nav */}
            <Box
              component={motion.nav}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}
            >
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  onClick={() => handleNavigation(link.href)}
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    transition: "all 0.25s",
                    cursor: "pointer",
                    "&:hover": {
                      background: `${theme.palette.primary.main}18`,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
              <CartBadge />

              {!isAuthenticated ? (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    sx={{ ml: 1 }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Avatar
                    onClick={handleAvatarClick}
                    sx={{ cursor: "pointer", ml: 1 }}
                  >
                    {user?.firstName?.[0]}
                  </Avatar>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => router.push("/profile")}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => router.push("/orders")}>
                      My Orders
                    </MenuItem>
                    <MenuItem onClick={() => router.push("/addresses")}>
                      My Addresses
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        dispatch(logout());
                        handleClose();
                        router.push("/");
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            {/* Mobile menu */}
            <IconButton
              sx={{ display: { md: "none" }, color: theme.palette.primary.main }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.default,
            px: 2,
            pt: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(link.href)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {link.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ px: 2, mt: 3 }}>
          {!isAuthenticated ? (
            <>
              <Button
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <Button fullWidth onClick={() => router.push("/profile")}>
                Profile
              </Button>
              <Button fullWidth onClick={() => router.push("/orders")}>
                My Orders
              </Button>
              <Button fullWidth onClick={() => router.push("/addresses")}>
                My Addresses
              </Button>
              <Button
                color="error"
                fullWidth
                onClick={() => {
                  dispatch(logout());
                  setDrawerOpen(false);
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}