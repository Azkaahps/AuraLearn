import { Layers } from 'lucide-react';

interface LeitnerIndicatorProps {
  counts: [number, number, number]; // [Box 1, Box 2, Box 3]
}

export function LeitnerIndicator({ counts }: LeitnerIndicatorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
       {/* Box 1 - Need Review (Hot Pink Accent) */}
       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fa7faa]/15 text-[#fa7faa] rounded-[4px] border border-[#fa7faa]/30 font-bold uppercase">
          <Layers className="w-3.5 h-3.5" /> 
          <span>BOX 1: {counts[0]}</span>
       </div>
       
       {/* Box 2 - In Progress (Violet Accent) */}
       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6a5fc1]/15 text-[#a89fe0] rounded-[4px] border border-[#6a5fc1]/30 font-bold uppercase">
          <Layers className="w-3.5 h-3.5" /> 
          <span>BOX 2: {counts[1]}</span>
       </div>
       
       {/* Box 3 - Mastered (Electric Lime Accent) */}
       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c2ef4e]/15 text-[#c2ef4e] rounded-[4px] border border-[#c2ef4e]/30 font-bold uppercase">
          <Layers className="w-3.5 h-3.5" /> 
          <span>BOX 3: {counts[2]}</span>
       </div>
    </div>
  );
}
