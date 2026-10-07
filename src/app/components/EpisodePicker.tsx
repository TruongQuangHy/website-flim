"use client";

import { useState, useEffect, useMemo } from "react";
import { Play, Check, Server, Search } from "lucide-react";
import { VsmovEpisodeServer, VsmovEpisodeItem } from "../types/navType";

interface EpisodePickerProps {
  servers?: VsmovEpisodeServer[];
  // Legacy / fallback props
  episodes?: Array<{
    name: string;
    slug: string;
    link_m3u8?: string;
    link_embed?: string;
  }>;
  selectedSlug: string;
  onSelect: (link: string, slug: string, episodeName?: string) => void;
  movieSlug?: string;
}

const CHUNK_SIZE = 40;

export default function EpisodePicker({
  servers,
  episodes,
  selectedSlug,
  onSelect,
  movieSlug = "",
}: EpisodePickerProps) {
  // Normalize servers data
  const normalizedServers: VsmovEpisodeServer[] = useMemo(() => {
    if (servers && servers.length > 0) {
      return servers.map((srv, idx) => ({
        ...srv,
        server_name: (srv.server_name || `Server ${idx + 1}`)
          .replace(/[\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      }));
    }
    if (episodes && episodes.length > 0) {
      return [
        {
          server_name: "VIP Server 1",
          server_data: episodes.map((ep) => ({
            name: ep.name,
            slug: ep.slug,
            filename: ep.name,
            link_embed: ep.link_embed,
            link_m3u8: ep.link_m3u8,
          })),
        },
      ];
    }
    return [];
  }, [servers, episodes]);

  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);

  // Load watched history for this movie
  useEffect(() => {
    if (!movieSlug) return;
    try {
      const stored = localStorage.getItem(`watched_history_${movieSlug}`);
      if (stored) {
        setWatchedEpisodes(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [movieSlug]);

  // Current server's episode list
  const allEpisodesInServer = useMemo(() => {
    return normalizedServers[activeServerIndex]?.server_data || [];
  }, [normalizedServers, activeServerIndex]);

  // Update watched episodes when selectedSlug changes
  useEffect(() => {
    if (!selectedSlug || !movieSlug) return;
    setWatchedEpisodes((prev) => {
      if (!prev.includes(selectedSlug)) {
        const next = [...prev, selectedSlug];
        try {
          localStorage.setItem(`watched_history_${movieSlug}`, JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  }, [selectedSlug, movieSlug]);

  // Auto switch chunk if active episode is in another chunk
  useEffect(() => {
    if (!selectedSlug || allEpisodesInServer.length <= CHUNK_SIZE) return;
    const index = allEpisodesInServer.findIndex((ep) => ep.slug === selectedSlug);
    if (index !== -1) {
      const targetChunk = Math.floor(index / CHUNK_SIZE);
      setActiveChunkIndex(targetChunk);
    }
  }, [selectedSlug, allEpisodesInServer]);

  if (!normalizedServers.length || !allEpisodesInServer.length) {
    return null;
  }

  // Filter episodes by search if provided
  const filteredEpisodes = searchQuery.trim()
    ? allEpisodesInServer.filter(
        (ep) =>
          ep.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          ep.slug.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : allEpisodesInServer;

  // Split into chunks if there are many episodes
  const totalChunks = Math.ceil(filteredEpisodes.length / CHUNK_SIZE);
  const displayedEpisodes =
    totalChunks > 1 && !searchQuery.trim()
      ? filteredEpisodes.slice(
          activeChunkIndex * CHUNK_SIZE,
          (activeChunkIndex + 1) * CHUNK_SIZE
        )
      : filteredEpisodes;

  const handleEpisodeClick = (ep: VsmovEpisodeItem) => {
    // VSMOV prefers link_embed, fallback to link_m3u8
    const link = ep.link_embed || ep.link_m3u8 || "";
    onSelect(link, ep.slug, ep.name);
  };

  return (
    <div className="space-y-4">
      {/* Server selector (if > 1 server) */}
      {normalizedServers.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5 text-brand" />
            <span>Chọn Server phát:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {normalizedServers.map((srv, idx) => (
              <button
                key={srv.server_name || idx}
                type="button"
                onClick={() => {
                  setActiveServerIndex(idx);
                  setActiveChunkIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeServerIndex === idx
                    ? "bg-brand text-white shadow-md shadow-brand/30"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                {srv.server_name || `Server ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header + Search + Range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/80">
            Danh sách tập phim
          </h3>
          <span className="text-xs text-white/50">
            ({allEpisodesInServer.length} tập)
          </span>
        </div>

        {/* Quick search episode if > 20 */}
        {allEpisodesInServer.length > 20 && (
          <div className="relative w-full sm:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Tìm số tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand"
            />
          </div>
        )}
      </div>

      {/* Episode Chunks (1-40, 41-80...) */}
      {totalChunks > 1 && !searchQuery.trim() && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {Array.from({ length: totalChunks }).map((_, cIdx) => {
            const start = cIdx * CHUNK_SIZE + 1;
            const end = Math.min((cIdx + 1) * CHUNK_SIZE, filteredEpisodes.length);
            return (
              <button
                key={cIdx}
                type="button"
                onClick={() => setActiveChunkIndex(cIdx)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeChunkIndex === cIdx
                    ? "bg-white/25 text-white border border-white/30"
                    : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white"
                }`}
              >
                {start} - {end}
              </button>
            );
          })}
        </div>
      )}

      {/* Episode Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
        {displayedEpisodes.map((ep) => {
          const isActive = selectedSlug === ep.slug;
          const isWatched = watchedEpisodes.includes(ep.slug);

          return (
            <button
              key={ep.slug}
              type="button"
              onClick={() => handleEpisodeClick(ep)}
              className={`relative group px-1.5 sm:px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isActive
                  ? "bg-brand text-white shadow-lg shadow-brand/40 ring-1 ring-white/30 font-bold"
                  : isWatched
                    ? "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white"
                    : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
              }`}
              aria-pressed={isActive}
              title={`Tập ${ep.name}${isWatched ? " (Đã xem)" : ""}`}
            >
              {isActive ? (
                <Play className="w-3 h-3 fill-current animate-pulse shrink-0" />
              ) : isWatched ? (
                <Check className="w-2.5 h-2.5 text-emerald-400 opacity-60 shrink-0" />
              ) : null}
              <span className="truncate">{ep.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
