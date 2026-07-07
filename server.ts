import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database file setup
const DB_PATH = path.join(process.cwd(), "db.json");

interface DBStore {
  users: Array<{ id: string; username: string; email: string }>;
  sessions: Array<{
    id: string;
    userId: string;
    examMode: 'GYGK' | 'Mini' | 'Subject' | 'Personalized';
    category?: string;
    questions: any[];
    userAnswers: { [questionId: string]: string };
    score: number;
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    netScore: number;
    durationSpent: number;
    maxDuration: number;
    createdAt: string;
  }>;
  questionBank: any[];
  pastQuestions: any[];
  lastWeeklyUpdate?: string;
}

const SEED_QUESTIONS = [
  {
    id: "seed_1",
    category: "Türkçe",
    questionText: "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?",
    options: {
      A: "Herkes onun bu teklifini kabul edeceğini sanıyordu.",
      B: "Sınavdaki birtakım sorular adayları oldukça zorladı.",
      C: "Hafta sonu hep birlikte tarihi yarımadayı gezmeye gideceğiz.",
      D: "Meseleyi onunla baş başa konuşmanın daha doğru olduğunu anladım.",
      E: "Birçok öğrenci kütüphanede sessizce sınavlarına çalışıyordu."
    },
    correctAnswer: "A",
    explanation: "Cümlede geçen 'herkes' kelimesi 'herkes' şeklinde 's' ile yazılmalıdır; 'z' ile ('herkez') yazılması yazım hatasıdır.",
    subjectTag: "Yazım Kuralları"
  },
  {
    id: "seed_2",
    category: "Türkçe",
    questionText: "Aşağıdaki cümlelerin hangisinde anlatım bozukluğu vardır?",
    options: {
      A: "Yarın yapılacak olan toplantının iptal edildiği bildirildi.",
      B: "Öğrenciler dersi dikkatle dinliyor, not alıyorlardı.",
      C: "Büyük bir heyecanla içeri girdi ve müjdeyi bize fısıldadı.",
      D: "Sağlık ve tıp alanındaki gelişmeler her geçen gün artıyor.",
      E: "Kardeşimle birlikte okula her sabah otobüsle gidiyoruz."
    },
    correctAnswer: "C",
    explanation: "Fısıldamak eylemi sessizce yapılır, bu yüzden 'Büyük bir heyecanla içeri girdi' ile 'fısıldadı' arasında çelişki/mantık hatası veya 'heyecanla fısıldamak' ifadesinde bir uyumsuzluk vardır. Veya 'iptal edildiği bildirildi' gibi bir anlatım bozukluğu aranabilir. En bariz hata 'bize fısıldadı' ifadesinde bir dolaylı tümleç eksikliği veya heyecanlı fısıltı çelişkisidir.",
    subjectTag: "Anlatım Bozukluğu"
  },
  {
    id: "seed_3",
    category: "Matematik",
    questionText: "A ve B sıfırdan ve birbirinden farklı rakamlar olmak üzere, AB ve BA iki basamaklı sayılardır. AB + BA = 132 olduğuna göre, A + B toplamı kaçtır?",
    options: {
      A: "10",
      B: "11",
      C: "12",
      D: "13",
      E: "14"
    },
    correctAnswer: "C",
    explanation: "AB + BA = (10A + B) + (10B + A) = 11(A + B) = 132. Buradan A + B = 132 / 11 = 12 bulunur.",
    subjectTag: "Sayı Basamakları"
  },
  {
    id: "seed_4",
    category: "Matematik",
    questionText: "Bir sınıftaki kız öğrencilerin sayısı erkek öğrencilerin sayısının 3 katıdır. Sınıftan 4 kız öğrenci ayrılıp sınıfa 4 erkek öğrenci katıldığında kızların sayısı erkeklerin 2 katı olmaktadır. Buna göre başlangıçta sınıfta kaç öğrenci vardır?",
    options: {
      A: "24",
      B: "32",
      C: "36",
      D: "40",
      E: "48"
    },
    correctAnswer: "E",
    explanation: "Erkek sayısı = x, Kız sayısı = 3x olsun. Sınıftan 4 kız ayrılınca kız sayısı 3x - 4 olur. 4 erkek katılınca erkek sayısı x + 4 olur. Denklemi kurarsak: 3x - 4 = 2(x + 4) => 3x - 4 = 2x + 8 => x = 12. Başlangıçtaki toplam öğrenci sayısı = x + 3x = 4x = 48 olur.",
    subjectTag: "Sayı Problemleri"
  },
  {
    id: "seed_5",
    category: "Tarih",
    questionText: "Osmanlı Devleti'nde I. Meşrutiyet'in ilan edilmesinde ve Kanun-i Esasi'nin hazırlanmasında etkili olan aydın grup aşağıdakilerden hangisidir?",
    options: {
      A: "Jön Türkler (Genç Osmanlılar)",
      B: "İttihat ve Terakki Cemiyeti",
      C: "Ayanlar",
      D: "Islahat taraftarları",
      E: "Halaskaran-ı Zabitan"
    },
    correctAnswer: "A",
    explanation: "I. Meşrutiyet'in ilanında (1876) Genç Osmanlılar (Jön Türkler) etkili olmuştur. İttihat ve Terakki Cemiyeti ise II. Meşrutiyet'in (1908) ilanında başrol oynamıştır.",
    subjectTag: "Osmanlı Dağılma Dönemi"
  },
  {
    id: "seed_6",
    category: "Tarih",
    questionText: "Aşağıdakilerden hangisi 19. yüzyılda Osmanlı Devleti'nde açılan ve ilk sivil yüksekokul olma özelliği taşıyan eğitim kurumudur?",
    options: {
      A: "Hendese-i Mülkiye",
      B: "Mekteb-i Mülkiye",
      C: "Darülmuallimin",
      D: "Mekteb-i Maarif-i Adliye",
      E: "Darülfünun"
    },
    correctAnswer: "B",
    explanation: "Osmanlı Devleti'nde idari kadroları yetiştirmek amacıyla 1859 yılında açılan Mekteb-i Mülkiye, ilk sivil yüksekokul olma özelliğine sahiptir.",
    subjectTag: "Osmanlı Kültür ve Medeniyeti"
  },
  {
    id: "seed_7",
    category: "Coğrafya",
    questionText: "Türkiye'nin karstik göllerinin en yoğun bulunduğu coğrafi bölge aşağıdakilerden hangisidir?",
    options: {
      A: "Karadeniz Bölgesi",
      B: "Doğu Anadolu Bölgesi",
      C: "Akdeniz Bölgesi",
      D: "İç Anadolu Bölgesi",
      E: "Ege Bölgesi"
    },
    correctAnswer: "C",
    explanation: "Türkiye'de kalker, jips ve kaya tuzu gibi karstik eriyebilen kayaçların en yoğun bulunduğu Akdeniz Bölgesi (özellikle Göller Yöresi) karstik göller yönünden de en zengin bölgemizdir.",
    subjectTag: "Türkiye'nin Fiziki Özellikleri"
  },
  {
    id: "seed_8",
    category: "Coğrafya",
    questionText: "Türkiye'de doğu-batı yönlü ulaşımın, kuzey-güney yönlü ulaşıma göre daha gelişmiş ve kolay olmasının temel nedeni aşağıdakilerden hangisidir?",
    options: {
      A: "Dağların uzanış doğrultusu",
      B: "Akarsuların akış yönleri",
      C: "Karasal iklimin etkisi",
      D: "Tarım alanlarının dağılımı",
      E: "Nüfus yoğunluğunun dağılımı"
    },
    correctAnswer: "A",
    explanation: "Türkiye'de dağlar genellikle doğu-batı doğrultusunda uzandığından, doğal geçitler ve vadiler de bu yönde uzanır. Bu durum doğu-batı yönlü karayolu ve demiryolu ulaşımını kolaylaştırırken kuzey-güney yönünde geçitleri (Sertavul, Gülek vb.) zorunlu kılar.",
    subjectTag: "Türkiye'nin Beşeri ve Ekonomik Coğrafyası"
  },
  {
    id: "seed_9",
    category: "Vatandaşlık",
    questionText: "1982 Anayasası'na göre, Türkiye Büyük Millet Meclisi (TBMM) ve Cumhurbaşkanlığı seçimleri kaç yılda bir aynı gün yapılır?",
    options: {
      A: "3",
      B: "4",
      C: "5",
      D: "6",
      E: "7"
    },
    correctAnswer: "C",
    explanation: "2017 Anayasa değişiklikleriyle getirilen düzenlemeye göre TBMM ve Cumhurbaşkanlığı seçimleri 5 yılda bir aynı gün gerçekleştirilir.",
    subjectTag: "Anayasa Hukuku"
  },
  {
    id: "seed_10",
    category: "Vatandaşlık",
    questionText: "Hukukta, yetkili bir makam tarafından konulan ve yürürlükte olan yazılı hukuk kurallarının tümüne ne ad verilir?",
    options: {
      A: "Örf ve adet hukuku",
      B: "Pozitif (Müspet) hukuk",
      C: "Mevzu hukuk",
      D: "Tabii (Doğal) hukuk",
      E: "Tarihi hukuk"
    },
    correctAnswer: "C",
    explanation: "Mevzu hukuk (mevzuat), sadece yetkili organlarca konulan 'yazılı' kuralların bütünüdür. Yazılı ve yazısız kuralların tümüne ise pozitif hukuk denir.",
    subjectTag: "Hukukun Temel Kavramları"
  },
  {
    id: "seed_11",
    category: "Güncel Bilgiler",
    questionText: "Temmuz 2024'te SpaceX Falcon 9 roketi ile uzaya başarıyla fırlatılan, Türkiye'nin ilk yerli ve milli haberleşme uydusu aşağıdakilerden hangisidir?",
    options: {
      A: "Türksat 4A",
      B: "Türksat 5A",
      C: "Türksat 5B",
      D: "Türksat 6A",
      E: "Göktürk-2"
    },
    correctAnswer: "D",
    explanation: "Türkiye'nin ilk yerli ve milli haberleşme uydusu Türksat 6A, Temmuz 2024'te Florida'daki Cape Canaveral üssünden fırlatılmıştır.",
    subjectTag: "Türkiye ve Dünya Gündemi"
  },
  {
    id: "seed_12",
    category: "Güncel Bilgiler",
    questionText: "2024 yılında düzenlenen Paris Yaz Olimpiyat Oyunları'nda, atış esnasında koruyucu ekipman kullanmadan eli cebinde yaptığı atışla dünya çapında viral olan ve gümüş madalya kazanan milli sporcumuz aşağıdakilerden hangisidir?",
    options: {
      A: "Yusuf Dikeç",
      B: "Mete Gazoz",
      C: "Taha Akgül",
      D: "Şevval İlayda Tarhan",
      E: "Rıza Kayaalp"
    },
    correctAnswer: "A",
    explanation: "Milli atıcımız Yusuf Dikeç, Paris 2024 Olimpiyatları'nda 10 metre havalı tabanca karma takım kategorisinde Şevval İlayda Tarhan ile birlikte gümüş madalya kazanırken rahat tarzıyla dünya gündemine oturmuştur.",
    subjectTag: "Spor Gelişmeleri"
  }
];

