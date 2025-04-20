'use client';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '../../../utils/supabase/client';
import { H1 } from '@/components/ui/h1';
import { FlickeringGrid } from '@/components/flickering-grid';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const supabase = createClient();

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        window.location.href = '/';
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [supabase]);

  // --- Implement login and signup ---
  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      window.location.href = '/';
    }
  };

  const signup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      toast.error(error.message || 'Signup failed');
    } else {
      toast.success('Signup successful! Please check your email for confirmation.');
    }
  };
  // -----------------------------------

  const handleSubmit = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className='flex relative flex-col gap-8 w-screen h-screen justify-center items-center'>
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full w-screen h-screen"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
      <div className='z-50 text-center'>
        <H1>CodeChef VITC Voting Portal</H1>
      </div>
      <Card className='p-4 w-[30%] z-50'>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          <form className='flex flex-col gap-4' onSubmit={e => e.preventDefault()}>
            <Label htmlFor="email">Email:</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
            <Label htmlFor="password">Password:</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
            <div className='gap-5 flex justify-end'>
              <Button 
                type="button"
                onClick={() => handleSubmit(login)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : 'Login'}
              </Button>
              <Button 
                type="button"
                onClick={() => handleSubmit(signup)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : 'Sign up'}
              </Button>
            </div>
          </form>
        </CardDescription>
      </Card>
      <Button variant="link" className='text-2xl font-bold z-50'>
        <Link href="/candidates">
          View Candidates
        </Link>
      </Button>
    </div>
  );
}
