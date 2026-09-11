import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { PropertiesPage } from "@/pages/properties/PropertiesPage";
import { PropertyDetailPage } from "@/pages/properties/PropertyDetailPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { BuildersPage } from "@/pages/builders/BuildersPage";
import { BuilderDetailPage } from "@/pages/builders/BuilderDetailPage";
import { LocationsPage } from "@/pages/locations/LocationsPage";
import { LocationDetailPage } from "@/pages/locations/LocationDetailPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { BlogPage } from "@/pages/blog/BlogPage";
import { BlogDetailPage } from "@/pages/blog/BlogDetailPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "properties", element: <PropertiesPage /> },
      { path: "properties/:slug", element: <PropertyDetailPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:slug", element: <ProjectDetailPage /> },
      { path: "builders", element: <BuildersPage /> },
      { path: "builders/:slug", element: <BuilderDetailPage /> },
      { path: "locations", element: <LocationsPage /> },
      { path: "locations/:slug", element: <LocationDetailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogDetailPage /> },
      { path: "*", element: <PlaceholderPage title="Page Not Found" /> },
    ],
  },
]);
