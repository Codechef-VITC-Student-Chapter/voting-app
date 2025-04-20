// app/voting/gensec/page.tsx
import PositionVoting from '@/components/position-voting';

export default function GenSecVotingPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <PositionVoting 
          position="gensec"
          positionLabel="General Secretary" 
          hasVotedColumn="has_voted_gensec"
        />
      </div>
    </div>
  );
}
