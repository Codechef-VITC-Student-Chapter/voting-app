// components/position-voting.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

type PositionType = 'president' | 'vp' | 'gensec';

export default function PositionVoting({ 
  position, 
  positionLabel,
  hasVotedColumn
}: { 
  position: PositionType;
  positionLabel: string;
  hasVotedColumn: string;
}) {
  const [candidates, setCandidates] = useState<{
    id: string;
    name: string;
    manifesto: string;
    image_path: string;
  }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  
  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('You must be logged in to vote');
          router.push('/login');
          return;
        }
        
        // Check if user has already voted for this position
        const { data } = await supabase
          .from('users')
          .select(hasVotedColumn)
          .eq('id', user.id)
          .single();
          
        // If already voted, show toast and redirect
        if (data && data[hasVotedColumn]) {
          toast.error(`You have already voted for ${positionLabel}`);
          router.push('/voting');
          return;
        }
        
        // If not voted yet, fetch candidates
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('*');
          
        if (candidatesData) {
          setCandidates(candidatesData);
        }
      } catch (error) {
        console.error('Error checking voting status:', error);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVotingStatus();
  }, [hasVotedColumn, positionLabel, router]);
  
  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to vote');
        router.push('/login');
        return;
      }
      
      // Double-check if user has already voted (in case they left page open)
      const { data: checkData } = await supabase
        .from('users')
        .select(hasVotedColumn)
        .eq('id', user.id)
        .single();
        
      if (checkData && checkData[hasVotedColumn]) {
        toast.error(`You have already voted for ${positionLabel}`);
        router.push('/voting');
        return;
      }
      
      // Record the vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          candidate_id: selectedCandidate,
          position: position
        });
        
      if (voteError) throw voteError;
      
      // Update user's voting status
      const { error: updateError } = await supabase
        .from('users')
        .update({ [hasVotedColumn]: true })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success(`Your vote for ${positionLabel} has been recorded`);
      router.push('/voting');
      
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{positionLabel} Election</h1>
      
      <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
        {candidates.map(candidate => (
          <Card key={candidate.id} className="mb-4">
            <CardHeader className="flex items-center gap-4">
              <RadioGroupItem value={candidate.id} id={candidate.id} />
              <Label htmlFor={candidate.id} className="font-semibold text-lg">
                {candidate.name}
              </Label>
              <img 
                src={supabase.storage.from('candidate_images').getPublicUrl(candidate.image_path).data.publicUrl}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {candidate.manifesto}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
      
      <Button 
        onClick={handleSubmitVote} 
        disabled={!selectedCandidate || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Submitting Vote...
          </>
        ) : 'Submit Vote'}
      </Button>
    </div>
  );
}