import { MovieItem } from '../types';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export interface CustomMobileEntry {
  aliases: string[];
  movie: MovieItem;
}

export const CUSTOM_MOBILE_MOVIES: CustomMobileEntry[] = [
  {
    aliases: [
      'thien-duong-mau-1774022483',
      'thien-duong-mau',
      'bloody-haven',
    ],
    movie: {
      _id: '79931',
      name: 'Thiên Đường Máu',
      origin_name: 'Bloody Haven',
      slug: 'thien-duong-mau-1774022483',
      poster_url: 'https://motphimc.pw/storage/images/thien-duong-mau/thien-duong-mau-poster.webp',
      thumb_url: 'https://motphimc.pw/storage/images/thien-duong-mau/thien-duong-mau-thumb.webp',
      year: 2025,
      quality: 'FHD',
      lang: 'Vietsub',
      type: 'single',
      time: '99 Phút',
      episode_current: 'Full',
      content:
        'Thiên Đường Máu là tác phẩm điện ảnh đầu tiên tại Việt Nam mang đến cái nhìn sâu sắc về vấn nạn lừa đảo người Việt ra nước ngoài. Tin lời hứa "việc nhẹ lương cao", không ít thanh niên bị đưa đến những "đặc khu", nơi họ trải qua cảnh giam lỏng, tra tấn và bị ép buộc phải gọi điện để lừa ngược lại chính đồng bào mình. Nhiều người trong số đó đã tìm mọi cách đào thoát khỏi địa ngục trần gian mà họ đã trót dấn thân vào.',
      view: 1198837,
      actor: [
        'Ngô Quang Tuấn',
        'Ngô Phạm Hạnh Thúy',
        'Quách Ngọc Ngoan',
        'Hoàng Tuấn Cường',
        'Hoài Lâm',
        'Sỹ Toàn',
        'Thanh Hương',
      ],
      director: ['Hoàng Tuấn Cường'],
      category: [
        { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
        { id: '6', name: 'Hình Sự', slug: 'hinh-su' },
        { id: '10', name: 'Chiếu Rạp', slug: 'phim-chieu-rap' },
      ],
      country: [{ id: '40', name: 'Việt Nam', slug: 'viet-nam' }],
      vote_average: 7.6,
      tmdb: {
        vote_average: 7.6,
        vote_count: 4873,
      },
      episodes: [
        {
          server_name: 'VIP Server 1 (K - Vietsub)',
          server_data: [
            {
              name: 'Full',
              slug: 'k-full',
              filename: 'thien-duong-mau-k-full',
              link_embed:
                'https://player.phimapi.com/player/?url=https://s6.kkphimplayer6.com/20260320/02bq9QLy/index.m3u8',
              link_m3u8:
                'https://s6.kkphimplayer6.com/20260320/02bq9QLy/index.m3u8',
            },
          ],
        },
        {
          server_name: 'VIP Server 2 (VSMOV)',
          server_data: [
            {
              name: 'Full',
              slug: 'vsmov-full',
              filename: 'thien-duong-mau-vsmov-full',
              link_embed:
                'https://player.phimapi.com/player/?url=https://v8.streamvsmov.com/stream/5c672fcb-a22e-4922-9ecf-66f2884677de/master.m3u8',
              link_m3u8:
                'https://v8.streamvsmov.com/stream/5c672fcb-a22e-4922-9ecf-66f2884677de/master.m3u8',
            },
          ],
        },
      ],
    },
  },
];

export function findMobileCustomMovie(slug: string): MovieItem | undefined {
  const clean = slug.toLowerCase().trim();
  const entry = CUSTOM_MOBILE_MOVIES.find(
    (e) =>
      e.movie.slug.toLowerCase() === clean ||
      e.aliases.some((alias) => alias.toLowerCase() === clean)
  );
  return entry ? { ...entry.movie } : undefined;
}

export function searchMobileCustomMovies(keyword: string): MovieItem[] {
  const rawClean = removeVietnameseTones(keyword);
  if (!rawClean) return [];

  // Remove common prefix "phim " if user searches "phim thien duong mau"
  const clean = rawClean.replace(/^phim\s+/i, '').trim() || rawClean;
  const words = clean.split(' ').filter((w) => w.length > 1);

  return CUSTOM_MOBILE_MOVIES.filter((e) => {
    const nameNorm = removeVietnameseTones(e.movie.name);
    const originNorm = removeVietnameseTones(e.movie.origin_name || '');
    const slugNorm = removeVietnameseTones(e.movie.slug);
    const actorsNorm = (e.movie.actor || []).map(removeVietnameseTones).join(' ');
    const directorNorm = (e.movie.director || []).map(removeVietnameseTones).join(' ');

    // 1. Direct or bidirectional match
    if (
      nameNorm.includes(clean) ||
      clean.includes(nameNorm) ||
      originNorm.includes(clean) ||
      slugNorm.includes(clean) ||
      actorsNorm.includes(clean) ||
      directorNorm.includes(clean) ||
      e.aliases.some((al) => removeVietnameseTones(al).includes(clean))
    ) {
      return true;
    }

    // 2. All words match (e.g. "thien mau", "duong mau")
    if (words.length > 0 && words.every((w) => nameNorm.includes(w) || originNorm.includes(w) || slugNorm.includes(w))) {
      return true;
    }

    // 3. Fallback keywords
    return (
      clean.includes('thien duong') ||
      clean.includes('bloody haven') ||
      nameNorm.includes('thien duong mau')
    );
  }).map((e) => ({ ...e.movie }));
}

export function getMobileCustomMoviesForList(slug: string): MovieItem[] {
  const targetSlug = slug.toLowerCase();
  return CUSTOM_MOBILE_MOVIES.filter((e) => {
    const m = e.movie;
    if (targetSlug === 'phim-chieu-rap') return true;
    if (targetSlug === 'phim-le' && m.type === 'single') return true;
    if (targetSlug === 'phim-moi-cap-nhat' || targetSlug === 'phim-moi-phat-hanh') return true;
    if ((m.category || []).some((c) => c.slug.toLowerCase() === targetSlug)) return true;
    if ((m.country || []).some((c) => c.slug.toLowerCase() === targetSlug)) return true;
    return false;
  }).map((e) => ({ ...e.movie }));
}
