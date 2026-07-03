import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider, useApp } from "./context/AppContext";

function AppContent() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="animate-pulse text-sm font-medium tracking-wide">Initializing Trainistry Cloud Ledger Node...</div>
      </div>
    );
  }

  // Render the existing Figma UI template routing structure
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
