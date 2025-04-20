// app/admin/page.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '../../../utils/supabase/client';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

type CandidateForm = {
  name: string;
  image: FileList;
  manifesto: string;
};

export default function AdminPage() {
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [isTogglingElection, setIsTogglingElection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<CandidateForm>();
  const supabase = createClient();

  const toggleElection = async () => {
    setIsTogglingElection(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (userData?.role !== 'admin') {
        toast.error('Unauthorized access');
        return;
      }

      const { data, error } = await supabase
        .from('voting_sessions')
        .upsert({ end_time: isElectionActive ? null : 'now()' })
        .select()
        .maybeSingle();

      if (error) throw error;

      setIsElectionActive(data ? !data.end_time : false);
      toast.success(`Election ${data?.end_time ? 'ended' : 'started'} successfully`);
    } catch (error) {
      toast.error('Failed to update election status');
      console.error('Election toggle error:', error);
    } finally {
      setIsTogglingElection(false);
    }
  };

  const onSubmit = async (data: CandidateForm) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired. Please login again');
        redirect('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        toast.error('Unauthorized access');
        return;
      }

      const file = data.image[0];
      const filePath = `candidates/${crypto.randomUUID()}-${file.name}`;

      // Upload image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('candidate_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert candidate
      const { error: insertError } = await supabase
        .from('candidates')
        .insert({
          name: data.name,
          image_path: uploadData.path,
          manifesto: data.manifesto,
          created_by: user.id
        });

      if (insertError) throw insertError;

      toast.success('Candidate added successfully');
      reset();
    } catch (error) {
      toast.error('Failed to add candidate');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Election Control Panel</h1>
          <Button 
            onClick={toggleElection}
            variant={isElectionActive ? 'destructive' : 'default'}
            disabled={isTogglingElection}
          >
            {isTogglingElection ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isElectionActive ? 'End Election' : 'Start Election'}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Candidate Name</Label>
            <Input {...register('name')} required disabled={isSubmitting} />
          </div>
          
          <div>
            <Label>Profile Image</Label>
            <Input 
              type="file" 
              accept="image/*"
              {...register('image')} 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label>Manifesto (Markdown)</Label>
            <Textarea
              {...register('manifesto')}
              required
              className="min-h-[200px] font-mono"
              disabled={isSubmitting}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Adding Candidate...
              </>
            ) : 'Add Candidate'}
          </Button>
        </form>
      </div>
    </div>
  );
}
