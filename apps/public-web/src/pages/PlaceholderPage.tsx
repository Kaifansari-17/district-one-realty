interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-4xl text-navy">{title}</h1>
      <p className="mt-3 text-text-secondary">This page will be built in an upcoming phase.</p>
    </div>
  );
}