const PAST_QUESTIONS_SEED = [
  {
    id: "past_1",
    category: "Tarih",
    subjectTag: "Osmanlı Devleti",
    year: 2023,
    questionText: "Osmanlı Devleti'nde tımarlı sipahilerin yetiştirmekle yükümlü olduğu, barış zamanı tarım üretimi yapan, savaş zamanı ise orduya katılan atlı askerlere ne ad verilir?",
    options: {
      A: "Cebelü",
      B: "Lağımcı",
      C: "Müsellem",
      D: "Sekban",
      E: "Levent"
    },
    correctAnswer: "A",
    explanation: "Tımar sisteminde dirlik sahiplerinin gelirlerinin her 3 bin akçesi (veya has ve zeamette her 5 bin akçesi) için beslemek zorunda olduğu tam teçhizatlı atlı askere 'cebelü' adı verilir."
  },
  {
    id: "past_2",
    category: "Matematik",
    subjectTag: "Sayılar",
    year: 2024,
    questionText: "A, B ve C birer pozitif tam sayı ve A < B < C'dir. A + B + C = 24 olduğuna göre, C'nin alabileceği en küçük değer kaçtır?",
    options: {
      A: "7",
      B: "8",
      C: "9",
      D: "10",
      E: "11"
    },
    correctAnswer: "C",
    explanation: "A, B, C pozitif tam sayılar ve A < B < C'dir. C'nin en küçük olması için sayıların birbirine en yakın olması gerekir. 24 / 3 = 8 olduğundan, sayılar ardışık gibi seçilirse: A = 7, B = 8, C = 9 olur. Bu durumda C'nin en küçük değeri 9'dur."
  },
  {
    id: "past_3",
    category: "Coğrafya",
    subjectTag: "Türkiye'nin Yerşekilleri",
    year: 2022,
    questionText: "Türkiye'de bulunan aşağıdaki dağlardan hangisi oluşum yönüyle volkanik dağlar arasında yer almaz?",
    options: {
      A: "Nemrut Dağı",
      B: "Erciyes Dağı",
      C: "Süphan Dağı",
      D: "Karadağ",
      E: "Yıldız Dağları"
    },
    correctAnswer: "E",
    explanation: "Yıldız (Istranca) Dağları, Marmara Bölgesi'nde yer alan kıvrımlı (orojenik) dağ sırasıdır. Erciyes, Nemrut, Süphan ve Karadağ ise volkanik dağlardır."
  },
  {
    id: "past_4",
    category: "Vatandaşlık",
    subjectTag: "Temel Hukuk",
    year: 2023,
    questionText: "Hukuken kişinin borç ve haklara sahip olabilme yeteneğine ne ad verilir?",
    options: {
      A: "Fiil ehliyeti",
      B: "Hak ehliyeti",
      C: "Sorumluluk ehliyeti",
      D: "Sınırlı ehliyetlilik",
      E: "Rüşt"
    },
    correctAnswer: "B",
    explanation: "Hak ehliyeti, haklara ve borçlara sahip olabilme yeteneğidir. Türk Medeni Kanunu'na göre hak ehliyeti, sağ ve tam doğmak şartıyla ana rahmine düşüldüğü andan itibaren başlar."
  },
  {
    id: "past_5",
    category: "Tarih",
    subjectTag: "Kurtuluş Savaşı",
    year: 2021,
    questionText: "Mustafa Kemal Paşa'nın 'Siz orada yalnız düşmanı değil, milletin makûs talihini de yendiniz.' telgrafını göndererek tebrik ettiği komutan ve askeri başarı aşağıdakilerden hangisidir?",
    options: {
      A: "Kazım Karabekir - Gümrü Zaferi",
      B: "Fevzi Çakmak - Sakarya Meydan Muharebesi",
      C: "İsmet İnönü - II. İnönü Muharebesi",
      D: "Mustafa Kemal - Başkomutanlık Meydan Muharebesi",
      E: "Refet Bele - Aslıhanlar Taarruzu"
    },
    correctAnswer: "C",
    explanation: "Mustafa Kemal Paşa, II. İnönü Muharebesi'nin kazanılmasından sonra cephe komutanı İsmet Paşa'ya gönderdiği telgrafta bu tarihi sözü söylemiştir."
  },
  {
    id: "past_6",
    category: "Matematik",
    subjectTag: "Problemler",
    year: 2023,
    questionText: "Bir su deposunun 3/7'si su ile doludur. Depoya 12 litre daha su eklendiğinde deponun yarısı dolduğuna göre, deponun tamamı kaç litre su alır?",
    options: {
      A: "140",
      B: "154",
      C: "168",
      D: "182",
      E: "196"
    },
    correctAnswer: "C",
    explanation: "Deponun tamamı x litre olsun. 3x/7 + 12 = x/2. Paydaları 14'te eşitlersek: 6x/14 + 168/14 = 7x/14 => x = 168 litre bulunur."
  },
  {
    id: "past_7",
    category: "Türkçe",
    subjectTag: "Sözcükte Yapı",
    year: 2024,
    questionText: "Aşağıdaki cümlelerin hangisinde altı çizili sözcük, işlevi bakımından diğerlerinden farklı bir yapım eki almıştır?",
    options: {
      A: "Onun bu davranışı herkesi şaşırttı.",
      B: "Yazarın son yapıtı büyük ilgi gördü.",
      C: "Çocuğun bakışı her şeyi anlatıyordu.",
      D: "Bu giriş kapısı her zaman kilitlidir.",
      E: "Sınıfın başarısı öğretmenini gururlandırdı."
    },
    correctAnswer: "B",
    explanation: "Yapıt kelimesindeki '-ıt' eki fiilden isim yapım ekiidir. Diğer kelimelerdeki '-ış/-iş' ekleri ise isim-fiil ekidir (fiilden isim yapım eki olmalarına rağmen işlevsel olarak eylemsi eki olarak ayrılır)."
  },
  {
    id: "past_8",
    category: "Vatandaşlık",
    subjectTag: "Anayasa Hukuku",
    year: 2022,
    questionText: "1982 Anayasası'na göre, aşağıdakilerden hangisi Cumhurbaşkanının görev ve yetkileri arasında yer almaz?",
    options: {
      A: "Kanunları yayımlamak",
      B: "Anayasa değişikliklerine ilişkin kanunları gerekli gördüğü takdirde halkoyuna sunmak",
      C: "Cumhurbaşkanı yardımcıları ile bakanları atamak ve görevlerine son vermek",
      D: "TBMM adına Silahlı Kuvvetlerin Başkomutanlığını temsil etmek",
      E: "Kanun hükmünde kararname (KHK) çıkarmak"
    },
    correctAnswer: "E",
    explanation: "2017 Anayasa değişiklikleriyle Bakanlar Kurulu kaldırılmış, tüzükler ve Kanun Hükmünde Kararnameler (KHK) tamamen hukuk sistemimizden çıkarılmıştır. Bunun yerine Cumhurbaşkanlığı Kararnamesi getirilmiştir."
  },
  {
    id: "past_9",
    category: "Coğrafya",
    subjectTag: "Türkiye'nin İklimi",
    year: 2023,
    questionText: "Türkiye'de Akdeniz ikliminin etkili olduğu alanlarda görülen, kuraklığa dayanıklı, sert yapraklı, bodur ağaç ve çalılardan oluşan bitki örtüsü aşağıdakilerden hangisidir?",
    options: {
      A: "Bozkır (Step)",
      B: "Maki",
      C: "Tundra",
      D: "Savan",
      E: "Garig"
    },
    correctAnswer: "B",
    explanation: "Akdeniz iklim kuşağının tipik bitki örtüsü kızılçam ormanlarının tahrip edilmesiyle ortaya çıkan maki adı verilen her mevsim yeşil kalabilen, sert yapraklı bodur çalı topluluğudur."
  }
];

