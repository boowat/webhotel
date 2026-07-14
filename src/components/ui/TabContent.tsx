export function TabContent({ children }: { children: React.ReactNode }) {
  return <div className="tab-content bg-base-100 mt-4">{children}</div>;
}

export function TabHandler({
  children,
  defaultChecked,
}: {
  children: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label className="tab w-1/2 cursor-pointer gap-2 rounded-sm font-medium text-base-content/40 shadow-none transition-colors has-checked:font-semibold has-checked:ring-1 has-checked:text-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-primary has-focus-visible:ring-offset-2">
      <input
        type="radio"
        name="tabs_option"
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {children}
    </label>
  );
}
