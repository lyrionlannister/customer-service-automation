type Props = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

const Toggle: React.FC<Props> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-950 ${
      checked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
        checked ? "translate-x-7" : "translate-x-0"
      }`}
    />
  </button>
);

export default Toggle;
