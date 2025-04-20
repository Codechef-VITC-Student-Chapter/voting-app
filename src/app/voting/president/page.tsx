// app/voting/president/page.tsx
import PositionVoting from '@/components/position-voting';
import Navbar from '@/components/navbar';

export default function PresidentVotingPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <PositionVoting 
          position="president"
          positionLabel="President" 
          hasVotedColumn="has_voted_president"
        />
      </div>
    </div>
  );
}
