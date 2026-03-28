import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <div className="animate-float mb-6">
        <Ghost size={56} className="text-accent opacity-80" />
      </div>
      <div className="font-display font-semibold text-6xl sm:text-8xl text-text-primary opacity-10 mb-4 select-none">
        404
      </div>
      <div className="font-display font-semibold text-xl sm:text-2xl text-text-primary mb-2">
        This route got ghosted.
      </div>
      <div className="font-mono text-sm text-text-muted mb-8">
        ghost probability: 100% · action: go back
      </div>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-accent text-bg font-semibold text-sm hover:bg-accent/90 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
