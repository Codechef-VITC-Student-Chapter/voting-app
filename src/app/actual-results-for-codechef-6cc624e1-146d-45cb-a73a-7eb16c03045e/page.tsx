'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { H1 } from '@/components/ui/h1';

type Candidate = {
  id: string;
  name: string;
  image_path: string;
  manifesto: string;
  created_at: string;
}

type VoteCounts = {
  [key: string]: {
    president: number;
    vp: number;
    gensec: number;
  }
}

export default function ResultsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [loading, setLoading] = useState(true);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [password, setPassword] = useState('');
  const supabase = createClient();

  const verifyPassword = () => {
    if (password === 'CodeChef@2425') {
      setPasswordVerified(true);
    } else {
      alert('Incorrect password');
    }
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!passwordVerified) return;
      
      try {
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: true });

        if (candidatesError) throw candidatesError;
        
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('candidate_id, position');

        if (votesError) throw votesError;
        
        const counts: VoteCounts = {};
        
        votesData.forEach(vote => {
          if (!counts[vote.candidate_id]) {
            counts[vote.candidate_id] = { president: 0, vp: 0, gensec: 0 };
          }
          
          if (vote.position === 'president') {
            counts[vote.candidate_id].president += 1;
          } else if (vote.position === 'vp') {
            counts[vote.candidate_id].vp += 1;
          } else if (vote.position === 'gensec') {
            counts[vote.candidate_id].gensec += 1;
          }
        });
        
        setCandidates(candidatesData || []);
        setVoteCounts(counts);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [supabase, passwordVerified]);

  if (!passwordVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className='p-4 py-8 w-[80%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[30%] z-50'>
          <CardHeader>
            <CardTitle>Access Results</CardTitle>
            <CardDescription>Enter the password to view election results</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-4"
              placeholder="Enter access code"
            />
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={verifyPassword}
            >
              View Results
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-8 space-y-8">
        <H1>Election Results</H1>
        <div className='space-x-4 mb-4'>
          <div>
            Votes for,
          </div>
          <Badge variant="default" className="px-4 py-2">
            President
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            Vice President
          </Badge>
          <Badge className="px-4 py-2">
            General Secretary
          </Badge>
        </div>
        <div className='flex gap-8 md:flex-row flex-col'>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className='flex flex-col items-center'>
                  <Image
                    src={supabase.storage
                      .from('candidate_images')
                      .getPublicUrl(candidate.image_path).data.publicUrl}
                    alt={candidate.name}
                    className=" rounded-lg"
                    height={150}
                    width={150}
                  />
                  <CardTitle className='text-center'>{candidate.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 gap-4 flex items-center justify-center">
                  <Badge variant="default" className="px-4 py-2">
                    {voteCounts[candidate.id]?.president || 0}
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    {voteCounts[candidate.id]?.vp || 0}
                  </Badge>
                  <Badge className="px-4 py-2">
                    {voteCounts[candidate.id]?.gensec || 0}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className='sticky top-10'>
            <H1>Leading Candidates</H1>
            <div className="space-y-6 mt-8">
              {/* President Results */}
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2">Presidential Results</h3>
                {(() => {
                  const presidentCandidates = candidates
                    .filter(c => voteCounts[c.id]?.president > 0)
                    .sort((a, b) => voteCounts[b.id].president - voteCounts[a.id].president);
                  
                  const maxVotes = Math.max(...presidentCandidates.map(c => voteCounts[c.id].president));

                  return presidentCandidates.length > 0 ? (
                    presidentCandidates.map(candidate => (
                      <div key={candidate.id} className="flex justify-between items-center p-4 border rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          <span>{candidate.name}</span>
                          {voteCounts[candidate.id].president === maxVotes && '👑'}
                        </div>
                        <Badge variant="default">
                          {voteCounts[candidate.id].president} votes
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 p-4 border rounded-lg">No votes recorded</div>
                  );
                })()}
              </div>

              {/* VP Results */}
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2">Vice Presidential Results</h3>
                {(() => {
                  const vpCandidates = candidates
                    .filter(c => voteCounts[c.id]?.vp > 0)
                    .sort((a, b) => voteCounts[b.id].vp - voteCounts[a.id].vp);
                  
                  const maxVotes = Math.max(...vpCandidates.map(c => voteCounts[c.id].vp));

                  return vpCandidates.length > 0 ? (
                    vpCandidates.map(candidate => (
                      <div key={candidate.id} className="flex justify-between items-center p-4 border rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          <span>{candidate.name}</span>
                          {voteCounts[candidate.id].vp === maxVotes && '👑'}
                        </div>
                        <Badge variant="secondary">
                          {voteCounts[candidate.id].vp} votes
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 p-4 border rounded-lg">No votes recorded</div>
                  );
                })()}
              </div>

              {/* General Secretary Results */}
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2">General Secretary Results</h3>
                {(() => {
                  const gensecCandidates = candidates
                    .filter(c => voteCounts[c.id]?.gensec > 0)
                    .sort((a, b) => voteCounts[b.id].gensec - voteCounts[a.id].gensec);
                  
                  const maxVotes = Math.max(...gensecCandidates.map(c => voteCounts[c.id].gensec));

                  return gensecCandidates.length > 0 ? (
                    gensecCandidates.map(candidate => (
                      <div key={candidate.id} className="flex justify-between items-center p-4 border rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          <span>{candidate.name}</span>
                          {voteCounts[candidate.id].gensec === maxVotes && '👑'}
                        </div>
                        <Badge>
                          {voteCounts[candidate.id].gensec} votes
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 p-4 border rounded-lg">No votes recorded</div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {candidates.length === 0 && (
          <div className="text-center mt-8">
            No candidates found. Results will be displayed here once available.
          </div>
        )}
      </div>
    </div>
  );
}