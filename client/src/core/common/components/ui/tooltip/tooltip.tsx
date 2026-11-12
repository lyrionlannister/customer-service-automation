type Props = {
  text: string;
  children: React.ReactNode;
};

const Tooltip: React.FC<Props> = ({ text, children }) => (
  <div className="group relative inline-flex">
    {children}
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-700"
    >
      {text}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
    </div>
  </div>
);

export default Tooltip;