const defaultDB: DBStore = {
  users: [],
  sessions: [],
  questionBank: [],
  pastQuestions: [],
};

function readDB(): DBStore {
  try {
    let db: DBStore;
    if (!fs.existsSync(DB_PATH)) {
      db = { ...defaultDB };
      db.questionBank = [...SEED_QUESTIONS];
      db.pastQuestions = [...PAST_QUESTIONS_SEED];
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
      return db;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    db = JSON.parse(data) as DBStore;
    
    // Ensure lists are initialized
    let changed = false;
    if (!db.questionBank || db.questionBank.length === 0) {
      db.questionBank = [...SEED_QUESTIONS];
      changed = true;
    }
    if (!db.pastQuestions || db.pastQuestions.length === 0) {
      db.pastQuestions = [...PAST_QUESTIONS_SEED];
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    }
    return db;
  } catch (error) {
    console.error("Error reading database file, using in-memory default", error);
    return {
      ...defaultDB,
      questionBank: [...SEED_QUESTIONS],
      pastQuestions: [...PAST_QUESTIONS_SEED]
    };
  }
}

function writeDB(data: DBStore) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file", error);
  }
}

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined in the environment. AI-powered features will be unavailable.");
}

// Helper to get questions
function getSeededQuestions(count: number = 10, category?: string) {
  let list = [...SEED_QUESTIONS];
  if (category && category !== "Tümü") {
    list = list.filter(q => q.category === category);
  }
  // Shuffle list
  list.sort(() => 0.5 - Math.random());
  return list.slice(0, count);
}

