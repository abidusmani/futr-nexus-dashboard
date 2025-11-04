import * as React from "react";

// This component will only render its children on the client-side
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // On server or first load, render nothing
  }

  return <>{children}</>; // After mount, render children
}