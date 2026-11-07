import { Ear } from 'lucide-react';

// Auditone brand in the printed report header (replaces AudiometricReport's logo).
const BrandLogo = (_props: { isPremium?: boolean; size?: 'sm' | 'md' | 'lg' }) => (
  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
    <Ear className="h-4 w-4" />
    Auditone Test
  </span>
);

export default BrandLogo;