// REGISTER ENDPOINT
app.post("/api/auth/register", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Ad Soyad alanı zorunludur." });
  }
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: "Ad Soyad en az 3 karakter olmalıdır." });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Bu Ad Soyad zaten kayıtlı." });
  }

  const newUser = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    username: cleanUsername,
    email: "",
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json(newUser);
});

// LOGIN ENDPOINT
app.post("/api/auth/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Ad Soyad alanı zorunludur." });
  }
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: "Ad Soyad en az 3 karakter olmalıdır." });
  }

  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

  if (!user) {
    // Auto-register to keep it extremely simple and smooth
    const newUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      username: cleanUsername,
      email: "",
    };
    db.users.push(newUser);
    writeDB(db);
    return res.json({ user: newUser, message: "Yeni profiliniz oluşturuldu ve giriş yapıldı!" });
  }

  res.json({ user, message: "Başarıyla giriş yapıldı!" });
});

// PROFILE ENDPOINT
app.get("/api/auth/profile", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Giriş yapılması gerekiyor." });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  res.json(user);
});

// Dynamic helper to get questions from DB question bank
function getQuestionsFromBank(count: number = 10, category?: string) {
  const db = readDB();
  let list = db.questionBank && db.questionBank.length > 0 ? [...db.questionBank] : [...SEED_QUESTIONS];
  if (category && category !== "Tümü") {
    list = list.filter(q => q.category === category);
  }
  // Shuffle list
  list.sort(() => 0.5 - Math.random());
  return list.slice(0, count);
}

