// components/ui/Button.js
export default function Button({ children, variant = "primary", ...props }) {
  let className =
    "px-4 py-2 rounded-lg font-medium transition " +
    (variant === "primary"
      ? "bg-blue-900 text-white hover:bg-blue-800"
      : variant === "secondary"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "border border-gray-400 text-gray-800 hover:bg-gray-100");

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
