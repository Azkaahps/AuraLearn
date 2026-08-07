import { Progress } from '@/components/ui/progress';

interface QuotaProgressBarProps {
  profile: {
    tier: string;
    docs_used: number;
    quota_reset?: string;
  };
  variant?: 'sidebar' | 'banner' | 'settings';
}

export function QuotaProgressBar({ profile, variant = 'sidebar' }: QuotaProgressBarProps) {
  const maxQuota = profile.tier === 'pro' ? 50 : 3;
  const used = profile.docs_used || 0;
  
  const now = new Date();
  const quotaDate = profile.quota_reset ? new Date(profile.quota_reset) : null;
  const isDifferentMonth = quotaDate
    ? (now.getMonth() !== quotaDate.getMonth() || now.getFullYear() !== quotaDate.getFullYear())
    : false;

  const displayUsed = isDifferentMonth ? 0 : used;
  const progressRatio = Math.min((displayUsed / maxQuota) * 100, 100);
  
  const isAlmostFull = progressRatio >= 80;
  
  const indicatorColor = isAlmostFull 
    ? (profile.tier === 'pro' ? 'bg-[#fa7faa]' : 'bg-[#BA1A1A]') 
    : 'bg-[#c2ef4e]';

  if (variant === 'banner') {
    return (
      <div className="w-full flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="micro-cap text-white/70">
            DOKUMEN DIUNGGAH: <strong className="text-[#c2ef4e]">{displayUsed}</strong> DARI {maxQuota}
          </span>
          <span className="font-mono text-2xl font-bold text-white tracking-wider">
            {displayUsed} / {maxQuota}
          </span>
        </div>
        <Progress value={progressRatio} indicatorColor={indicatorColor} className="h-3 w-full border border-[#362d59]" />
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className="flex flex-col gap-4 w-full font-mono">
         <div className="flex justify-between items-center w-full">
           <p className="text-xs text-white/70">
             {displayUsed} DARI {maxQuota} DOKUMEN DIPAKAI
             {profile.quota_reset && ` // RESET: ${new Date(profile.quota_reset).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}`}
           </p>
           <span className="font-mono font-bold text-lg text-white">{displayUsed} / {maxQuota}</span>
         </div>
         <Progress value={progressRatio} indicatorColor={indicatorColor} className="h-2.5 border border-[#362d59]" />
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="p-3 bg-[#1f1633] border border-[#362d59] rounded-[8px]">
      <div className="flex justify-between items-center mb-2 font-mono text-xs">
        <span className="micro-cap text-white/60">KUOTA: {maxQuota - displayUsed} SISA</span>
        <span className="font-bold text-[#c2ef4e]">{displayUsed}/{maxQuota}</span>
      </div>
      <Progress value={progressRatio} indicatorColor={indicatorColor} className="h-2 border border-[#362d59]" />
    </div>
  );
}
