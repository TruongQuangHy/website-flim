import { VsmovMovieItem, MoviePerson } from "../types/navType";

// Helper to remove Vietnamese accents for fuzzy searching
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export interface CustomMovieEntry {
  aliases: string[];
  movie: VsmovMovieItem;
  cast: MoviePerson[];
}

export const CUSTOM_MOVIES: CustomMovieEntry[] = [
  {
    aliases: [
      "thien-duong-mau-1774022483",
      "thien-duong-mau",
      "bloody-haven",
    ],
    movie: {
      _id: "79931",
      name: "Thiên Đường Máu",
      origin_name: "Bloody Haven",
      slug: "thien-duong-mau-1774022483",
      poster_url: "/movies/thien-duong-mau/poster.webp",
      thumb_url: "/movies/thien-duong-mau/thumb.webp",
      year: 2025,
      quality: "FHD",
      lang: "Vietsub",
      type: "single",
      time: "99 Phút",
      episode_current: "Full",
      episode_total: "1",
      content:
        'Thiên Đường Máu là tác phẩm điện ảnh đầu tiên tại Việt Nam mang đến cái nhìn sâu sắc về vấn nạn lừa đảo người Việt ra nước ngoài. Tin lời hứa "việc nhẹ lương cao", không ít thanh niên bị đưa đến những "đặc khu", nơi họ trải qua cảnh giam lỏng, tra tấn và bị ép buộc phải gọi điện để lừa ngược lại chính đồng bào mình. Nhiều người trong số đó đã tìm mọi cách đào thoát khỏi địa ngục trần gian mà họ đã trót dấn thân vào.',
      status: "completed",
      view: 1198837,
      chieurap: true,
      sub_docquyen: false,
      trailer_url: "https://www.youtube.com/watch?v=9d4NGjYJD7c",
      actor: [
        "Ngô Quang Tuấn",
        "Ngô Phạm Hạnh Thúy",
        "Quách Ngọc Ngoan",
        "Hoàng Tuấn Cường",
        "Hoài Lâm",
        "Sỹ Toàn",
        "Thanh Hương",
      ],
      director: ["Hoàng Tuấn Cường"],
      category: [
        { id: "1", name: "Hành Động", slug: "hanh-dong" },
        { id: "6", name: "Hình Sự", slug: "hinh-su" },
        { id: "10", name: "Chiếu Rạp", slug: "phim-chieu-rap" },
      ],
      country: [{ id: "40", name: "Việt Nam", slug: "viet-nam" }],
      tmdb: {
        vote_average: 7.6,
        vote_count: 4873,
      },
      episodes: [
        {
          server_name: "VIP Server 1 (K - Vietsub)",
          server_data: [
            {
              name: "Full",
              slug: "k-full",
              filename: "thien-duong-mau-k-full",
              link_embed:
                "https://player.phimapi.com/player/?url=https://s6.kkphimplayer6.com/20260320/02bq9QLy/index.m3u8",
              link_m3u8:
                "https://s6.kkphimplayer6.com/20260320/02bq9QLy/index.m3u8",
            },
          ],
        },
        {
          server_name: "VIP Server 2 (VSMOV)",
          server_data: [
            {
              name: "Full",
              slug: "vsmov-full",
              filename: "thien-duong-mau-vsmov-full",
              link_embed:
                "https://player.phimapi.com/player/?url=https://v8.streamvsmov.com/stream/5c672fcb-a22e-4922-9ecf-66f2884677de/master.m3u8",
              link_m3u8:
                "https://v8.streamvsmov.com/stream/5c672fcb-a22e-4922-9ecf-66f2884677de/master.m3u8",
            },
          ],
        },
      ],
    },
    cast: [
      {
        tmdb_people_id: 1,
        name: "Ngô Quang Tuấn",
        character: "Diễn viên chính",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/ngo-quang-tuan/tLDkipEkbLGerUoJOEZDZMlYtrP.webp",
      },
      {
        tmdb_people_id: 2,
        name: "Ngô Phạm Hạnh Thúy",
        character: "Diễn viên chính",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/ngo-pham-hanh-thuy/3faCx12jBhGSAv3jkMJVinN3AEo.webp",
      },
      {
        tmdb_people_id: 3,
        name: "Quách Ngọc Ngoan",
        character: "Diễn viên",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/quach-ngoc-ngoan/tuyDlPCWH1dyLzP4L6L6blAGq77.webp",
      },
      {
        tmdb_people_id: 4,
        name: "Hoài Lâm",
        character: "Diễn viên",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/hoai-lam/brICvyb3r7wEPqroghJ2TOIlj2F.webp",
      },
      {
        tmdb_people_id: 5,
        name: "Sỹ Toàn",
        character: "Diễn viên",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/sy-toan/yPiRt3iBVV8NijtfD6kOOSt44ws.webp",
      },
      {
        tmdb_people_id: 6,
        name: "Thanh Hương",
        character: "Diễn viên",
        known_for_department: "Acting",
        profile_path: "https://motphimc.pw/storage/actors/thanh-huong/je8gF7WprgbfewBxNPBxSILDY0i.webp",
      },
      {
        tmdb_people_id: 7,
        name: "Hoàng Tuấn Cường",
        character: "Đạo diễn & Diễn viên",
        known_for_department: "Directing",
        profile_path: "",
      },
    ],
  },
];

