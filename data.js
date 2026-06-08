// data.js - Центральное хранилище данных проекта
(function() {
    const STORAGE_KEY = 'football_tracker_pro_v4';
    
    window.AppData = {
        usersDatabase: JSON.parse(localStorage.getItem(STORAGE_KEY + '_users')) || {},
        activeUserEmail: localStorage.getItem(STORAGE_KEY + '_active_email') || null,
        globalClubs: JSON.parse(localStorage.getItem(STORAGE_KEY + '_global_clubs')) || [],
        messages: JSON.parse(localStorage.getItem(STORAGE_KEY + '_messages')) || {},
        clubChats: JSON.parse(localStorage.getItem(STORAGE_KEY + '_club_chats')) || {},
        userLeagues: JSON.parse(localStorage.getItem(STORAGE_KEY + '_user_leagues')) || {},
        leagueNotifications: JSON.parse(localStorage.getItem(STORAGE_KEY + '_league_notifications')) || {},
        
        saveUsers() {
            localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(this.usersDatabase));
        },
        saveGlobalClubs() {
            localStorage.setItem(STORAGE_KEY + '_global_clubs', JSON.stringify(this.globalClubs));
        },
        saveMessages() {
            localStorage.setItem(STORAGE_KEY + '_messages', JSON.stringify(this.messages));
        },
        saveUserLeagues() {
            localStorage.setItem(STORAGE_KEY + '_user_leagues', JSON.stringify(this.userLeagues));
        },
        saveClubChats() {
            localStorage.setItem(STORAGE_KEY + '_club_chats', JSON.stringify(this.clubChats));
        },
        saveLeagueNotifications() {
            localStorage.setItem(STORAGE_KEY + '_league_notifications', JSON.stringify(this.leagueNotifications));
        },
        saveAll() {
            this.saveUsers();
            this.saveGlobalClubs();
            this.saveMessages();
            this.saveUserLeagues();
            this.saveClubChats();
            this.saveLeagueNotifications();
        },
        
        getChatKey(a, b) {
            return [a, b].sort().join('|||');
        },
        getRank(exp) {
            const RANKS = [
                { exp: 0, name: "Начинающий" },
                { exp: 500, name: "Новичок" },
                { exp: 1000, name: "Нуб" },
                { exp: 1500, name: "Средний" },
                { exp: 2000, name: "Нормальный" },
                { exp: 2500, name: "Любитель" },
                { exp: 3000, name: "Мировой класс" },
                { exp: 3500, name: "Герой" },
                { exp: 4000, name: "Мастер" },
                { exp: 5000, name: "Легенда" }
            ];
            
            let cur = RANKS[0], nxt = RANKS[1];
            for (let i = 0; i < RANKS.length; i++) {
                if (exp >= RANKS[i].exp) {
                    cur = RANKS[i];
                    nxt = RANKS[i + 1] || null;
                }
            }
            return { current: cur, next: nxt };
        },
        getUserClubs(email) {
            return this.globalClubs.filter(c => c.members.some(m => m.email === email));
        },
        isClubAdmin(club, email) {
            const m = club.members.find(m => m.email === email);
            return m && (m.role === 'owner' || m.role === 'captain');
        },
        isClubMember(clubId, email) {
            const club = this.globalClubs.find(c => c.id === clubId);
            return club && club.members.some(m => m.email === email);
        },
        getUserLeagueIds(email) {
            return this.userLeagues[email] || [];
        },
        isUserInLeague(leagueId, email) {
            return this.getUserLeagueIds(email).includes(leagueId);
        },
        getLeagueNotificationCount(leagueId) {
            return this.leagueNotifications[leagueId] || 0;
        },
        getPlayerAwards(email) {
            const awards = [];
            this.globalClubs.forEach(club => {
                if (club.members.some(m => m.email === email) && club.hallOfFame) {
                    club.hallOfFame.forEach(award => {
                        awards.push({ ...award, clubName: club.name });
                    });
                }
            });
            return awards;
        },
        getUnreadCount(email) {
            let count = 0;
            Object.keys(this.messages).forEach(key => {
                if (key.includes(email)) {
                    const msgs = this.messages[key];
                    if (msgs && msgs.length > 0) {
                        const lastMsg = msgs[msgs.length - 1];
                        if (lastMsg.from !== email && lastMsg.from !== 'system') count++;
                    }
                }
            });
            
            const userClubs = this.getUserClubs(email);
            userClubs.forEach(club => {
                const chatKey = 'club_' + club.id;
                const msgs = this.clubChats[chatKey] || [];
                if (msgs.length > 0) {
                    const lastMsg = msgs[msgs.length - 1];
                    if (lastMsg.from !== email) count++;
                }
            });
            
            return count;
        },
        getContactList(email) {
            const contacts = new Set();
            Object.keys(this.messages).forEach(key => {
                const parts = key.split('|||');
                if (parts.includes(email)) {
                    const other = parts.find(p => p !== email && p !== 'system');
                    if (other) contacts.add(other);
                }
            });
            return Array.from(contacts);
        },
        
        testLeagues: [
            { id: 1, name: "Kazakhstan Premier League", logo: "🇰🇿", members: 48, online: 12, season: 12, participants: [] },
            { id: 2, name: "Russian Super League", logo: "🇷🇺", members: 96, online: 34, season: 8, participants: [] },
            { id: 3, name: "European Champions Arena", logo: "🇪🇺", members: 144, online: 67, season: 15, participants: [] },
            { id: 4, name: "Asian Elite Division", logo: "🌏", members: 72, online: 19, season: 5, participants: [] },
            { id: 5, name: "American Continental Cup", logo: "🌎", members: 60, online: 28, season: 10, participants: [] },
            { id: 6, name: "Global Youth League", logo: "🌟", members: 120, online: 45, season: 3, participants: [] }
        ],
        
        testNews: {
            1: [
                { time: "12 мая 2024", images: ["https://picsum.photos/seed/news1a/600/300"], title: "Старт нового сезона", preview: "Kazakhstan Premier League объявляет о старте 12-го сезона...", full: "Kazakhstan Premier League объявляет о старте 12-го сезона. В этом сезоне нас ждут новые команды и захватывающие матчи. Регистрация открыта до конца месяца. Ожидается участие 12 клубов со всего Казахстана." },
                { time: "10 мая 2024", images: ["https://picsum.photos/seed/news1b/600/300", "https://picsum.photos/seed/news1c/600/300"], title: "Обновление правил", preview: "Внесены изменения в правила проведения матчей...", full: "Внесены изменения в правила проведения матчей. Теперь каждый клуб может заявить до 3 легионеров. Также изменён формат плей-офф." },
                { time: "5 мая 2024", images: ["https://picsum.photos/seed/news1d/600/300"], title: "Трансферные новости", preview: "Кайрат подписал нового игрока...", full: "Кайрат подписал контракт с перспективным нападающим. Сумма трансфера не разглашается. Игрок присоединится к команде на следующей неделе." }
            ],
            2: [
                { time: "14 мая 2024", images: ["https://picsum.photos/seed/news2a/600/300"], title: "Новый рекорд посещаемости", preview: "В Russian Super League установлен новый рекорд...", full: "В Russian Super League установлен новый рекорд посещаемости — 45 000 зрителей на финале сезона. Предыдущий рекорд был 38 000 в 2022 году." },
                { time: "8 мая 2024", images: ["https://picsum.photos/seed/news2b/600/300"], title: "Дисквалификации и штрафы", preview: "Дисциплинарный комитет вынес решения...", full: "Дисциплинарный комитет вынес решения по нарушениям в матчах прошлого тура. Три игрока получили дисквалификации на 2 матча." },
                { time: "1 мая 2024", images: ["https://picsum.photos/seed/news2c/600/300", "https://picsum.photos/seed/news2d/600/300"], title: "Календарь на сезон", preview: "Опубликован полный календарь матчей...", full: "Опубликован полный календарь матчей на предстоящий сезон. Болельщики могут планировать посещение игр заранее." }
            ],
            3: [
                { time: "15 мая 2024", images: ["https://picsum.photos/seed/news3a/600/300"], title: "Трансферное окно открыто", preview: "Открыто летнее трансферное окно в European Champions Arena...", full: "Открыто летнее трансферное окно в European Champions Arena. Клубы могут обмениваться игроками до 30 июня. Ожидается высокая активность на рынке." },
                { time: "11 мая 2024", images: ["https://picsum.photos/seed/news3b/600/300"], title: "Финал ECA приближается", preview: "Определились финалисты European Champions Arena...", full: "Определились финалисты European Champions Arena. В решающем матче встретятся команды из Германии и Испании. Матч пройдёт 25 мая." },
                { time: "3 мая 2024", images: ["https://picsum.photos/seed/news3c/600/300"], title: "Спонсорское соглашение", preview: "ECA подписала крупный спонсорский контракт...", full: "ECA подписала крупный спонсорский контракт на 50 миллионов евро. Средства пойдут на развитие инфраструктуры и призовой фонд." }
            ],
            4: [
                { time: "13 мая 2024", images: ["https://picsum.photos/seed/news4a/600/300"], title: "Расширение лиги", preview: "Asian Elite Division объявляет о расширении...", full: "Asian Elite Division объявляет о расширении до 80 команд со следующего сезона. Новые команды из Юго-Восточной Азии присоединятся к лиге." },
                { time: "7 мая 2024", images: ["https://picsum.photos/seed/news4b/600/300"], title: "Техническое обновление", preview: "Внедрена новая система видеопомощи арбитрам...", full: "Внедрена новая система видеопомощи арбитрам. Теперь все спорные моменты будут рассматриваться с помощью VAR в реальном времени." },
                { time: "28 апреля 2024", images: ["https://picsum.photos/seed/news4c/600/300", "https://picsum.photos/seed/news4d/600/300"], title: "Звёздный уикенд", preview: "Анонсирован звёздный уикенд Asian Elite Division...", full: "Анонсирован звёздный уикенд Asian Elite Division. Лучшие игроки лиги примут участие в выставочном матче и конкурсах мастерства." }
            ],
            5: [
                { time: "16 мая 2024", images: ["https://picsum.photos/seed/news5a/600/300"], title: "Новый формат плей-офф", preview: "American Continental Cup вводит новый формат...", full: "American Continental Cup вводит новый формат плей-офф. Теперь в финальную стадию выходят 16 команд вместо 8." },
                { time: "9 мая 2024", images: ["https://picsum.photos/seed/news5b/600/300"], title: "Рекордные призовые", preview: "Призовой фонд ACC достиг рекордной отметки...", full: "Призовой фонд American Continental Cup достиг рекордной отметки в 100 миллионов долларов. Победитель получит 25 миллионов." },
                { time: "2 мая 2024", images: ["https://picsum.photos/seed/news5c/600/300"], title: "Партнёрство с ESPN", preview: "ACC подписал контракт на трансляции с ESPN...", full: "American Continental Cup подписал эксклюзивный контракт на трансляции с ESPN. Матчи будут доступны в 150 странах мира." }
            ],
            6: [
                { time: "17 мая 2024", images: ["https://picsum.photos/seed/news6a/600/300"], title: "Открытие академии", preview: "Global Youth League открывает футбольную академию...", full: "Global Youth League открывает футбольную академию для молодых талантов. Принимаются заявки от игроков 14-18 лет со всего мира." },
                { time: "12 мая 2024", images: ["https://picsum.photos/seed/news6b/600/300", "https://picsum.photos/seed/news6c/600/300"], title: "Скаутская программа", preview: "Запущена международная скаутская программа...", full: "Запущена международная скаутская программа. Скауты GYL посетят 50 стран в поисках будущих звёзд футбола." },
                { time: "6 мая 2024", images: ["https://picsum.photos/seed/news6d/600/300"], title: "Победители прошлого сезона", preview: "Объявлены победители 2-го сезона GYL...", full: "Объявлены победители 2-го сезона Global Youth League. Команда из Бразилии заняла первое место, второе — Нигерия, третье — Япония." }
            ]
        },
        
        testStandings: {
            1: [
                { name: "Кайрат", logo: "", gp: 10, w: 6, d: 2, l: 2, gf: 18, ga: 8, pts: 20 },
                { name: "Астана", logo: "", gp: 10, w: 5, d: 3, l: 2, gf: 15, ga: 10, pts: 18 },
                { name: "Тобол", logo: "", gp: 10, w: 5, d: 2, l: 3, gf: 14, ga: 11, pts: 17 },
                { name: "Актобе", logo: "", gp: 10, w: 4, d: 3, l: 3, gf: 12, ga: 12, pts: 15 },
                { name: "Ордабасы", logo: "", gp: 10, w: 3, d: 4, l: 3, gf: 10, ga: 10, pts: 13 },
                { name: "Шахтёр", logo: "", gp: 10, w: 2, d: 2, l: 6, gf: 8, ga: 20, pts: 8 }
            ],
            2: [
                { name: "Зенит", logo: "", gp: 12, w: 8, d: 2, l: 2, gf: 22, ga: 9, pts: 26 },
                { name: "Спартак", logo: "", gp: 12, w: 7, d: 3, l: 2, gf: 20, ga: 11, pts: 24 },
                { name: "ЦСКА", logo: "", gp: 12, w: 6, d: 4, l: 2, gf: 18, ga: 10, pts: 22 },
                { name: "Локомотив", logo: "", gp: 12, w: 5, d: 3, l: 4, gf: 15, ga: 14, pts: 18 },
                { name: "Динамо", logo: "", gp: 12, w: 4, d: 4, l: 4, gf: 13, ga: 13, pts: 16 },
                { name: "Краснодар", logo: "", gp: 12, w: 3, d: 5, l: 4, gf: 11, ga: 15, pts: 14 },
                { name: "Ростов", logo: "", gp: 12, w: 2, d: 3, l: 7, gf: 8, ga: 18, pts: 9 },
                { name: "Сочи", logo: "", gp: 12, w: 1, d: 2, l: 9, gf: 5, ga: 22, pts: 5 }
            ],
            3: [
                { name: "Бавария", logo: "", gp: 14, w: 10, d: 2, l: 2, gf: 32, ga: 12, pts: 32 },
                { name: "Реал Мадрид", logo: "", gp: 14, w: 9, d: 3, l: 2, gf: 28, ga: 14, pts: 30 },
                { name: "Манчестер Сити", logo: "", gp: 14, w: 8, d: 4, l: 2, gf: 26, ga: 13, pts: 28 },
                { name: "ПСЖ", logo: "", gp: 14, w: 7, d: 4, l: 3, gf: 24, ga: 15, pts: 25 },
                { name: "Барселона", logo: "", gp: 14, w: 6, d: 5, l: 3, gf: 22, ga: 16, pts: 23 },
                { name: "Ливерпуль", logo: "", gp: 14, w: 5, d: 4, l: 5, gf: 19, ga: 20, pts: 19 },
                { name: "Ювентус", logo: "", gp: 14, w: 4, d: 5, l: 5, gf: 16, ga: 18, pts: 17 },
                { name: "Интер", logo: "", gp: 14, w: 3, d: 4, l: 7, gf: 14, ga: 24, pts: 13 }
            ],
            4: [
                { name: "Аль-Хиляль", logo: "", gp: 8, w: 6, d: 1, l: 1, gf: 19, ga: 7, pts: 19 },
                { name: "Урава Редс", logo: "", gp: 8, w: 5, d: 2, l: 1, gf: 15, ga: 8, pts: 17 },
                { name: "Чонбук", logo: "", gp: 8, w: 4, d: 2, l: 2, gf: 12, ga: 9, pts: 14 },
                { name: "Персеполис", logo: "", gp: 8, w: 3, d: 3, l: 2, gf: 10, ga: 10, pts: 12 },
                { name: "Сидней", logo: "", gp: 8, w: 2, d: 2, l: 4, gf: 8, ga: 14, pts: 8 },
                { name: "Гуанчжоу", logo: "", gp: 8, w: 1, d: 0, l: 7, gf: 5, ga: 21, pts: 3 }
            ],
            5: [
                { name: "Фламенго", logo: "", gp: 10, w: 7, d: 2, l: 1, gf: 21, ga: 8, pts: 23 },
                { name: "Ривер Плейт", logo: "", gp: 10, w: 6, d: 3, l: 1, gf: 18, ga: 9, pts: 21 },
                { name: "Бока Хуниорс", logo: "", gp: 10, w: 5, d: 3, l: 2, gf: 16, ga: 11, pts: 18 },
                { name: "ЛА Гэлакси", logo: "", gp: 10, w: 4, d: 3, l: 3, gf: 14, ga: 13, pts: 15 },
                { name: "Америка", logo: "", gp: 10, w: 3, d: 2, l: 5, gf: 11, ga: 16, pts: 11 },
                { name: "Сантос", logo: "", gp: 10, w: 1, d: 1, l: 8, gf: 6, ga: 24, pts: 4 }
            ],
            6: [
                { name: "Бразилия U18", logo: "", gp: 6, w: 5, d: 1, l: 0, gf: 18, ga: 4, pts: 16 },
                { name: "Нигерия U18", logo: "", gp: 6, w: 4, d: 1, l: 1, gf: 14, ga: 7, pts: 13 },
                { name: "Япония U18", logo: "", gp: 6, w: 3, d: 2, l: 1, gf: 11, ga: 6, pts: 11 },
                { name: "Франция U18", logo: "", gp: 6, w: 2, d: 2, l: 2, gf: 9, ga: 9, pts: 8 },
                { name: "Германия U18", logo: "", gp: 6, w: 1, d: 1, l: 4, gf: 5, ga: 13, pts: 4 },
                { name: "Аргентина U18", logo: "", gp: 6, w: 0, d: 1, l: 5, gf: 3, ga: 17, pts: 1 }
            ]
        },
        
        testMatches: {
            1: [
                {
                    id: 101, date: "15 мая 2024", time: "22:00", played: true,
                    home: { name: "Кайрат", logo: "", color: "#1e40af", goals: 2 },
                    away: { name: "Астана", logo: "", color: "#dc2626", goals: 1 },
                    events: [
                        { side: 'home', player: "Дастан", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Алихан", action: 'goal', assist: "Дастан", half: '2т' },
                        { side: 'away', player: "Нурлан", action: 'goal', assist: "Максим", half: '2т' }
                    ],
                    info: {
                        home: { author: "Дастан", text: "Отличная игра! Доминировали весь матч." },
                        away: { author: "Алихан", text: "Будем работать над ошибками." }
                    },
                    records: ["🎥 Запись 1", "🎥 Запись 2"],
                    lineups: {
                        '1т': { home: ["Дастан", "Тимур", "Арман", "Руслан"], away: ["Алихан", "Нурлан", "Максим", "Арсен"] },
                        '2т': { home: ["Дастан", "Тимур", "Арман", "Алихан"], away: ["Нурлан", "Максим", "Арсен", "Виктор"] }
                    }
                },
                {
                    id: 102, date: "15 мая 2024", time: "20:00", played: true,
                    home: { name: "Тобол", logo: "", color: "#065f46", goals: 0 },
                    away: { name: "Актобе", logo: "", color: "#b45309", goals: 3 },
                    events: [
                        { side: 'away', player: "Арман", action: 'goal', assist: "Руслан", half: '1т' },
                        { side: 'away', player: "Арман", action: 'goal', assist: "Виктор", half: '1т' },
                        { side: 'away', player: "Руслан", action: 'goal', assist: null, half: '2т' }
                    ],
                    info: {
                        home: { author: "Нурлан", text: "Провальный матч..." },
                        away: { author: "Арман", text: "Лучшая игра сезона! Хет-трик!" }
                    },
                    records: [],
                    lineups: {
                        '1т': { home: ["Нурлан", "Тимур", "Ерлан", "Виктор"], away: ["Арман", "Руслан", "Дастан", "Алихан"] },
                        '2т': { home: ["Нурлан", "Тимур", "Ерлан", "Дастан"], away: ["Арман", "Руслан", "Алихан", "Максим"] }
                    }
                },
                {
                    id: 103, date: "16 мая 2024", time: "18:30", played: false,
                    home: { name: "Ордабасы", logo: "", color: "#7c3aed", goals: 0 },
                    away: { name: "Шахтёр", logo: "", color: "#db2777", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ],
            2: [
                {
                    id: 201, date: "16 мая 2024", time: "21:00", played: true,
                    home: { name: "Зенит", logo: "", color: "#1e88e5", goals: 3 },
                    away: { name: "Спартак", logo: "", color: "#e53935", goals: 2 },
                    events: [
                        { side: 'home', player: "Ерлан", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Максим", action: 'goal', assist: "Ерлан", half: '1т' },
                        { side: 'away', player: "Тимур", action: 'goal', assist: null, half: '2т' },
                        { side: 'home', player: "Виктор", action: 'goal', assist: null, half: '2т' },
                        { side: 'away', player: "Арсен", action: 'goal', assist: "Тимур", half: '2т' }
                    ],
                    info: {
                        home: { author: "Ерлан", text: "Дерби всегда особенное! Отличная победа." },
                        away: { author: "Тимур", text: "Бились до конца, но не хватило." }
                    },
                    records: ["🎥 Запись матча"],
                    lineups: {
                        '1т': { home: ["Ерлан", "Максим", "Виктор", "Арсен"], away: ["Тимур", "Арман", "Руслан", "Дастан"] },
                        '2т': { home: ["Ерлан", "Максим", "Виктор", "Нурлан"], away: ["Тимур", "Арман", "Арсен", "Алихан"] }
                    }
                },
                {
                    id: 202, date: "16 мая 2024", time: "19:00", played: true,
                    home: { name: "ЦСКА", logo: "", color: "#1565c0", goals: 2 },
                    away: { name: "Локомотив", logo: "", color: "#c62828", goals: 0 },
                    events: [
                        { side: 'home', player: "Руслан", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Дастан", action: 'goal', assist: "Руслан", half: '2т' }
                    ],
                    info: {
                        home: { author: "Руслан", text: "Уверенная победа. Так держать!" },
                        away: { author: "Нурлан", text: "Не наш день. Будем исправляться." }
                    },
                    records: [],
                    lineups: {
                        '1т': { home: ["Руслан", "Дастан", "Арман", "Алихан"], away: ["Нурлан", "Тимур", "Максим", "Виктор"] },
                        '2т': { home: ["Руслан", "Дастан", "Арман", "Ерлан"], away: ["Нурлан", "Тимур", "Максим", "Арсен"] }
                    }
                },
                {
                    id: 203, date: "17 мая 2024", time: "20:30", played: false,
                    home: { name: "Динамо", logo: "", color: "#1565c0", goals: 0 },
                    away: { name: "Краснодар", logo: "", color: "#2e7d32", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ],
            3: [
                {
                    id: 301, date: "17 мая 2024", time: "22:00", played: true,
                    home: { name: "Бавария", logo: "", color: "#c62828", goals: 4 },
                    away: { name: "Реал Мадрид", logo: "", color: "#f5f5f5", goals: 2 },
                    events: [
                        { side: 'home', player: "Арсен", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Арсен", action: 'goal', assist: "Виктор", half: '1т' },
                        { side: 'away', player: "Дастан", action: 'goal', assist: null, half: '2т' },
                        { side: 'home', player: "Максим", action: 'goal', assist: null, half: '2т' },
                        { side: 'home', player: "Ерлан", action: 'goal', assist: "Максим", half: '2т' },
                        { side: 'away', player: "Алихан", action: 'goal', assist: null, half: '2т' }
                    ],
                    info: {
                        home: { author: "Арсен", text: "Фантастический матч! Дубль и победа над Реалом!" },
                        away: { author: "Дастан", text: "Бавария была сильнее сегодня. Готовимся к реваншу." }
                    },
                    records: ["🎥 Хайлайты", "🎥 Полный матч"],
                    lineups: {
                        '1т': { home: ["Арсен", "Виктор", "Максим", "Ерлан"], away: ["Дастан", "Алихан", "Руслан", "Тимур"] },
                        '2т': { home: ["Арсен", "Максим", "Ерлан", "Нурлан"], away: ["Дастан", "Алихан", "Руслан", "Арман"] }
                    }
                },
                {
                    id: 302, date: "17 мая 2024", time: "20:00", played: true,
                    home: { name: "Манчестер Сити", logo: "", color: "#6cabe3", goals: 1 },
                    away: { name: "ПСЖ", logo: "", color: "#0c1f3f", goals: 1 },
                    events: [
                        { side: 'away', player: "Тимур", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Руслан", action: 'goal', assist: "Арман", half: '2т' }
                    ],
                    info: {
                        home: { author: "Руслан", text: "Ничья с ПСЖ — достойный результат." },
                        away: { author: "Тимур", text: "Могли выиграть, но ничья тоже неплохо." }
                    },
                    records: [],
                    lineups: {
                        '1т': { home: ["Руслан", "Арман", "Дастан", "Алихан"], away: ["Тимур", "Арсен", "Максим", "Виктор"] },
                        '2т': { home: ["Руслан", "Арман", "Дастан", "Ерлан"], away: ["Тимур", "Арсен", "Максим", "Нурлан"] }
                    }
                },
                {
                    id: 303, date: "18 мая 2024", time: "21:30", played: false,
                    home: { name: "Барселона", logo: "", color: "#a50044", goals: 0 },
                    away: { name: "Ливерпуль", logo: "", color: "#c8102e", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ],
            4: [
                {
                    id: 401, date: "18 мая 2024", time: "19:00", played: true,
                    home: { name: "Аль-Хиляль", logo: "", color: "#1e40af", goals: 2 },
                    away: { name: "Урава Редс", logo: "", color: "#dc2626", goals: 0 },
                    events: [
                        { side: 'home', player: "Дастан", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Арман", action: 'goal', assist: "Дастан", half: '2т' }
                    ],
                    info: {
                        home: { author: "Дастан", text: "Чистая победа! Лидируем в таблице." },
                        away: { author: "Алихан", text: "Аль-Хиляль был сильнее. Нужно улучшать игру." }
                    },
                    records: [],
                    lineups: {
                        '1т': { home: ["Дастан", "Арман", "Тимур", "Руслан"], away: ["Алихан", "Нурлан", "Максим", "Арсен"] },
                        '2т': { home: ["Дастан", "Арман", "Тимур", "Виктор"], away: ["Алихан", "Нурлан", "Ерлан", "Арсен"] }
                    }
                },
                {
                    id: 402, date: "19 мая 2024", time: "17:30", played: false,
                    home: { name: "Чонбук", logo: "", color: "#15803d", goals: 0 },
                    away: { name: "Персеполис", logo: "", color: "#b91c1c", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ],
            5: [
                {
                    id: 501, date: "19 мая 2024", time: "21:00", played: true,
                    home: { name: "Фламенго", logo: "", color: "#c62828", goals: 3 },
                    away: { name: "Ривер Плейт", logo: "", color: "#ffffff", goals: 1 },
                    events: [
                        { side: 'home', player: "Арсен", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Максим", action: 'goal', assist: "Арсен", half: '1т' },
                        { side: 'home', player: "Виктор", action: 'goal', assist: null, half: '2т' },
                        { side: 'away', player: "Дастан", action: 'goal', assist: null, half: '2т' }
                    ],
                    info: {
                        home: { author: "Арсен", text: "Великолепная игра! Фламенго — чемпион!" },
                        away: { author: "Дастан", text: "Сложный выезд. Готовимся к ответной игре." }
                    },
                    records: ["🎥 Лучшие моменты"],
                    lineups: {
                        '1т': { home: ["Арсен", "Максим", "Виктор", "Ерлан"], away: ["Дастан", "Алихан", "Руслан", "Тимур"] },
                        '2т': { home: ["Арсен", "Максим", "Виктор", "Нурлан"], away: ["Дастан", "Алихан", "Руслан", "Арман"] }
                    }
                },
                {
                    id: 502, date: "20 мая 2024", time: "19:30", played: false,
                    home: { name: "Бока Хуниорс", logo: "", color: "#1e40af", goals: 0 },
                    away: { name: "ЛА Гэлакси", logo: "", color: "#fbbf24", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ],
            6: [
                {
                    id: 601, date: "20 мая 2024", time: "18:00", played: true,
                    home: { name: "Бразилия U18", logo: "", color: "#009c3b", goals: 4 },
                    away: { name: "Нигерия U18", logo: "", color: "#008753", goals: 2 },
                    events: [
                        { side: 'home', player: "Дастан", action: 'goal', assist: null, half: '1т' },
                        { side: 'home', player: "Дастан", action: 'goal', assist: "Руслан", half: '1т' },
                        { side: 'away', player: "Тимур", action: 'goal', assist: null, half: '2т' },
                        { side: 'home', player: "Арман", action: 'goal', assist: null, half: '2т' },
                        { side: 'home', player: "Алихан", action: 'goal', assist: "Арман", half: '2т' },
                        { side: 'away', player: "Арсен", action: 'goal', assist: null, half: '2т' }
                    ],
                    info: {
                        home: { author: "Дастан", text: "Бразилия — сила! Дубль в важном матче." },
                        away: { author: "Тимур", text: "Бразилия была хороша. Мы будем сильнее." }
                    },
                    records: ["🎥 Запись"],
                    lineups: {
                        '1т': { home: ["Дастан", "Руслан", "Арман", "Алихан"], away: ["Тимур", "Арсен", "Максим", "Виктор"] },
                        '2т': { home: ["Дастан", "Руслан", "Арман", "Нурлан"], away: ["Тимур", "Арсен", "Максим", "Ерлан"] }
                    }
                },
                {
                    id: 602, date: "20 мая 2024", time: "16:00", played: true,
                    home: { name: "Япония U18", logo: "", color: "#bc002d", goals: 1 },
                    away: { name: "Франция U18", logo: "", color: "#002395", goals: 0 },
                    events: [
                        { side: 'home', player: "Максим", action: 'goal', assist: null, half: '2т' }
                    ],
                    info: {
                        home: { author: "Максим", text: "Тяжёлая победа, но 3 очка есть 3 очка!" },
                        away: { author: "Виктор", text: "Не забили свои моменты. Двигаемся дальше." }
                    },
                    records: [],
                    lineups: {
                        '1т': { home: ["Максим", "Виктор", "Дастан", "Арсен"], away: ["Виктор", "Ерлан", "Нурлан", "Тимур"] },
                        '2т': { home: ["Максим", "Виктор", "Дастан", "Алихан"], away: ["Виктор", "Ерлан", "Нурлан", "Руслан"] }
                    }
                },
                {
                    id: 603, date: "21 мая 2024", time: "19:00", played: false,
                    home: { name: "Германия U18", logo: "", color: "#000000", goals: 0 },
                    away: { name: "Аргентина U18", logo: "", color: "#75aadb", goals: 0 },
                    events: [], info: { home: null, away: null }, records: [],
                    lineups: { '1т': { home: [], away: [] }, '2т': { home: [], away: [] } }
                }
            ]
        },
        
        init() {
            if (!localStorage.getItem(STORAGE_KEY + '_users')) {
                this.usersDatabase = {
                    "a@a.a": { password: "12345678", profile: { name: "Дастан", hashtag: "#7777", photo: "", nationality: "🇰🇿", position: "Уник", exp: 2800, created: "2024-01-15" }, clubs: [] },
                    "b@b.b": { password: "12345678", profile: { name: "Алихан", hashtag: "#8888", photo: "", nationality: "🇰🇿", position: "ОП", exp: 1500, created: "2024-03-10" }, clubs: [] },
                    "c@c.c": { password: "12345678", profile: { name: "Нурлан", hashtag: "#9999", photo: "", nationality: "🇰🇿", position: "НАП", exp: 3400, created: "2023-11-20" }, clubs: [] },
                    "d@d.d": { password: "12345678", profile: { name: "Ерлан", hashtag: "#1111", photo: "", nationality: "🇷🇺", position: "Уник", exp: 900, created: "2024-06-05" }, clubs: [] },
                    "e@e.e": { password: "12345678", profile: { name: "Арман", hashtag: "#2222", photo: "", nationality: "🇰🇿", position: "НАП", exp: 4100, created: "2023-09-01" }, clubs: [] },
                    "f@f.f": { password: "12345678", profile: { name: "Максим", hashtag: "#3333", photo: "", nationality: "🇷🇺", position: "ОП", exp: 2200, created: "2024-02-20" }, clubs: [] },
                    "g@g.g": { password: "12345678", profile: { name: "Тимур", hashtag: "#4444", photo: "", nationality: "🇰🇿", position: "НАП", exp: 1800, created: "2024-04-12" }, clubs: [] },
                    "h@h.h": { password: "12345678", profile: { name: "Арсен", hashtag: "#5555", photo: "", nationality: "🇩🇪", position: "Уник", exp: 3100, created: "2023-12-01" }, clubs: [] },
                    "i@i.i": { password: "12345678", profile: { name: "Виктор", hashtag: "#6666", photo: "", nationality: "🇪🇸", position: "ОП", exp: 1200, created: "2024-05-18" }, clubs: [] },
                    "j@j.j": { password: "12345678", profile: { name: "Руслан", hashtag: "#1212", photo: "", nationality: "🇰🇿", position: "НАП", exp: 4500, created: "2023-08-08" }, clubs: [] }
                };
                this.saveUsers();
            }
            
            if (!localStorage.getItem(STORAGE_KEY + '_global_clubs')) {
                this.globalClubs = [
                    { id: 1, name: "Кайрат", logo: "", maxPlayers: 24, members: [
                        { email: "a@a.a", role: "owner", stats: { goals: 5, assists: 3, games: 8, mvp: 2 } },
                        { email: "b@b.b", role: "captain", stats: { goals: 2, assists: 5, games: 7, mvp: 1 } },
                        { email: "c@c.c", role: "member", stats: { goals: 0, assists: 1, games: 3, mvp: 0 } },
                        { email: "g@g.g", role: "member", stats: { goals: 3, assists: 2, games: 6, mvp: 1 } }
                    ], applications: [], stats: { games: 10, wins: 6, losses: 4 }, hallOfFame: [{ icon: "🏆", type: "Кубок лиги", league: "KPL", season: "2024" }], refBlocked: false, lastActivity: Date.now() },
                    { id: 2, name: "Астана", logo: "", maxPlayers: 36, members: [
                        { email: "b@b.b", role: "owner", stats: { goals: 8, assists: 4, games: 12, mvp: 3 } },
                        { email: "a@a.a", role: "member", stats: { goals: 3, assists: 2, games: 5, mvp: 1 } },
                        { email: "f@f.f", role: "captain", stats: { goals: 1, assists: 6, games: 9, mvp: 2 } },
                        { email: "h@h.h", role: "member", stats: { goals: 4, assists: 1, games: 7, mvp: 0 } }
                    ], applications: [], stats: { games: 15, wins: 9, losses: 6 }, hallOfFame: [{ icon: "🏆", type: "Суперкубок", league: "KPL", season: "2023" }], refBlocked: false, lastActivity: Date.now() },
                    { id: 3, name: "Тобол", logo: "", maxPlayers: 12, members: [
                        { email: "c@c.c", role: "owner", stats: { goals: 10, assists: 6, games: 14, mvp: 4 } },
                        { email: "e@e.e", role: "captain", stats: { goals: 1, assists: 0, games: 2, mvp: 0 } },
                        { email: "i@i.i", role: "member", stats: { goals: 2, assists: 3, games: 5, mvp: 1 } }
                    ], applications: [], stats: { games: 8, wins: 5, losses: 3 }, hallOfFame: [], refBlocked: false, lastActivity: Date.now() },
                    { id: 4, name: "Ордабасы", logo: "", maxPlayers: 24, members: [
                        { email: "d@d.d", role: "owner", stats: { goals: 6, assists: 7, games: 10, mvp: 2 } },
                        { email: "j@j.j", role: "member", stats: { goals: 7, assists: 2, games: 11, mvp: 3 } },
                        { email: "g@g.g", role: "member", stats: { goals: 1, assists: 4, games: 4, mvp: 0 } }
                    ], applications: [], stats: { games: 12, wins: 7, losses: 5 }, hallOfFame: [{ icon: "🏆", type: "Кубок страны", league: "KAZ", season: "2024" }], refBlocked: false, lastActivity: Date.now() },
                    { id: 5, name: "Актобе", logo: "", maxPlayers: 36, members: [
                        { email: "e@e.e", role: "owner", stats: { goals: 12, assists: 8, games: 18, mvp: 5 } },
                        { email: "c@c.c", role: "member", stats: { goals: 4, assists: 2, games: 6, mvp: 1 } },
                        { email: "b@b.b", role: "member", stats: { goals: 0, assists: 3, games: 4, mvp: 0 } },
                        { email: "f@f.f", role: "captain", stats: { goals: 3, assists: 5, games: 8, mvp: 2 } },
                        { email: "i@i.i", role: "member", stats: { goals: 1, assists: 1, games: 3, mvp: 0 } }
                    ], applications: [], stats: { games: 20, wins: 14, losses: 6 }, hallOfFame: [{ icon: "🏆", type: "Чемпионшип", league: "PULT", season: "2024" }], refBlocked: false, lastActivity: Date.now() },
                    { id: 6, name: "Шахтёр", logo: "", maxPlayers: 24, members: [
                        { email: "h@h.h", role: "owner", stats: { goals: 9, assists: 4, games: 13, mvp: 3 } },
                        { email: "j@j.j", role: "member", stats: { goals: 2, assists: 1, games: 5, mvp: 0 } }
                    ], applications: [], stats: { games: 9, wins: 3, losses: 6 }, hallOfFame: [], refBlocked: false, lastActivity: Date.now() },
                    { id: 7, name: "Жетысу", logo: "", maxPlayers: 12, members: [
                        { email: "g@g.g", role: "owner", stats: { goals: 4, assists: 6, games: 10, mvp: 2 } },
                        { email: "d@d.d", role: "member", stats: { goals: 1, assists: 2, games: 4, mvp: 0 } }
                    ], applications: [], stats: { games: 7, wins: 4, losses: 3 }, hallOfFame: [], refBlocked: false, lastActivity: Date.now() },
                    { id: 8, name: "Тараз", logo: "", maxPlayers: 36, members: [
                        { email: "f@f.f", role: "owner", stats: { goals: 7, assists: 3, games: 11, mvp: 4 } },
                        { email: "a@a.a", role: "captain", stats: { goals: 2, assists: 4, games: 6, mvp: 1 } },
                        { email: "i@i.i", role: "member", stats: { goals: 0, assists: 2, games: 3, mvp: 0 } }
                    ], applications: [], stats: { games: 11, wins: 5, losses: 6 }, hallOfFame: [{ icon: "🏆", type: "Кубок лиги", league: "KAZ", season: "2023" }], refBlocked: false, lastActivity: Date.now() }
                ];
                this.saveGlobalClubs();
            }
            
            if (!localStorage.getItem(STORAGE_KEY + '_user_leagues')) {
                this.userLeagues = { "a@a.a": [1, 3], "b@b.b": [1, 2], "c@c.c": [2, 4], "d@d.d": [3, 5], "e@e.e": [4, 6] };
                this.saveUserLeagues();
            }
            
            if (!localStorage.getItem(STORAGE_KEY + '_club_chats')) {
                this.clubChats = {
                    'club_1': [
                        { from: "b@b.b", text: "Всем привет! Как настрой на матч?", timestamp: Date.now() - 3600000, type: 'text' },
                        { from: "a@a.a", text: "Отлично! Думаю победим сегодня.", timestamp: Date.now() - 3500000, type: 'text' },
                        { from: "c@c.c", text: "Я готов на 100% 💪", timestamp: Date.now() - 3400000, type: 'text' }
                    ],
                    'club_2': [
                        { from: "b@b.b", text: "Тренировка завтра в 18:00", timestamp: Date.now() - 7200000, type: 'text' },
                        { from: "f@f.f", text: "Буду!", timestamp: Date.now() - 7100000, type: 'text' }
                    ]
                };
                this.saveClubChats();
            }
            
            if (!localStorage.getItem(STORAGE_KEY + '_league_notifications')) {
                this.leagueNotifications = { 1: 2, 2: 3, 3: 1, 4: 2, 5: 1, 6: 3 };
                this.saveLeagueNotifications();
            }
            
            this.initLeagueParticipants();
        },
        
        initLeagueParticipants() {
            this.testLeagues.forEach(league => {
                const participants = [];
                const allEmails = Object.keys(this.usersDatabase);
                const count = league.members;
                for (let i = 0; i < count; i++) {
                    const email = allEmails[i % allEmails.length];
                    const userClubs = this.getUserClubs(email);
                    let role = 'member';
                    if (i === 0) role = 'owner';
                    else if (i === 1) role = 'admin';
                    participants.push({
                        email,
                        role,
                        clubId: userClubs.length > 0 ? userClubs[0].id : null,
                        online: Math.random() > 0.5
                    });
                }
                league.participants = participants;
            });
        }
    };
    
    window.AppData.init();
})();