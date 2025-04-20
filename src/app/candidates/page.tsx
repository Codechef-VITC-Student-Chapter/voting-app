'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { toast } from 'sonner';

export default function PositionVoting() {
  const [candidates, setCandidates] = useState<{
    id: string;
    name: string;
    manifesto: string;
    image_path: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getCandidates = async () => {
      try {
        const { data: candidatesData, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setCandidates(candidatesData || []);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };
    getCandidates();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-48 mb-8" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="w-full md:w-48 h-48 rounded-xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Contesting Candidates
      </h1>

      <div className="grid gap-6">
        {candidates.map((candidate) => {
          const imgUrl = supabase.storage
            .from('candidate_images')
            .getPublicUrl(candidate.image_path)
            .data.publicUrl;

          return (
            <Card 
              key={candidate.id}
              className="group hover:shadow-lg transition-shadow duration-200"
            >
              <div className="grid md:grid-cols-[auto_1fr] gap-6 p-6">
                {/* Candidate Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative flex justify-center w-full rounded-2xl overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <Image
                      src={imgUrl}
                      alt={candidate.name}
                      className="object-cover object-center"
                      height={150}
                      width={150}
                      priority
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-center">
                    {candidate.name}
                  </h2>
                </div>

                {/* Manifesto */}
                <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                    {candidate.manifesto}
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
