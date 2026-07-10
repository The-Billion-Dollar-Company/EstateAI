interface Props {
  title: string;
  phase: string;
}

/** Temporary stub for routes whose real pages land in later phases. */
export function PlaceholderPage({ title, phase }: Props): React.JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-xl text-center">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">Coming in {phase}.</p>
      </div>
    </section>
  );
}
