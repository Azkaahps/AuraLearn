import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ href = '/', size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`${sizeClasses[size]} rounded-[8px] bg-[#1f1633] border border-[#362d59] flex items-center justify-center p-1 overflow-hidden shadow-md group-hover:border-[#6a5fc1] group-hover:scale-105 transition-all`}>
        <img 
          src="/logo.svg" 
          alt="AuraLearn Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`font-display font-bold tracking-tight text-white ${textClasses[size]}`}>
          AuraLearn
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
