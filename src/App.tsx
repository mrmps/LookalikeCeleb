import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Plausible from 'plausible-tracker';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Plausible Analytics
  useEffect(() => {
    console.log('Plausible Analytics: Initializing');
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    const apiHost = import.meta.env.VITE_PLAUSIBLE_HOST;
    
    if (!domain || !apiHost) {
      console.log('Plausible Analytics: Environment variables not set, skipping analytics');
      return;
    }

    console.log('Plausible Analytics: Initializing for domain:', domain);

    const plausible = Plausible({
      domain,
      apiHost,
      trackLocalhost: false,
    });

    plausible.enableAutoPageviews();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
