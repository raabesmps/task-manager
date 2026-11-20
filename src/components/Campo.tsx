type CampoProps = {
  id: string;
  label: string;
  erro?: string;
  children: React.ReactNode;
};

// Label + control + inline error. The control sets its own aria-describedby
// to `${id}-erro`.
export function Campo({ id, label, erro, children }: CampoProps) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {children}
      {erro && (
        <p id={`${id}-erro`} role="alert" className="erro">
          {erro}
        </p>
      )}
    </div>
  );
}
