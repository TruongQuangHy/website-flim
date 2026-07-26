"use client";

interface Episode {
  name: string;
  slug: string;
  link_m3u8: string;
}

interface EpisodePickerProps {
  episodes: Episode[];
  selectedSlug: string;
  onSelect: (link: string, slug: string) => void;
}

export default function EpisodePicker({
  episodes,
  selectedSlug,
  onSelect,
}: EpisodePickerProps) {
  if (!episodes.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70">
        Danh sách tập
      </h3>
      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
        {episodes.map((episode) => {
          const isActive = selectedSlug === episode.slug;
          return (
            <button
              key={episode.slug}
              type="button"
              onClick={() => onSelect(episode.link_m3u8, episode.slug)}
              className={`min-w-[3rem] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isActive
                  ? "bg-brand text-white shadow-md shadow-brand/30 scale-[1.02]"
                  : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
              }`}
              aria-pressed={isActive}
            >
              {episode.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
