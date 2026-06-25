import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import FaqPage from "./pages/FaqPage.tsx";
import TechnologyCategory from "./pages/TechnologyCategory.tsx";
import DeltaLakePillar from "./pages/tech/DeltaLakePillar.tsx";
import TechnologiesPage from "./pages/Technologies.tsx";
import CapabilitiesPage from "./pages/Capabilities.tsx";
import Governance from "./pages/capabilities/Governance.tsx";
import Learn from "./pages/Learn.tsx";
import GettingStarted from "./pages/learn/GettingStarted.tsx";
import LearnCategory from "./pages/learn/LearnCategory.tsx";
import LearnPost from "./pages/learn/LearnPost.tsx";
import Community from "./pages/Community.tsx";
import Blog from "./pages/Blog.tsx";
import BlogCategory from "./pages/BlogCategory.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import AuthorPage from "./pages/AuthorPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/technologies/delta-lake" element={<DeltaLakePillar />} />
            <Route path="/technologies/:slug" element={<TechnologyCategory />} />
            <Route path="/capabilities" element={<CapabilitiesPage />} />
            <Route path="/capabilities/governance" element={<Governance />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/getting-started" element={<GettingStarted />} />
            <Route path="/learn/:category" element={<LearnCategory />} />
            <Route path="/learn/:category/:slug" element={<LearnPost />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/:category/:slug" element={<BlogPost />} />
            <Route path="/authors/:slug" element={<AuthorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
