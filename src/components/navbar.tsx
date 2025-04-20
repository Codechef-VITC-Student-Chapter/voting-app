// components/navbar.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '../../utils/supabase/client';
import { usePathname } from 'next/navigation';
import { ModeToggle } from './mode-toggle';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const supabase = createClient();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUserEmail(data.user.email!);
      }
    };
    
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="border-b p-4">
      {/* Desktop Nav */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex gap-4">
          <Button variant={pathname === '/admin' ? 'default' : 'ghost'} asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button variant={pathname.includes('/voting') ? 'default' : 'ghost'} asChild>
            <Link href="/voting">Voting</Link>
          </Button>
          <Button variant={pathname === '/results' ? 'default' : 'ghost'} asChild>
            <Link href="/results">Results</Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm truncate max-w-[160px]">
            {userEmail || "Loading..."}
          </span>
          <ModeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <Button
            variant={pathname === '/admin' ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button
            variant={pathname === '/voting' ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/voting">Voting</Link>
          </Button>
          <Button
            variant={pathname === '/results' ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/results">Results</Link>
          </Button>
          <div className="pt-4 border-t mt-4">
            <span className="text-sm font-medium px-4">
              {userEmail || "Loading..."}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
