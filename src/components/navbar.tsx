// components/navbar.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '../../utils/supabase/client';
import { usePathname } from 'next/navigation';
import { ModeToggle } from './mode-toggle';

export default function Navbar() {
  const supabase = createClient();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    <nav className="border-b p-4 flex justify-between items-center">
      <div className="flex gap-4">
        <Button variant={pathname === '/admin' ? 'default' : 'ghost'} asChild>
          <Link href="/admin">Dashboard</Link>
        </Button>
        <Button variant={pathname === '/voting' ? 'default' : 'ghost'} asChild>
          <Link href="/voting">Voting</Link>
        </Button>
        <Button variant={pathname === '/results' ? 'default' : 'ghost'} asChild>
          <Link href="/results">Results</Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {userEmail || "Loading..."}
        </span>
        <ModeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
