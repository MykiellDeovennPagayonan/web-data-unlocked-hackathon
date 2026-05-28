import { Link } from 'react-router-dom';
import { FlaskConical, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6" />
          <h1 className="font-semibold text-lg">TrustLayer Manual Testing</h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
