import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index.tsx";
import TechnologyCategory from "./pages/TechnologyCategory.tsx";
import TechnologiesPage from "./pages/Technologies.tsx";
import Learn from "./pages/Learn.tsx";
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/technologies/:slug" element={<TechnologyCategory />} />
            <Route path="/learn" element={<Learn />} />
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