// QUESTIONS ENDPOINT (Served from dynamic DB question bank)
app.get("/api/questions", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;
  res.json(getQuestionsFromBank(limit, category));
});

// DYNAMIC AI QUESTION GENERATION WITH GEMINI
app.post("/api/questions/generate", async (req, res) => {
  const { category, count, year, personalized } = req.body;
  const userId = req.headers["x-user-id"] as string;
  const countNum = parseInt(count) || 5;
  const selectedCategory = category || "Tümü";

  if (!ai) {
    console.log("Gemini is not initialized. Falling back to local questions.");
    return res.json(getQuestionsFromBank(countNum, selectedCategory));
  }

  try {
    let categoryPrompt = "";
    if (selectedCategory && selectedCategory !== "Tümü") {
      categoryPrompt = `specifically in the '${selectedCategory}' category.`;
    } else {
      categoryPrompt = `randomly distributed among 'Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık', and 'Güncel Bilgiler'.`;
    }

    let weakSubjectsPrompt = "";
    if (personalized && userId) {
      const db = readDB();
      const userSessions = db.sessions.filter(s => s.userId === userId);
      if (userSessions.length > 0) {
        const wrongQuestionsMap: { [subjectTag: string]: { wrongCount: number, totalCount: number, category: string } } = {};
        userSessions.forEach(session => {
          session.questions.forEach(q => {
            const uAns = session.userAnswers[q.id];
            const isWrong = uAns && uAns !== "" && uAns !== q.correctAnswer;
            const tag = q.subjectTag || "Genel Konu";
            const cat = q.category || "Genel";

            if (!wrongQuestionsMap[tag]) {
              wrongQuestionsMap[tag] = { wrongCount: 0, totalCount: 0, category: cat };
            }
            wrongQuestionsMap[tag].totalCount++;
            if (isWrong) {
              wrongQuestionsMap[tag].wrongCount++;
            }
          });
        });

        const weakList = Object.keys(wrongQuestionsMap)
          .map(tag => ({
            subjectTag: tag,
            category: wrongQuestionsMap[tag].category,
            wrongCount: wrongQuestionsMap[tag].wrongCount,
            total: wrongQuestionsMap[tag].totalCount,
            rate: Math.round((wrongQuestionsMap[tag].wrongCount / wrongQuestionsMap[tag].totalCount) * 100)
          }))
          .filter(item => item.wrongCount > 0)
          .sort((a, b) => b.rate - a.rate);

        if (weakList.length > 0) {
          const topWeak = weakList.slice(0, 3).map(w => `${w.category} dersinin '${w.subjectTag}' konusu (Hata sayısı: ${w.wrongCount})`).join(", ");
          weakSubjectsPrompt = `\nCRITICAL PERSONALIZATION OPTIMIZATION: This student is struggling with the following subjects based on their historical test performance: ${topWeak}. You MUST generate highly targeted and standard questions explicitly focusing on these subjects (or sub-topics closely related to them) so that the candidate can practice on their weaknesses and improve their results. Ensure questions are identical to the difficulty of actual ÖSYM KPSS exams.`;
        }
      }
    }

    const systemInstruction = `You are an expert KPSS (Kamu Personeli Seçme Sınavı) preparation tutor.
Your task is to generate realistic, high-quality, multiple-choice questions in Turkish for the KPSS exam.
Each question MUST have exactly 5 options (A, B, C, D, E) and follow standard KPSS formatting.
If asked for 'Güncel Bilgiler' (Current Events), incorporate real news, events, discoveries, agreements, or geopolitical facts from 2024, 2025, or 2026. Use Google Search grounding if needed to fetch highly accurate recent current events from Turkey and the world.
Keep the language academic and identical to actual ÖSYM (Öğrenci Seçme ve Yerleştirme Merkezi) KPSS exams.

Your response MUST be a JSON array containing objects matching this TypeScript schema:
interface Question {
  category: 'Türkçe' | 'Matematik' | 'Tarih' | 'Coğrafya' | 'Vatandaşlık' | 'Güncel Bilgiler';
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  subjectTag: string; // Detail subject sub-tag e.g., "Atatürk Dönemi Dış Politika", "Sözcükte Yapı", "Rasyonel Sayılar", "Türkiye'nin Platoları", "Anayasa Tarihi", "Kültürel Gelişmeler"
}
Make sure all keys in "options" are exactly "A", "B", "C", "D", "E". CorrectAnswer must match one of these exactly.`;

    const prompt = `Generate exactly ${countNum} unique, high-quality KPSS multiple-choice exam questions ${categoryPrompt}.${weakSubjectsPrompt}
Make sure they are highly educational, representing core curriculum subjects or interesting current events. Do not repeat questions.`;

    console.log(`Generating ${countNum} questions using Gemini for category: ${selectedCategory} (Personalized: ${!!weakSubjectsPrompt})...`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        // Combine Google search if the category is Current Events or similar
        tools: selectedCategory === "Güncel Bilgiler" || selectedCategory === "Tümü" ? [{ googleSearch: {} }] : [],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                  E: { type: Type.STRING }
                },
                required: ["A", "B", "C", "D", "E"]
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              subjectTag: { type: Type.STRING }
            },
            required: ["category", "questionText", "options", "correctAnswer", "explanation", "subjectTag"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No output text from Gemini");
    }

    const questionsList = JSON.parse(textOutput.trim());
    
    // Assign random unique IDs
    const questionsWithIds = questionsList.map((q: any, index: number) => ({
      ...q,
      id: "ai_" + Math.random().toString(36).substr(2, 9) + "_" + index,
      isAI: true
    }));

    res.json(questionsWithIds);
  } catch (error) {
    console.error("Gemini question generation error", error);
    // Fallback to dynamic questions from DB bank
    console.log("Falling back to local question bank due to error.");
    res.json(getQuestionsFromBank(countNum, selectedCategory));
  }
});

