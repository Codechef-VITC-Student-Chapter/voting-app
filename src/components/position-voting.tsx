'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type PositionType = 'president' | 'vp' | 'gensec';
type VotingColumn = 'has_voted_president' | 'has_voted_vp' | 'has_voted_gensec';

export default function PositionVoting({ 
  position, 
  positionLabel,
  hasVotedColumn
}: { 
  position: PositionType;
  positionLabel: string;
  hasVotedColumn: VotingColumn;
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
          .single<Record<VotingColumn, boolean>>(); // Add generic type
          
        // If already voted, show toast and redirect
        if (data && data[hasVotedColumn as VotingColumn]) {
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
        .single<Record<VotingColumn, boolean>>(); // Add generic type
        
      if (checkData && checkData[hasVotedColumn as VotingColumn]) {
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
      
      // Update user's voting status with type assertion
      const { error: updateError } = await supabase
        .from('users')
        .update({ [hasVotedColumn]: true } as Record<VotingColumn, boolean>)
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
      
      <RadioGroup 
      value={selectedCandidate} 
      onValueChange={setSelectedCandidate} 
      className="space-y-6"
    >
      {candidates.map(candidate => {
        const imgUrl = supabase.storage.from('candidate_images').getPublicUrl(candidate.image_path).data.publicUrl
        return (
          <Card key={candidate.id} className="mb-4 shadow-lg">
            <div className="flex justify-center flex-row items-center gap-6 p-6">
              <RadioGroupItem 
                value={candidate.id} 
                id={candidate.id} 
                className="w-8 h-8 border-2 border-primary rounded-full mb-4 transition-all duration-150"
                />
              {/* Left: Radio + Photo + Name */}
              <div className="flex flex-col items-center w-40 min-w-40">

                <Image 
                  src={imgUrl}
                  alt={candidate.name}
                  className="rounded-3xl object-cover border-4 border-primary shadow"
                  width={150}
                  height={150}
                />
                <Label htmlFor={candidate.id} className="mt-3 font-semibold text-lg text-center">
                  {candidate.name}
                </Label>
              </div>
              {/* Right: Manifesto */}
              <CardContent className="flex-1 flex items-center">
                <div className="prose max-w-none w-full text-base">
                  <ReactMarkdown>
                    {candidate.manifesto}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </div>
          </Card>
        )
      })}
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