import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Catalogo from "./pages/Catalogo";
import Proveedores from "./pages/Proveedores";
import Movimientos from "./pages/Movimientos";
import OrdenesCompra from "./pages/OrdenesCompra";
import Alertas from "./pages/Alertas";
import Reportes from "./pages/Reportes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/ordenes-compra" element={<OrdenesCompra />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/reportes" element={<Reportes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
