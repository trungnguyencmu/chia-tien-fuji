import { Spinner } from './Icon';

interface PageLoaderProps {
  label?: string;
}

/** Full-area loading state shared by route fallbacks and page-level fetches. */
export function PageLoader({ label = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner size={32} />
      <span>{label}</span>
    </div>
  );
}
