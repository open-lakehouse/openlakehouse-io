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
import OpenSourceDataEngineering from "./pages/OpenSourceDataEngineering.tsx";
import Learn from "./pages/Learn.tsx";
import GettingStarted from "./pages/learn/GettingStarted.tsx";
import LearnCategory from "./pages/learn/LearnCategory.tsx";
import LearnPost from "./pages/learn/LearnPost.tsx";
import Community from "./pages/Community.tsx";
import Blog from "./pages/Blog.tsx";
import BlogCategory from "./pages/BlogCategory.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Authors from "./pages/Authors.tsx";
import AuthorPage from "./pages/AuthorPage.tsx";
import ReferenceArchitectures from "./pages/refarch/ReferenceArchitectures.tsx";
import ArchitecturePage from "./pages/refarch/ArchitecturePage.tsx";
import IndustryPage from "./pages/refarch/IndustryPage.tsx";
import AgenticLakehouse from "./pages/guides/AgenticLakehouse.tsx";
import AgenticDataEngineering from "./pages/guides/AgenticDataEngineering.tsx";
import SparkMasterclass from "./pages/projects/SparkMasterclass.tsx";
import SparkMatrix from "./pages/projects/SparkMatrix.tsx";
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
            <Route path="/open-source-data-engineering" element={<OpenSourceDataEngineering />} />
            <Route path="/agentic-lakehouse" element={<AgenticLakehouse />} />
            <Route path="/agentic-data-engineering" element={<AgenticDataEngineering />} />
            <Route path="/spark-masterclass" element={<SparkMasterclass />} />
            <Route path="/spark-matrix" element={<SparkMatrix />} />
            <Route path="/reference-architectures" element={<ReferenceArchitectures />} />
            <Route path="/reference-architectures/industries/:slug" element={<IndustryPage />} />
            <Route path="/reference-architectures/:slug" element={<ArchitecturePage />} />
            <Route path="/technologies/delta-lake" element={<DeltaLakePillar />} />
            <Route path="/technologies/:slug" element={<TechnologyCategory />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/getting-started" element={<GettingStarted />} />
            <Route path="/learn/:category" element={<LearnCategory />} />
            <Route path="/learn/:category/:slug" element={<LearnPost />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/:category/:slug" element={<BlogPost />} />
            <Route path="/authors" element={<Authors />} />
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
