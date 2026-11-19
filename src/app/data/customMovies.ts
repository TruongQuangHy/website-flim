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
  {
    aliases: [
      "dau-tay-ngot-ngao",
      "dau-tay-ngot-ngao-phan-1",
      "dau-tay-ngot-ngao-tap-1-394644",
      "dau-tay-ngot-ngao‐tap-1-394644",
      "dau-tay-ngot-ngao-22934",
      "dau-tay-ngot-ngao-phan-1/tap-1-sv-1",
      "dau-tay-ngot-ngao-phan-1/tap-1-sv-0",
      "tap-1-sv-1",
      "tap-1-sv-0",
      "merry-berry-love",
      "tinh-yeu-qua-mong",
      "chuyen-tinh-mua-dau",
      "motchillv.show",
      "motchill",
    ],
    movie: {
      _id: "305551",
      name: "Dâu Tây Ngọt Ngào",
      origin_name: "Merry Berry Love",
      slug: "dau-tay-ngot-ngao",
      poster_url: "/movies/dau-tay-ngot-ngao/poster.webp",
      thumb_url: "/movies/dau-tay-ngot-ngao/thumb.webp",
      year: 2026,
      quality: "FHD",
      lang: "Vietsub + Thuyết Minh",
      type: "series",
      time: "54 Phút/Tập",
      episode_current: "Tập 7",
      episode_total: "10",
      content:
        "Sau khi mất tất cả sau một đêm, Lee Yubin, một nhà thiết kế không gian người Hàn Quốc từng thành công, đã đến một hòn đảo nhỏ xinh đẹp của Nhật Bản. Tại đây, trên đảo Charo, anh gặp Shirahama Karin, một nữ nông dân kiên cường quyết tâm trồng dâu tây bất chấp căn bệnh bí ẩn của mình. Xuất thân từ hai thế giới khác nhau, cả hai vướng vào một sự hiểu lầm bất ngờ. Trong khi đó, một mối tình khác đang nảy nở trên đảo giữa một cặp đôi trái ngược. Park Kunam, một du khách làm việc kỳ nghỉ, quyết định ở lại sau khi đem lòng yêu Mizuno Mari, một người đọc bài tarot trớ trêu thay lại không thể đoán trước được đường tình duyên của chính mình. Khi họ vượt qua câu chuyện tình yêu của riêng mình, họ trở thành những người giúp đỡ đáng tin cậy cho Yubin và Karin.",
      status: "ongoing",
      view: 384210,
      chieurap: false,
      sub_docquyen: false,
      trailer_url: "https://www.youtube.com/watch?v=0h6xW1e9G9k",
      actor: [
        "Ji Chang Wook",
        "Imada Mio",
        "Nam Yoon Su",
        "Kumada Rinka",
        "Jung Soon Won",
        "Kangnam",
        "Kim Tae Hoon",
        "Satoi Kenta",
        "Danta Yasunori",
        "Gong Jae-kyung",
      ],
      director: ["Kim Soo Jung", "Noh Young Sub"],
      category: [
        { id: "2", name: "Tình Cảm", slug: "tinh-cam" },
        { id: "3", name: "Hài Hước", slug: "hai-huoc" },
        { id: "4", name: "Chính Kịch", slug: "chinh-kich" },
        { id: "5", name: "Tâm Lý", slug: "tam-ly" },
        { id: "11", name: "Phim Bộ", slug: "phim-bo" },
      ],
      country: [
        { id: "1", name: "Hàn Quốc", slug: "han-quoc" },
        { id: "2", name: "Nhật Bản", slug: "nhat-ban" },
      ],
      tmdb: {
        vote_average: 8.3,
        vote_count: 10,
      },
      episodes: [
        {
          server_name: "VIP Server 1 (Vietsub - HLS)",
          server_data: [
            {
              name: "Tập 1",
              slug: "tap-1",
              filename: "dau-tay-ngot-ngao-tap-1",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261008/YKZ9uajM/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261008/YKZ9uajM/index.m3u8",
            },
            {
              name: "Tập 2",
              slug: "tap-2",
              filename: "dau-tay-ngot-ngao-tap-2",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261016/UYwLrtOd/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261016/UYwLrtOd/index.m3u8",
            },
            {
              name: "Tập 3",
              slug: "tap-3",
              filename: "dau-tay-ngot-ngao-tap-3",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261022/g8fmyNow/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261022/g8fmyNow/index.m3u8",
            },
            {
              name: "Tập 4",
              slug: "tap-4",
              filename: "dau-tay-ngot-ngao-tap-4",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261030/xgL2zOVK/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261030/xgL2zOVK/index.m3u8",
            },
            {
              name: "Tập 5",
              slug: "tap-5",
              filename: "dau-tay-ngot-ngao-tap-5",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261105/KXi4ajmn/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261105/KXi4ajmn/index.m3u8",
            },
            {
              name: "Tập 6",
              slug: "tap-6",
              filename: "dau-tay-ngot-ngao-tap-6",
              link_embed:
                "https://player.phimapi.com/player/?url=https://a.kvp726.com/20261112/YTO1MEyn/index.m3u8",
              link_m3u8:
                "https://a.kvp726.com/20261112/YTO1MEyn/index.m3u8",
            },
            {
              name: "Tập 7 - Ai",
              slug: "tap-7",
              filename: "dau-tay-ngot-ngao-tap-7",
              link_embed:
                "https://player.phimapi.com/player/?url=https://stream.alostream.site/stream/1795014776_dau_tay_7_H264_Auto_1800K_HLS.m3u8",
              link_m3u8:
                "https://stream.alostream.site/stream/1795014776_dau_tay_7_H264_Auto_1800K_HLS.m3u8",
            },
          ],
        },
        {
          server_name: "VIP Server 2 (VSMOV)",
          server_data: [
            {
              name: "Tập 1",
              slug: "vsmov-tap-1",
              filename: "dau-tay-ngot-ngao-vsmov-1",
              link_embed:
                "https://v1.streamvsmov.com/video/f02798fa-43b1-4f4e-9ed3-b41011bf212d",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/f02798fa-43b1-4f4e-9ed3-b41011bf212d/master.m3u8",
            },
            {
              name: "Tập 2",
              slug: "vsmov-tap-2",
              filename: "dau-tay-ngot-ngao-vsmov-2",
              link_embed:
                "https://v1.streamvsmov.com/video/c9340803-cc55-49ea-bebb-1546e06f3249",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/c9340803-cc55-49ea-bebb-1546e06f3249/master.m3u8",
            },
            {
              name: "Tập 3",
              slug: "vsmov-tap-3",
              filename: "dau-tay-ngot-ngao-vsmov-3",
              link_embed:
                "https://v1.streamvsmov.com/video/bb75bde0-eaa2-4c33-bda6-1a7b507fd492",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/bb75bde0-eaa2-4c33-bda6-1a7b507fd492/master.m3u8",
            },
            {
              name: "Tập 4",
              slug: "vsmov-tap-4",
              filename: "dau-tay-ngot-ngao-vsmov-4",
              link_embed:
                "https://v1.streamvsmov.com/video/ed032401-3745-4d66-a664-5a848f04d6c2",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/ed032401-3745-4d66-a664-5a848f04d6c2/master.m3u8",
            },
            {
              name: "Tập 5",
              slug: "vsmov-tap-5",
              filename: "dau-tay-ngot-ngao-vsmov-5",
              link_embed:
                "https://v1.streamvsmov.com/video/9bacd76d-e108-495a-b236-1ba4873e1886",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/9bacd76d-e108-495a-b236-1ba4873e1886/master.m3u8",
            },
            {
              name: "Tập 6",
              slug: "vsmov-tap-6",
              filename: "dau-tay-ngot-ngao-vsmov-6",
              link_embed:
                "https://v1.streamvsmov.com/video/a1014946-4476-4dd9-898b-8cbfd122b51a",
              link_m3u8:
                "https://v1.streamvsmov.com/stream/a1014946-4476-4dd9-898b-8cbfd122b51a/master.m3u8",
            },
            {
              name: "Tập 7 - Ai",
              slug: "vsmov-tap-7",
              filename: "dau-tay-ngot-ngao-vsmov-7",
              link_embed:
                "https://player.phimapi.com/player/?url=https://stream.alostream.site/stream/1795014776_dau_tay_7_H264_Auto_1800K_HLS.m3u8",
              link_m3u8:
                "https://stream.alostream.site/stream/1795014776_dau_tay_7_H264_Auto_1800K_HLS.m3u8",
            },
          ],
        },
        {
          server_name: "VIP Server 3 (Motchill - Thuyết Minh)",
          server_data: [
            {
              name: "Tập 1",
              slug: "tap-1-sv-1",
              filename: "dau-tay-ngot-ngao-tap-1-sv-1",
              link_embed:
                "https://embed14.streamc.xyz/embed.php?hash=21618c0505783831b7fd022c94801fb6",
            },
            {
              name: "Tập 2",
              slug: "tap-2-sv-1",
              filename: "dau-tay-ngot-ngao-tap-2-sv-1",
              link_embed:
                "https://embed18.streamc.xyz/embed.php?hash=c115208e0b76406641f206b83872d57a",
            },
            {
              name: "Tập 3",
              slug: "tap-3-sv-1",
              filename: "dau-tay-ngot-ngao-tap-3-sv-1",
              link_embed:
                "https://embed13.streamc.xyz/embed.php?hash=955acd13d2446098f5227baa4cef95a3",
            },
            {
              name: "Tập 4",
              slug: "tap-4-sv-1",
              filename: "dau-tay-ngot-ngao-tap-4-sv-1",
              link_embed:
                "https://embed14.streamc.xyz/embed.php?hash=815863c69580aaea253be2c17102bdce",
            },
            {
              name: "Tập 5",
              slug: "tap-5-sv-1",
              filename: "dau-tay-ngot-ngao-tap-5-sv-1",
              link_embed:
                "https://embed10.streamc.xyz/embed.php?hash=3053bc4f5e1ffeee1fe39327e1fbdeb3",
            },
            {
              name: "Tập 6",
              slug: "tap-6-sv-1",
              filename: "dau-tay-ngot-ngao-tap-6-sv-1",
              link_embed:
                "https://embed1.streamc.xyz/embed.php?hash=a0b509c418a001cf47dc1b9345b55d1b",
            },
          ],
        },
        {
          server_name: "VIP Server 4 (Motchill / Nguồn C - Vietsub)",
          server_data: [
            {
              name: "Tập 1",
              slug: "tap-1-sv-0",
              filename: "dau-tay-ngot-ngao-tap-1-sv-0",
              link_embed:
                "https://embed1.streamc.xyz/embed.php?hash=31004ce84ff8b9b554ccae928817320a",
            },
            {
              name: "Tập 2",
              slug: "tap-2-sv-0",
              filename: "dau-tay-ngot-ngao-tap-2-sv-0",
              link_embed:
                "https://embed10.streamc.xyz/embed.php?hash=9886b3d8cea25712f404cc4860cf6e2c",
            },
            {
              name: "Tập 3",
              slug: "tap-3-sv-0",
              filename: "dau-tay-ngot-ngao-tap-3-sv-0",
              link_embed:
                "https://embed1.streamc.xyz/embed.php?hash=606bfcba72cba30e43c54d47b3d7044d",
            },
            {
              name: "Tập 4",
              slug: "tap-4-sv-0",
              filename: "dau-tay-ngot-ngao-tap-4-sv-0",
              link_embed:
                "https://embed2.streamc.xyz/embed.php?hash=7eb324beded70df57e9f089644f8edbb",
            },
            {
              name: "Tập 5",
              slug: "tap-5-sv-0",
              filename: "dau-tay-ngot-ngao-tap-5-sv-0",
              link_embed:
                "https://embed13.streamc.xyz/embed.php?hash=e85b69928d690408d1a9815365465a52",
            },
            {
              name: "Tập 6",
              slug: "tap-6-sv-0",
              filename: "dau-tay-ngot-ngao-tap-6-sv-0",
              link_embed:
                "https://embed14.streamc.xyz/embed.php?hash=e40ae4f22b6bd8af5771c1e4888e145d",
            },
          ],
        },
      ],
    },
    cast: [
      {
        tmdb_people_id: 1253391,
        name: "Ji Chang Wook",
        character: "Lee Yu-bin (Nam chính)",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/sBmHrO5Tn27Ot5hy0yAKniROmNb.jpg",
      },
      {
        tmdb_people_id: 1919754,
        name: "Imada Mio",
        character: "Shirahama Karin (Nữ chính)",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/1RiNJI6v9rBvATZ59m0CAZCFOpI.jpg",
      },
      {
        tmdb_people_id: 2176669,
        name: "Nam Yoon Su",
        character: "Park Ku-nam",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/lPOTG0iwINk1N1w7N0Xv2ndKqm0.jpg",
      },
      {
        tmdb_people_id: 1875752,
        name: "Kumada Rinka",
        character: "Mizuno Mari",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/1WkAsP86ZvE1QwS3sbUb7Rx84QF.jpg",
      },
      {
        tmdb_people_id: 2123796,
        name: "Jung Soon Won",
        character: "Kim Bong-su",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/E80fMLgKBeOASTnHLEi4jSuCqo.jpg",
      },
      {
        tmdb_people_id: 1628180,
        name: "Kangnam",
        character: "Rage",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/shblOzUqimAh65WxzD8UKx7fMG5.jpg",
      },
      {
        tmdb_people_id: 552067,
        name: "Kim Tae Hoon",
        character: "Lee Kyeong-soo",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/8mTd6HpLDFK2cwiWhoyZO78A5n1.jpg",
      },
      {
        tmdb_people_id: 544090,
        name: "Satoi Kenta",
        character: "Kenichi Shirahama",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/frDNCchC32sVbTqIa2pd7ica3UE.jpg",
      },
      {
        tmdb_people_id: 1390040,
        name: "Danta Yasunori",
        character: "Masaro Kurokawa",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/ykRTDVb4i3buTJAZEE0Aac4RTTs.jpg",
      },
      {
        tmdb_people_id: 6531547,
        name: "Gong Jae-kyung",
        character: "Hye-jin",
        known_for_department: "Acting",
        profile_path:
          "https://image.tmdb.org/t/p/w276_and_h350_face/7A5f4ENCRjM7oZWQpRxKGiXs1XM.jpg",
      },
    ],
  },
];