export function findCustomMovieBySlug(slug: string): VsmovMovieItem | undefined {
  const clean = slug.toLowerCase().trim();
  const entry = CUSTOM_MOVIES.find(
    (e) =>
      e.movie.slug.toLowerCase() === clean ||
      e.aliases.some((alias) => alias.toLowerCase() === clean)
  );
  return entry ? { ...entry.movie } : undefined;
}

export function findCustomMovieCast(slug: string): MoviePerson[] | undefined {
  const clean = slug.toLowerCase().trim();
  const entry = CUSTOM_MOVIES.find(
    (e) =>
      e.movie.slug.toLowerCase() === clean ||
      e.aliases.some((alias) => alias.toLowerCase() === clean)
  );
  return entry?.cast;
}

export function searchCustomMovies(keyword: string): VsmovMovieItem[] {
  const clean = removeVietnameseTones(keyword);
  if (!clean) return [];

  return CUSTOM_MOVIES.filter((e) => {
    const nameNorm = removeVietnameseTones(e.movie.name);
    const originNorm = removeVietnameseTones(e.movie.origin_name || "");
    const slugNorm = removeVietnameseTones(e.movie.slug);
    const actorsNorm = (e.movie.actor || []).map(removeVietnameseTones).join(" ");
    const directorNorm = (e.movie.director || []).map(removeVietnameseTones).join(" ");

    return (
      nameNorm.includes(clean) ||
      originNorm.includes(clean) ||
      slugNorm.includes(clean) ||
      actorsNorm.includes(clean) ||
      directorNorm.includes(clean) ||
      clean.includes("thien duong") ||
      clean.includes("bloody haven")
    );
  }).map((e) => ({ ...e.movie }));
}

export function getCustomMoviesForList(
  category: string,
  slug: string
): VsmovMovieItem[] {
  const targetSlug = slug.toLowerCase();
  const targetCategory = category.toLowerCase();

  return CUSTOM_MOVIES.filter((e) => {
    const m = e.movie;
    // Phim chieu rap
    if (targetSlug === "phim-chieu-rap" && m.chieurap) return true;
    // Phim le
    if (targetSlug === "phim-le" && m.type === "single") return true;
    // Phim moi cap nhat
    if (targetSlug === "phim-moi-cap-nhat" || targetSlug === "phim-moi-phat-hanh") return true;
    // By the-loai
    if (targetCategory === "the-loai") {
      return (m.category || []).some((c) => c.slug.toLowerCase() === targetSlug);
    }
    // By quoc-gia
    if (targetCategory === "quoc-gia") {
      return (m.country || []).some((c) => c.slug.toLowerCase() === targetSlug);
    }
    return false;
  }).map((e) => ({ ...e.movie }));
}

export function getAllCustomMovies(): VsmovMovieItem[] {
  return CUSTOM_MOVIES.map((e) => ({ ...e.movie }));
}
