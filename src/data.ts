export const SEED_QUESTIONS = [
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

export const PAST_QUESTIONS_SEED = [
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
    questionText: "A, B ve C birer pozitif tam sayı ve A < B < C'dir. A + B + C = 24 olduğuna göre, C'nin alabilecego en küçük değer kaçtır?",
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
