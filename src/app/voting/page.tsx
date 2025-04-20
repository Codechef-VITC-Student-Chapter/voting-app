// app/voting/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import Navbar from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function VotingPage() {
  const [votingStatus, setVotingStatus] = useState({
    president: false,
    vp: false,
    gensec: false
  });
  const [votingStatusLoading, setVotingStatusLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      redirect('/login');
    }
  };

  checkUser();
}, []);
  
  useEffect(() => {
    const fetchVotingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('has_voted_president, has_voted_vp, has_voted_gensec')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setVotingStatus({
            president: data.has_voted_president,
            vp: data.has_voted_vp,
            gensec: data.has_voted_gensec
          });
          setVotingStatusLoading(false);
        }
      }
    };
    
    fetchVotingStatus();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">CodeChef VIT Elections</h1>
        
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Presidential Election</h2>
              <p className="mb-4">Cast your vote for the position of President</p>
              <Button asChild disabled={votingStatus.president}>
                <Link href={!votingStatus.president ? "/voting/president" : '/voting'}>
                  {votingStatusLoading && !votingStatus.president ? 'Fetching Status...' : votingStatus.president ? 'Vote Submitted' : 'Vote Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Vice President Election</h2>
              <p className="mb-4">Cast your vote for the position of Vice President</p>
              <Button asChild disabled={votingStatus.vp}>
                <Link href={!votingStatus.vp ? "/voting/vp" : '/voting'}>
                  {votingStatusLoading && !votingStatus.vp ? 'Fetching Status...' : votingStatus.vp ? 'Vote Submitted' : 'Vote Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">General Secretary Election</h2>
              <p className="mb-4">Cast your vote for the position of General Secretary</p>
              <Button asChild disabled={votingStatus.gensec}>
                <Link href={!votingStatus.gensec ? "/voting/gensec" : '/voting'}>
                  {votingStatusLoading && !votingStatus.gensec ? 'Fetching Status...' : votingStatus.gensec ? 'Vote Submitted' : 'Vote Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}