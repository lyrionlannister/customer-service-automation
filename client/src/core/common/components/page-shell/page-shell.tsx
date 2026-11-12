import type { ReactNode } from "react";

import PageMeta from "@common/pages/page-meta";

type PageShellProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

const PageShell = ({
  title,
  description,
  action,
  children,
}: PageShellProps) => {
  return (
    <div className="space-y-6">
      <PageMeta title={title} description={description} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>

        {action}
      </div>

      {children}
    </div>
  );
};

export default PageShell;
