export default function Loader({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-4',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-indigo-500`}
      ></div>
    </div>
  )
}
