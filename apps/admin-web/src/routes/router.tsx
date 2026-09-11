import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireAuth, RedirectIfAuthed } from "@/components/RequireAuth";
import { LoginPage } from "@/pages/LoginPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PropertiesPage } from "@/pages/properties/PropertiesPage";
import { PropertyFormPage } from "@/pages/properties/PropertyFormPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectFormPage } from "@/pages/projects/ProjectFormPage";
import { BuildersPage } from "@/pages/builders/BuildersPage";
import { LocationsPage } from "@/pages/locations/LocationsPage";
import { AmenitiesPage } from "@/pages/lookups/AmenitiesPage";
import { FeaturesPage } from "@/pages/lookups/FeaturesPage";
import { AgentsPage } from "@/pages/agents/AgentsPage";
import { LeadsPage } from "@/pages/leads/LeadsPage";
import { SiteVisitsPage } from "@/pages/siteVisits/SiteVisitsPage";
import { BlogsPage } from "@/pages/blogs/BlogsPage";
import { BlogFormPage } from "@/pages/blogs/BlogFormPage";
import { MessagesPage } from "@/pages/messages/MessagesPage";
import { ActivityLogsPage } from "@/pages/activityLogs/ActivityLogsPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuthed>
        <LoginPage />
      </RedirectIfAuthed>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "properties", element: <PropertiesPage /> },
          { path: "properties/new", element: <PropertyFormPage /> },
          { path: "properties/:id/edit", element: <PropertyFormPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/new", element: <ProjectFormPage /> },
          { path: "projects/:id/edit", element: <ProjectFormPage /> },
          { path: "builders", element: <BuildersPage /> },
          { path: "locations", element: <LocationsPage /> },
          { path: "amenities", element: <AmenitiesPage /> },
          { path: "features", element: <FeaturesPage /> },
          { path: "agents", element: <AgentsPage /> },
          { path: "leads", element: <LeadsPage /> },
          { path: "site-visits", element: <SiteVisitsPage /> },
          { path: "blogs", element: <BlogsPage /> },
          { path: "blogs/new", element: <BlogFormPage /> },
          { path: "blogs/:id/edit", element: <BlogFormPage /> },
          { path: "messages", element: <MessagesPage /> },
          { path: "reports", element: <PlaceholderPage title="Reports" /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "activity-logs", element: <ActivityLogsPage /> },
          { path: "*", element: <PlaceholderPage title="Page Not Found" /> },
        ],
      },
    ],
  },
]);
