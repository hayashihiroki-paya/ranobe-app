import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UserProfile = {
    mainTags: string[];
    favoriteBooks: string[];
};

type UserName =
    | "バトル太郎"
    | "恋愛花子"
    | "異世界一郎"
    | "ダーク次郎"
    | "戦略家"
    | "癒し系";

// ===============================
// ユーティリティ
// ===============================
function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

// ===============================
// メイン
// ===============================
async function main() {
    console.log("🌱 Seed start");

    // ===============================
    // ① ユーザー（そのまま）
    // ===============================
    const usersData = [
        { name: "バトル太郎", email: "battle@test.com", onboardingDone: false },
        { name: "恋愛花子", email: "love@test.com", onboardingDone: false },
        { name: "異世界一郎", email: "isekai@test.com", onboardingDone: false },
        { name: "ダーク次郎", email: "dark@test.com", onboardingDone: false },
        { name: "戦略家", email: "strategy@test.com", onboardingDone: false },
        { name: "癒し系", email: "healing@test.com", onboardingDone: false },
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.create({ data: u });
        users.push(user);
    }

    // ===============================
    // ② 本（ここだけ実データ化🔥）
    // ===============================
    const booksData = [
        {
            key: "sao",
            title: "ソードアート・オンライン1アインクラッド",
            titleKana: "ソードアートオンライン1アインクラッド",
            author: "川原 礫/abec",
            authorKana: "カワハラ レキ/アベシ",
            isbn: "9784048677608",
            itemCaption: "クリアするまで脱出不可能、ゲームオーバーは本当の“死”を意味する──。謎の次世代MMO『ソードアート・オンライン（SAO）』の“真実”を知らずログインした約一万人のユーザーと共に、その過酷なデスバトルは幕を開けた。　SAOに参加した一人である主人公・キリトは、いち早くこのMMOの“真実”を受け入れる。そして、ゲームの舞台となる巨大浮遊城『アインクラッド』で、パーティを組まないソロプレイヤーとして頭角をあらわしていった。　クリア条件である最上階層到達を目指し、熾烈な冒険（クエスト）を単独で続けるキリトだったが、レイピアの名手・女流剣士アスナの強引な誘いによって彼女とコンビを組むことになってしまう。その出会いは、キリトに運命とも呼べる契機をもたらし……。果たして、キリトはこのゲームから抜け出すことができるのか。　第15回電撃小説大賞＜大賞＞受賞作『アクセル・ワールド』の著者・川原礫！",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/7608/9784048677608.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2009年04月",
            seriesName: "電撃文庫",
        },
        {
            key: "rezero",
            title: "Re：ゼロから始める異世界生活 1",
            titleKana: "リゼロカラハジメルイセカイセイカツ",
            author: "長月 達平/大塚 真一郎",
            authorKana: "ナガツキ タッペイ/オオツカ シンイチロウ",
            isbn: "9784040662084",
            itemCaption: "コンビニ帰りに突如、異世界に召喚された高校生・菜月昴。これは流行りの異世界召喚か!?　しかし召喚者はおらず、物盗りに襲われ早々に訪れる命の危機。そんな彼を救ったのは、謎の銀髪美少女と猫精霊だった。恩を返す名目でスバルは少女の物探しに協力する。だが、ようやくその手がかりが掴めた時、スバルと少女は何者かに襲撃され命を落としたーー筈が、スバルは気づくと初めて異世界召喚された場所にいた。「死に戻り」--無力な少年が手にしたのは、死して時間を巻き戻す、唯一の能力。幾多の絶望を越え、死の運命から少女を救え！　大人気WEB小説、待望の書籍化！　--たとえ君が忘れていても、俺は君を忘れない。",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2084/9784040662084_1_21.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2014年01月24日頃",
            seriesName: "MF文庫J",
        },
        {
            key: "toradora",
            title: "僕は友達が少ない",
            titleKana: "ボクハトモダチガスクナイ",
            author: "平坂読/ブリキ",
            authorKana: "ヒラサカヨミ/ブリキ",
            isbn: "9784040664637",
            itemCaption: "学校で浮いている羽瀬川小鷹は、ある時いつも不機嫌そうな美少女の三日月夜空が一人で楽しげに喋っているのを目撃する。「もしかして幽霊とか見える人？」「友達と話していただけだ。エア友達と！」「（駄目だこいつ…）」小鷹は夜空とどうすれば友達が出来るか話し合うのだが、夜空は無駄な行動力で友達作りを目指す残念な部まで作ってしまう。しかも何を間違ったか続々と残念な美少女達が入部してきてー。みんなでギャルゲーをやったりプールに行ったり演劇をやったり色々と迷走気味な彼らは本当に友達を作れるのか？アレげだけどやけに楽しい残念系青春ラブコメディ誕生。",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/4637/9784040664637_1_7.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2009年08月",
            seriesName: "MF文庫J",
        },
        {
            key: "oregairu",
            title: "俺の妹がこんなに可愛いわけがない",
            titleKana: "オレノイモウトガコンナニカワイイワケガナイ",
            author: "伏見つかさ/かんざきひろ",
            authorKana: "フシミツカサ/カンザキヒロ",
            isbn: "9784048671804",
            itemCaption: "俺の妹・高坂桐乃は、茶髪にピアスのいわゆるイマドキの女子中学生で、身内の俺が言うのもなんだが、かなりの美人ときたもんだ。　けれど、コイツは兄の俺を平気で見下してくるし、俺もそんな態度が気にくわないので、ここ数年まともに口なんか交わしちゃいない。　キレイな妹なんかいても、いいことなんて一つもないと、声を大にして言いたいね （少なくとも俺にとっては）！　だが俺はある日、妹の秘密に関わる超特大の地雷を踏んでしまった。　まさかあの妹から “人生相談” をされる羽目になるとは──!?",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/1804/9784048671804_1_9.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2008年08月10日頃",
            seriesName: "電撃文庫",
        },
        {
            key: "overlord",
            title: "オーバーロード1 不死者の王",
            titleKana: "オーバーロード1 フシシャノオウ",
            author: "丸山くがね",
            authorKana: "マルヤマクガネ",
            isbn: "9784047281523",
            itemCaption: "ネットで圧倒的人気を誇るWEB小説が堂々書籍化!!",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/1523/9784047281523.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2012年07月30日頃",
            seriesName: "",
        },
        {
            key: "konosuba",
            title: "この素晴らしい世界に祝福を！",
            titleKana: "コノスバラシイセカイニシュクフクヲ",
            author: "暁なつめ/三嶋くろね",
            authorKana: "アカツキナツメ/ミシマクロネ",
            isbn: "9784041010204",
            itemCaption: "ゲームを愛する佐藤和真は女神を道連れに異世界転生。大冒険が始まる……と思いきや、衣食住を得るための労働が始まる。「安定」を手にしたい和真だが、女神が次々問題を起こし、ついには魔王軍に目をつけられ！？",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0204/9784041010204_1_30.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2013年10月01日頃",
            seriesName: "角川スニーカー文庫",
        },
        {
            key: "youzitsu",
            title: "ようこそ実力至上主義の教室へ",
            titleKana: "ヨウコソジツリョクシジョウシュギノキョウシツヘ",
            author: "衣笠彰梧/トモセシュンサク",
            authorKana: "キヌガサショウゴ/トモセシュンサク",
            isbn: "9784040676579",
            itemCaption: "希望する進学、就職先にほぼ100％応えるという高度育成高等学校。毎月10万円相当のポイントが支給され髪型や私物の持ち込みも自由。だがその正体は優秀な者が好待遇を受けられる実力至上主義の学校で……!?",
            largeImageUrl:
                "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/6579/9784040676579_1_9.jpg",
            publisherName: "KADOKAWA",
            salesDate: "2015年05月25日頃",
            seriesName: "MF文庫J",
        },
    ];

    const books = [];
    for (const b of booksData) {
        const book = await prisma.book.create({
            data: {
                title: b.title,
                titleKana: b.titleKana,
                author: b.author,
                authorKana: b.authorKana,
                isbn: b.isbn,
                itemCaption: b.itemCaption,
                largeImageUrl: b.largeImageUrl,
                publisherName: b.publisherName,
                salesDate: b.salesDate,
                seriesName: b.seriesName,
                
            },
        });
        books.push({ ...book, key: b.key });
    }

    // ===============================
    // ③ タグ取得
    // ===============================
    const tags = await prisma.tag.findMany();
    const tagMap = Object.fromEntries(tags.map(t => [t.key, t]));
    const allTags = tags.map(t => t.key);

    // ===============================
    // ④ プロファイル（そのまま）
    // ===============================
    const userProfiles: Record<UserName, UserProfile> = {
        バトル太郎: {
            mainTags: ["genre_modern_battle", "protagonist_growth"],
            favoriteBooks: ["sao", "overlord"],
        },
        恋愛花子: {
            mainTags: ["genre_romcom", "relation_duo"],
            favoriteBooks: ["toradora", "oregairu"],
        },
        異世界一郎: {
            mainTags: ["world_isekai", "ability_cheat"],
            favoriteBooks: ["rezero", "overlord"],
        },
        ダーク次郎: {
            mainTags: ["tone_dark", "protagonist_dark"],
            favoriteBooks: ["rezero", "youzitsu"],
        },
        戦略家: {
            mainTags: ["protagonist_strategy", "genre_mystery"],
            favoriteBooks: ["youzitsu", "oregairu"],
        },
        癒し系: {
            mainTags: ["tone_wholesome", "genre_slice_of_life"],
            favoriteBooks: ["konosuba", "toradora"],
        },
    };

    // ===============================
    // ⑤ Like + Tag（完全踏襲🔥）
    // ===============================
    for (const user of users) {
        const profile = userProfiles[user.name as UserName];
        if (!profile) continue;

        const favoriteBooks = books.filter(b =>
            profile.favoriteBooks.includes(b.key)
        );

        const randomBooks = shuffle(books)
            .filter(b => !profile.favoriteBooks.includes(b.key))
            .slice(0, 2);

        const likedBooks = [...favoriteBooks, ...randomBooks];

        for (const book of likedBooks) {
            await prisma.like.create({
                data: {
                    userId: user.id,
                    bookId: book.id,
                },
            });

            const mainTags = profile.mainTags;
            const noiseTag = shuffle(allTags)[0];
            const finalTags = Array.from(new Set([...mainTags, noiseTag]));

            for (const tagKey of finalTags) {
                const tag = tagMap[tagKey];
                if (!tag) continue;

                await prisma.userBookTag.create({
                    data: {
                        userId: user.id,
                        bookId: book.id,
                        tagId: tag.id,
                        score: 1,
                    },
                });

                await prisma.userTagScore.upsert({
                    where: {
                        userId_tagId: {
                            userId: user.id,
                            tagId: tag.id,
                        },
                    },
                    update: {
                        score: { increment: 1 },
                    },
                    create: {
                        userId: user.id,
                        tagId: tag.id,
                        score: 1,
                    },
                });
            }
        }
    }

    console.log("✅ Seed complete");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());