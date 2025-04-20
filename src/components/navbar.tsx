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
      } else {
        setUserEmail(null);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Links for logged in users
  const loggedInLinks = (
    <>
      <Button variant={pathname === '/admin' ? 'default' : 'ghost'} asChild>
        <Link href="/admin">Dashboard</Link>
      </Button>
      <Button variant={pathname.includes('/voting') ? 'default' : 'ghost'} asChild>
        <Link href="/voting">Voting</Link>
      </Button>
      <Button variant={pathname === '/results' ? 'default' : 'ghost'} asChild>
        <Link href="/results">Results</Link>
      </Button>
      <Button variant={pathname === '/candidates' ? 'default' : 'ghost'} asChild>
        <Link href="/candidates">Candidates</Link>
      </Button>
    </>
  );

  // Links for guests (not logged in)
  const guestLinks = (
    <>
      <Button variant={pathname === '/login' ? 'default' : 'ghost'} asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button variant={pathname === '/candidates' ? 'default' : 'ghost'} asChild>
        <Link href="/candidates">Candidates</Link>
      </Button>
    </>
  );

  return (
    <nav className="border-b p-4">
      {/* Desktop Nav */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex gap-4">
          {userEmail ? loggedInLinks : guestLinks}
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm truncate max-w-[160px]">{userEmail}</span>
          )}
          <ModeToggle />
          {userEmail && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
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
          {userEmail && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {(userEmail ? loggedInLinks : guestLinks)}
          {userEmail && (
            <div className="pt-4 border-t mt-4">
              <span className="text-sm font-medium px-4">
                {userEmail}
              </span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
