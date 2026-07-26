import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
  seeAllLabel?: string;
}

export default function SectionHeader({
  title,
  href,
  seeAllLabel = "Xem tất cả",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3 px-1">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white group-hover/row:text-brand transition-colors">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors shrink-0 font-medium"
        >
          {seeAllLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
