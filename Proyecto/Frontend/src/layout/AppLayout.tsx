import { Layout, type LayoutProps, TitlePortal } from "react-admin";
//Header y Footer
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";
import { BarraLateral, MenuLateral } from "../components/MenuLateral";

export default function AppLayout({ children, ...props }: LayoutProps) {
  return (
    <>
      <Layout
        {...props}
        appBar={Header}
        sidebar={BarraLateral}
        menu={MenuLateral}>
        {/* Título de la página: React-Admin lo llena según la página actual */}
        <TitlePortal
          component="h1"
          variant="h4"
          sx={{ color: "text.primary", fontWeight: 700, flex: "none", whiteSpace: "normal", mt: 2, mb: 1 }}
        />
        {children}
      </Layout>
      <Footer/>
    </>
  );
}