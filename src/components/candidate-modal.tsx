'use client'

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CandidateModal({ open, onOpenChange, onSubmit, initialData, isSubmitting }
    :{
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onSubmit: (data: { name: string; image: FileList; manifesto: string }) => void;
        initialData?: { name: string; image: FileList; manifesto: string };
        isSubmitting: boolean;
    }
) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || { name: '', image: undefined, manifesto: '' }
  });

  // Reset form when initialData changes (for edit)
  useEffect(() => {
    reset(initialData || { name: '', image: undefined, manifesto: '' });
  }, [initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{initialData ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Candidate Name</Label>
            <Input {...register('name')} required disabled={isSubmitting} />
          </div>
          <div>
            <Label>Profile Image {initialData && '(leave blank to keep current)'}</Label>
            <Input type="file" accept="image/*" {...register('image')} disabled={isSubmitting} />
          </div>
          <div>
            <Label>Manifesto (Markdown)</Label>
            <Textarea {...register('manifesto')} required disabled={isSubmitting} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Candidate'}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}