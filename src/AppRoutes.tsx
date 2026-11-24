// The one route table, shared by the browser app (App.tsx) and the build-time
// prerender (entry-server.tsx). Add a route here and list its URLs in
// prerenderRoutes() below, or the build fails its sitemap coverage check.
import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import FaqPage from "./pages/FaqPage";
import TechnologyCategory from "./pages/TechnologyCategory";
import DeltaLakePillar from "./pages/tech/DeltaLakePillar";
import TechnologiesPage from "./pages/Technologies";
import OpenSourceDataEngineering from "./pages/OpenSourceDataEngineering";
import Learn from "./pages/Learn";
import GettingStarted from "./pages/learn/GettingStarted";
import LearnCategory from "./pages/learn/LearnCategory";
import LearnPost from "./pages/learn/LearnPost";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import BlogCategory from "./pages/BlogCategory";
import BlogPost from "./pages/BlogPost";
import Authors from "./pages/Authors";
import AuthorPage from "./pages/AuthorPage";
import ReferenceArchitectures from "./pages/refarch/ReferenceArchitectures";
import ArchitecturePage from "./pages/refarch/ArchitecturePage";
import IndustryPage from "./pages/refarch/IndustryPage";
import AgenticLakehouse from "./pages/guides/AgenticLakehouse";
import AgenticDataEngineering from "./pages/guides/AgenticDataEngineering";
import SparkMasterclass from "./pages/projects/SparkMasterclass";
import { SparkMatrix, Wiki } from "./lazyPages";
import wikiRoutes from "virtual:wiki-routes";
import NotFound from "./pages/NotFound";

import PodcastIndex from "./pages/podcast/PodcastIndex";
import EpisodePage from "./pages/podcast/EpisodePage";
import { allPosts, authors, categories, learnCategories, learnPosts, postPath } from "./content/content";
import { TECH_SLUGS } from "./pages/TechnologyCategory";
import { INDUSTRIES, PATTERNS, HUB_PATH, industryPath, patternPath } from "./content/reference-architectures";
import { SHOW, episodes, episodePath } from "./content/podcast";

export const AppRoutes = () => (
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
      <Route path="/podcast" element={<PodcastIndex />} />
      <Route path="/podcast/:slug" element={<EpisodePage />} />
      <Route path="/wiki/*" element={<Wiki />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
);

/** Every URL the app serves, for scripts/prerender.mjs. */
export const prerenderRoutes = (): string[] => {
  const urls = [
    "/",
    "/faq",
    "/technologies",
    "/open-source-data-engineering",
    "/agentic-lakehouse",
    "/agentic-data-engineering",
    "/spark-masterclass",
    "/spark-matrix",
    "/learn",
    "/learn/getting-started",
    "/community",
    "/blog",
    "/authors",
    SHOW.path,
    HUB_PATH,
    ...PATTERNS.map((p) => patternPath(p.slug)),
    ...INDUSTRIES.map((i) => industryPath(i.slug)),
    ...TECH_SLUGS.map((s) => `/technologies/${s}`),
    "/technologies/delta-lake",
    ...categories.map((c) => `/blog/category/${c}`),
    ...learnCategories.map((c) => `/learn/${c}`),
    // Drafts are not prerendered, so their URLs 404; use status: preview to share one.
    ...allPosts.filter((p) => p.status !== "draft").flatMap((p) => p.include.map((s) => postPath(p, s))),
    ...learnPosts.map((p) => postPath(p, "learn")),
    ...Object.keys(authors).map((a) => `/authors/${a}`),
    ...episodes.map(episodePath),
    ...wikiRoutes,
  ];
  return [...new Set(urls)];
};
