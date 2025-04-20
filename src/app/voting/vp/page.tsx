// app/voting/vp/page.tsx
import PositionVoting from '@/components/position-voting';
import Navbar from '@/components/navbar';

export default function VPVotingPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <PositionVoting 
          position="vp"
          positionLabel="Vice President" 
          hasVotedColumn="has_voted_vp"
        />
      </div>
    </div>
  );
}
