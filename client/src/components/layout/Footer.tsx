export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t py-8">
      <div className="container text-sm text-muted-foreground">
        © {new Date().getFullYear()} EstateAI — CSE 400 Capstone, BUBT.
      </div>
    </footer>
  );
}
