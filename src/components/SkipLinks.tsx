// Skip links for accessibility - allows keyboard users to skip navigation
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md m-2 inline-block focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Ana məzmuna keç
      </a>
      <a
        href="#navigation"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md m-2 inline-block focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Naviqasiyaya keç
      </a>
    </div>
  );
}