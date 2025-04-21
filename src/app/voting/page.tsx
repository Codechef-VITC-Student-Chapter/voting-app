'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
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
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [electionLoading, setElectionLoading] = useState(true);

  useEffect(() => {
    const fetchElectionStatus = async () => {
      const { data, error } = await supabase
        .from('voting_status')
        .select('is_active')
        .single();
  
      if (!error) {
        setIsElectionActive(data.is_active);
      } else {
        console.error('Error fetching election status:', error);
        setIsElectionActive(false);
      }
      setElectionLoading(false);
    };
  
    fetchElectionStatus();
  }, [supabase]);

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
        {!electionLoading && !isElectionActive ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-semibold">Elections Have Ended</span>
            </div>
            <p className="mt-2">Voting is currently closed. Results will be announced soon.</p>
          </div>
        ) :(
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
        </div>)}
      </div>
    </div>
  );
}