// GET PAST QUESTIONS (Past Exam Library)
app.get("/api/past-questions", (req, res) => {
  const category = req.query.category as string;
  const subjectTag = req.query.subjectTag as string;
  const year = req.query.year as string;

  const db = readDB();
  let list = db.pastQuestions || [];

  if (category && category !== "Tümü") {
    list = list.filter(q => q.category === category);
  }
  if (subjectTag && subjectTag !== "Tümü") {
    list = list.filter(q => q.subjectTag === subjectTag);
  }
  if (year && year !== "Tümü") {
    list = list.filter(q => q.year?.toString() === year);
  }

  res.json(list);
});

// GET PAST QUESTIONS METADATA (for filtering)
app.get("/api/past-questions/metadata", (req, res) => {
  const db = readDB();
  const list = db.pastQuestions || [];

  const categories = Array.from(new Set(list.map(q => q.category)));
  const subjectTags = Array.from(new Set(list.map(q => q.subjectTag)));
  const years = Array.from(new Set(list.map(q => q.year).filter(Boolean)));

  res.json({
    categories,
    subjectTags,
    years
  });
});

// WEEKLY UPDATER ALGORITHM
async function checkAndApplyWeeklyUpdates() {
  const db = readDB();
  const now = new Date();
  let runUpdate = false;

  if (!db.lastWeeklyUpdate) {
    runUpdate = true;
  } else {
    const lastUpdateDate = new Date(db.lastWeeklyUpdate);
    const diffTime = Math.abs(now.getTime() - lastUpdateDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 7) {
      runUpdate = true;
    }
  }

  // Also ensure we have some weekly updates seeded initially
  const hasWeeklyOnes = db.questionBank.some(q => q.isWeeklyUpdate);
  if (!hasWeeklyOnes) {
    runUpdate = true;
  }

  if (runUpdate) {
    console.log("Running weekly current affairs question update using Gemini...");
    if (ai) {
      try {
        const systemInstruction = `You are an expert KPSS preparation tutor.
Your task is to generate exactly 5 brand-new, highly realistic multiple-choice questions in Turkish for the 'Güncel Bilgiler' section of the KPSS exam.
These questions must be based on actual, accurate world and Turkish developments from late 2025 or 2026. Use Google Search grounding to verify real-world facts, new laws, space projects, scientific achievements, discoveries, international summits, or sports/cultural events from recent weeks.
Each question must have exactly 5 options (A, B, C, D, E) and follow standard KPSS format.
Format the output as a JSON array with objects matching this TypeScript schema:
interface Question {
  category: 'Güncel Bilgiler';
  questionText: string;
  options: { A: string; B: string; C: string; D: string; E: string; };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  subjectTag: string;
}
Do not return markdown except the JSON array.`;

        const prompt = "Generate 5 high-quality, authentic KPSS current events (Güncel Bilgiler) questions based on real-world news and developments from 2025 and 2026. Verify facts using search.";
        
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.OBJECT,
                    properties: {
                      A: { type: Type.STRING },
                      B: { type: Type.STRING },
                      C: { type: Type.STRING },
                      D: { type: Type.STRING },
                      E: { type: Type.STRING }
                    },
                    required: ["A", "B", "C", "D", "E"]
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  subjectTag: { type: Type.STRING }
                },
                required: ["category", "questionText", "options", "correctAnswer", "explanation", "subjectTag"]
              }
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const newQuestions = JSON.parse(textOutput.trim());
          const questionsWithIds = newQuestions.map((q: any, idx: number) => ({
            ...q,
            id: "weekly_cur_" + Date.now() + "_" + idx,
            category: "Güncel Bilgiler",
            isWeeklyUpdate: true
          }));
          
          db.questionBank.push(...questionsWithIds);
          console.log(`Successfully added ${questionsWithIds.length} new weekly current events questions.`);
        }
      } catch (err) {
        console.error("Failed to fetch weekly current events from Gemini. Using high-quality seeded fallbacks.", err);
        // Fallback seeded current events
        const fallbacks = [
          {
            id: "weekly_cur_fallback_" + Date.now() + "_1",
            category: "Güncel Bilgiler",
            questionText: "Nisan 2026'da gerçekleşen ve yapay zeka güvenliği alanında küresel standartların belirlendiği 'Yapay Zeka Küresel Güvenlik Zirvesi' (AI Safety Summit) aşağıdaki şehirlerin hangisinde düzenlenmiştir?",
            options: {
              A: "Londra",
              B: "Cenevre",
              C: "New York",
              D: "Tokyo",
              E: "Seul"
            },
            correctAnswer: "E",
            explanation: "2026'nın önemli uluslararası teknoloji ve güvenlik zirvelerinden olan Yapay Zeka Küresel Güvenlik Zirvesi, Seul'de (Güney Kore) gerçekleştirilmiş ve küresel liderlerce yapay zekanın kontrolü ele alınmıştır.",
            subjectTag: "Uluslararası Zirveler",
            isWeeklyUpdate: true
          },
          {
            id: "weekly_cur_fallback_" + Date.now() + "_2",
            category: "Güncel Bilgiler",
            questionText: "2026 yılı itibarıyla Birleşmiş Milletler Eğitim, Bilim ve Kültür Örgütü (UNESCO) tarafından 'Dünya Kitap Başkenti' ilan edilen şehir aşağıdakilerden hangisidir?",
            options: {
              A: "Strasbourg",
              B: "Rio de Janeiro",
              C: "Riyad",
              D: "Barselona",
              E: "Tiflis"
            },
            correctAnswer: "B",
            explanation: "UNESCO, 2026 yılı için Rio de Janeiro (Brezilya) şehrini Dünya Kitap Başkenti olarak belirlemiştir.",
            subjectTag: "Kültürel Gelişmeler",
            isWeeklyUpdate: true
          }
        ];
        db.questionBank.push(...fallbacks);
      }
    } else {
      // Local fallbacks if AI not defined
      const fallbacks = [
        {
          id: "weekly_cur_fallback_" + Date.now() + "_3",
          category: "Güncel Bilgiler",
          questionText: "2025-2026 yılı Kültür ve Turizm Bakanlığı verilerine göre, Türkiye'nin son tescillenen millî parkı aşağıdakilerden hangisidir?",
          options: {
            A: "Derebucak Çamlık Mağaraları Millî Parkı",
            B: "Abant Gölü Millî Parkı",
            C: "Sarıkamış Allahuekber Dağları Millî Parkı",
            D: "Cilo ve Sat Dağları Millî Parkı",
            E: "Kop Dağı Müdafaası Tarihî Millî Parkı"
          },
          correctAnswer: "B",
          explanation: "Bolu ili sınırları içerisinde bulunan ünlü doğa harikası Abant Gölü, son dönemde alınan kararla Türkiye'nin yeni millî parkları arasına dâhil edilmiştir.",
          subjectTag: "Türkiye Coğrafyası ve Millî Parklar",
          isWeeklyUpdate: true
        }
      ];
      db.questionBank.push(...fallbacks);
    }

    db.lastWeeklyUpdate = now.toISOString();
    writeDB(db);
  }
}