export function findCustomMovieBySlug(slug: string): VsmovMovieItem | undefined {
  const clean = slug
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(phim|movie)\//i, "")
    .replace(/\.html$/i, "");
  const entry = CUSTOM_MOVIES.find(
    (e) =>
      e.movie.slug.toLowerCase() === clean ||
      e.aliases.some((alias) => {
        const al = alias.toLowerCase();
        return (
          al === clean ||
          (al.length >= 8 && clean.includes(al)) ||
          (clean.length >= 8 && al.includes(clean))
        );
      })
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
  const rawClean = removeVietnameseTones(keyword);
  if (!rawClean) return [];

  // Remove common prefix "phim " if user searches "phim dau tay ngot ngao"
  const clean = rawClean.replace(/^phim\s+/i, "").trim() || rawClean;
  const words = clean.split(" ").filter((w) => w.length > 1);

  return CUSTOM_MOVIES.filter((e) => {
    const nameNorm = removeVietnameseTones(e.movie.name);
    const originNorm = removeVietnameseTones(e.movie.origin_name || "");
    const slugNorm = removeVietnameseTones(e.movie.slug);
    const actorsNorm = (e.movie.actor || []).map(removeVietnameseTones).join(" ");
    const directorNorm = (e.movie.director || []).map(removeVietnameseTones).join(" ");

    // 1. Direct or bidirectional match
    if (
      nameNorm.includes(clean) ||
      clean.includes(nameNorm) ||
      originNorm.includes(clean) ||
      clean.includes(originNorm) ||
      slugNorm.includes(clean) ||
      actorsNorm.includes(clean) ||
      directorNorm.includes(clean) ||
      e.aliases.some((al) => {
        const alNorm = removeVietnameseTones(al);
        return alNorm.includes(clean) || clean.includes(alNorm);
      })
    ) {
      return true;
    }

    // 2. All words match (e.g. "dau tay", "ngot ngao", "merry berry")
    if (
      words.length > 0 &&
      words.every(
        (w) =>
          nameNorm.includes(w) ||
          originNorm.includes(w) ||
          slugNorm.includes(w) ||
          actorsNorm.includes(w) ||
          directorNorm.includes(w) ||
          e.aliases.some((al) => removeVietnameseTones(al).includes(w))
      )
    ) {
      return true;
    }

    return false;
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
    // Phim bo
    if (targetSlug === "phim-bo" && m.type === "series") return true;
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
