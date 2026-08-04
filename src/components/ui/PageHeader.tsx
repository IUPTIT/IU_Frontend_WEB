import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** Standard Admin page header — title + optional actions, wraps on small screens. */
function PageHeader({ title, description, actions, className = "" }: Props) {
  return (
    <section className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0 max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </section>
  );
}

export default PageHeader;