// SAVE EXAM SESSION
app.post("/api/sessions/save", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Giriş yapılması gerekiyor." });
  }

  const { examMode, category, questions, userAnswers, durationSpent, maxDuration } = req.body;

  if (!questions || !userAnswers) {
    return res.status(400).json({ error: "Sınav verileri eksik." });
  }

  // Calculate KPSS metrics
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;

  questions.forEach((q: any) => {
    const ans = userAnswers[q.id];
    if (!ans) {
      emptyCount++;
    } else if (ans === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  // KPSS Calculation: 4 wrong answers cancel 1 correct answer (net score)
  const netScore = correctCount - (wrongCount / 4);
  // Standardized Score (e.g., out of 100 based on scale)
  const score = Math.max(0, parseFloat(((netScore / questions.length) * 100).toFixed(2)));

  const session = {
    id: "session_" + Math.random().toString(36).substr(2, 9),
    userId,
    examMode,
    category,
    questions,
    userAnswers,
    score,
    correctCount,
    wrongCount,
    emptyCount,
    netScore: parseFloat(netScore.toFixed(2)),
    durationSpent,
    maxDuration,
    createdAt: new Date().toISOString()
  };

  const db = readDB();
  db.sessions.push(session);
  writeDB(db);

  res.status(201).json(session);
});

// GET USER SESSIONS HISTORY
app.get("/api/sessions", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Giriş yapılması gerekiyor." });
  }

  const db = readDB();
  const userSessions = db.sessions
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userSessions);
});

