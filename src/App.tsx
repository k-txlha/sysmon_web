import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { RoadmapPage } from "./pages/RoadmapPage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname.replace(/\/+$/, "") || "/";
    return p;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/\/+$/, "") || "/";
      setCurrentPath(p);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith("/docs") || path.startsWith("http")) {
      window.location.href = path;
      return;
    }

    const normalized = path.replace(/\/+$/, "") || "/";
    if (normalized !== currentPath) {
      window.history.pushState(null, "", normalized);
      setCurrentPath(normalized);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Update page title based on current route
  useEffect(() => {
    if (currentPath === "/installation") {
      window.location.href = "/docs/getting-started/installation";
      return;
    }
    if (currentPath === "/api-reference" || currentPath === "/api") {
      window.location.href = "/docs/api-reference/overview";
      return;
    }

    let title = "SysMon — Visibility, before complexity.";
    switch (currentPath) {
      case "/product":
        title = "Product Overview — SysMon";
        break;
      case "/features":
        title = "Features Index & Audit Matrix — SysMon";
        break;
      case "/architecture":
        title = "Architecture & Engineering Specification — SysMon";
        break;
      case "/roadmap":
        title = "Product Roadmap & Maturity — SysMon";
        break;
    }
    document.title = title;
  }, [currentPath]);

  const renderContent = () => {
    switch (currentPath) {
      case "/product":
        return <ProductPage onNavigate={navigate} />;
      case "/features":
        return <FeaturesPage onNavigate={navigate} />;
      case "/architecture":
        return <ArchitecturePage onNavigate={navigate} />;
      case "/roadmap":
        return <RoadmapPage onNavigate={navigate} />;
      case "/":
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main id="main-content">
        {renderContent()}
      </main>
      <Footer onNavigate={navigate} />
    </>
  );
}
