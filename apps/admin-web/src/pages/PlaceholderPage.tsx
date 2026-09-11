interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-border bg-white p-10 text-center">
      <h1 className="text-2xl font-semibold text-navy">{title}</h1>
      <p className="mt-2 text-sm text-text-secondary">This module will be built in an upcoming phase.</p>
    </div>
  );
}