// ANALYZE INCORRECT ANSWERS & STUDY PLAN WITH GEMINI
app.post("/api/analysis/report", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Giriş yapılması gerekiyor." });
  }

  const db = readDB();
  const userSessions = db.sessions.filter(s => s.userId === userId);

  if (userSessions.length === 0) {
    return res.status(400).json({ error: "Analiz yapılabilecek tamamlanmış sınav bulunamadı." });
  }

  // Extract all wrong answers and their subjects
  const wrongQuestionsMap: { [subjectTag: string]: { wrongCount: number, totalCount: number, category: string, questionsSample: string[] } } = {};

  userSessions.forEach(session => {
    session.questions.forEach(q => {
      const uAns = session.userAnswers[q.id];
      const isWrong = uAns && uAns !== "" && uAns !== q.correctAnswer;
      const isTested = uAns !== undefined;

      const tag = q.subjectTag || "Genel Konu";
      const cat = q.category || "Genel Yetenek";

      if (!wrongQuestionsMap[tag]) {
        wrongQuestionsMap[tag] = { wrongCount: 0, totalCount: 0, category: cat, questionsSample: [] };
      }

      wrongQuestionsMap[tag].totalCount++;
      if (isWrong) {
        wrongQuestionsMap[tag].wrongCount++;
        if (wrongQuestionsMap[tag].questionsSample.length < 2) {
          wrongQuestionsMap[tag].questionsSample.push(q.questionText);
        }
      }
    });
  });

  // Format weak subjects array
  const weakSubjectsList = Object.keys(wrongQuestionsMap)
    .map(tag => {
      const item = wrongQuestionsMap[tag];
      return {
        subjectTag: tag,
        category: item.category,
        wrongCount: item.wrongCount,
        totalQuestions: item.totalCount,
        percentageWrong: item.totalCount > 0 ? Math.round((item.wrongCount / item.totalCount) * 100) : 0
      };
    })
    .filter(item => item.wrongCount > 0) // only include subjects where user had errors
    .sort((a, b) => b.wrongCount - a.wrongCount);

  if (!ai) {
    console.log("Gemini not available. Generating a simplified local report.");
    // Fallback static report
    const report = {
      overallSummary: "Şu ana kadarki deneme sonuçlarınıza göre eksik olduğunuz konular tespit edilmiştir. Düzenli konu tekrarları ve bol soru çözümüyle başarı grafiğinizi yükseltebilirsiniz.",
      weakSubjects: weakSubjectsList.slice(0, 5),
      studyPlan: weakSubjectsList.slice(0, 3).map(ws => ({
        subject: ws.subjectTag,
        category: ws.category,
        importance: ws.wrongCount > 2 ? "Yüksek" : "Orta",
        advice: `${ws.subjectTag} konusunda ${ws.wrongCount} adet yanlış yaptınız. Bu konudaki temel kavramları gözden geçirmeli ve her gün en az 20 adet pekiştirme sorusu çözmelisiniz.`,
        keyPoints: ["Temel kavramların tekrar edilmesi", "ÖSYM'nin çıkmış sorularının incelenmesi", "Konu tarama testlerinin çözülmesi"]
      })),
      generatedAt: new Date().toISOString()
    };
    return res.json(report);
  }

  try {
    const analysisPrompt = `Aşağıda, bir KPSS adayının çözdüğü deneme sınavlarında yanlış yaptığı konuların listesi ve detayları verilmiştir:
${JSON.stringify(weakSubjectsList.slice(0, 10), null, 2)}

Bu adayın hatalarını derinlemesine analiz et ve ona özel, Türkçe dilinde son derece motivasyonel, yol gösterici ve nokta atışı bir analiz raporu sun. Raporu kesinlikle JSON formatında döndür.

Döndüreceğin JSON şeması tam olarak şu şekilde olmalıdır:
{
  "overallSummary": "Adayın genel durumu, güçlü yönleri ve en çok odaklanması gereken alanlar hakkında detaylı, samimi, teşvik edici bir öğretmen değerlendirmesi (en az 4-5 cümle).",
  "weakSubjects": [ // En çok hata yapılan ve acil müdahale gereken konular listesi (gönderilen listedeki verilerle uyumlu)
    {
      "subjectTag": "Konu Başlığı",
      "category": "Ders Kategorisi (örn: Tarih)",
      "wrongCount": 3,
      "totalQuestions": 5,
      "percentageWrong": 60
    }
  ],
  "studyPlan": [ // Yanlış yapılan en kritik konular için özel ders çalışma planı tavsiyeleri
    {
      "subject": "Hatalı Konu Adı",
      "category": "Ders Kategorisi",
      "importance": "Yüksek" veya "Orta",
      "advice": "Bu konuyu çalışırken adayın neye dikkat etmesi gerektiği, hangi kaynaklara yönelmesi gerektiği ve pratik yapma stratejisi hakkında özel, detaylı tavsiye.",
      "keyPoints": [ // Konuyu anlamak için çalışılması gereken 3 kritik alt başlık veya püf noktası
        "Önemli nokta 1",
        "Önemli nokta 2",
        "Önemli nokta 3"
      ]
    }
  ]
}`;

    console.log("Analyzing user performance with Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
      config: {
        systemInstruction: "Sen profesyonel bir KPSS eğitim koçusun. Adayın yanlış cevap istatistiklerine bakarak ona moral veren, eksik konularını nokta atışı tespit eden ve özel çalışma tavsiyeleri veren yapılandırılmış Türkçe bir analiz raporu hazırla.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING },
            weakSubjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subjectTag: { type: Type.STRING },
                  category: { type: Type.STRING },
                  wrongCount: { type: Type.INTEGER },
                  totalQuestions: { type: Type.INTEGER },
                  percentageWrong: { type: Type.INTEGER }
                },
                required: ["subjectTag", "category", "wrongCount", "totalQuestions", "percentageWrong"]
              }
            },
            studyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  category: { type: Type.STRING },
                  importance: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["subject", "category", "importance", "advice", "keyPoints"]
              }
            }
          },
          required: ["overallSummary", "weakSubjects", "studyPlan"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No analysis text generated from Gemini");
    }

    const reportData = JSON.parse(reportText.trim());
    res.json({
      ...reportData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Gemini analysis error, sending static fallback report:", error);
    const fallbackReport = {
      overallSummary: "Sınav sonuçlarınıza göre eksik olduğunuz konular listelenmiştir. Düzenli konu tekrarları ve bol soru çözümüyle başarı grafiğinizi yükseltebilirsiniz.",
      weakSubjects: weakSubjectsList.slice(0, 5),
      studyPlan: weakSubjectsList.slice(0, 3).map(ws => ({
        subject: ws.subjectTag,
        category: ws.category,
        importance: ws.wrongCount > 1 ? "Yüksek" : "Orta",
        advice: `${ws.subjectTag} konusundaki yanlışlarınızı gidermek için temel konu anlatım videolarını izlemeli, çıkmış KPSS sorularını analiz etmeli ve test kitaplarındaki tarama testlerini tamamlamalısınız.`,
        keyPoints: ["Temel kavramların üzerinden geçilmesi", "ÖSYM tarzı soruların çözümü", "Konu pekiştirme denemeleri"]
      })),
      generatedAt: new Date().toISOString()
    };
    res.json(fallbackReport);
  }
});

// START EXPRESS SERVER WITH VITE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    // Check and trigger weekly updates on startup
    checkAndApplyWeeklyUpdates().catch(err => console.error("Error running weekly update check on startup:", err));
  });
}

startServer();
