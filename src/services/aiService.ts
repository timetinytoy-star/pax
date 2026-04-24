import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { GameState, Nation } from '../game/types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function withRetry<T>(fn: (model: string) => Promise<T>, retries = 3, delay = 5000, currentModel = 'gemini-2.5-flash'): Promise<T> {
  try {
    return await fn(currentModel);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('quota');
    
    // If we hit a quota limit on 2.5-flash, try falling back to 1.5-flash immediately
    if (isRateLimit && currentModel === 'gemini-2.5-flash') {
      console.warn(`Quota limit hit for gemini-2.5-flash, falling back to gemini-1.5-flash...`);
      return withRetry(fn, retries, delay, 'gemini-1.5-flash');
    }

    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit for ${currentModel}, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5, currentModel);
    }
    throw error;
  }
}

const declarationMakePeace: FunctionDeclaration = {
  name: 'make_peace',
  description: 'Savaşı bitirir ve barış yapar.',
};

const declarationDeclareWar: FunctionDeclaration = {
  name: 'declare_war',
  description: 'Savaş ilan eder.',
};

const declarationTradeGold: FunctionDeclaration = {
  name: 'trade_gold',
  description: 'Altın ticareti yapar.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: "Verilecek altın miktarı (pozitif ise sen oyuncuya verirsin, negatif ise oyuncudan istersin)" }
    },
    required: ["amount"]
  }
};

export async function chatWithNationAI(
  player: Nation,
  target: Nation,
  message: string,
  history: { role: 'user' | 'model', text: string }[]
) {
  const prompt = `Sen ${target.name} ülkesinin liderisin. Oyuncu (${player.name} lideri) seninle diplomatik bir görüşme yapıyor.
  Oyun MODERN ÇAĞ'da (2026 yılı) geçmektedir. Antik çağ, orta çağ veya fantastik öğeler KULLANMA. Uçaklar, tanklar, füzeler, modern diplomasi, siber güvenlik, modern ekonomi geçerlidir.
  Senin Durumun: Ordu: ${target.army}, Altın: ${target.gold}, İnsan Gücü: ${target.manpower}
  Oyuncunun Durumu: Ordu: ${player.army}, Altın: ${player.gold}
  Aranızdaki İlişki: ${target.relations[player.id] || 0} (-100 ile 100 arası)
  Savaşta mısınız?: ${target.atWarWith.includes(player.id) ? 'Evet' : 'Hayır'}
  
  Karakterine uygun, diplomatik, kibirli veya dostane modern çağ lideri gibi cevaplar ver.
  Eğer oyuncu barış teklif ederse ve mantıklıysa 'make_peace' aracını kullan.
  Eğer oyuncu seni tehdit ederse ve güçlüysen 'declare_war' aracını kullan.
  Eğer altın ticareti veya haraç söz konusuysa 'trade_gold' aracını kullan.
  `;

  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  formattedHistory.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: formattedHistory,
      config: {
        systemInstruction: prompt,
        tools: [{ functionDeclarations: [declarationMakePeace, declarationDeclareWar, declarationTradeGold] }]
      }
    }));

    const functionCalls = response.functionCalls;
    let toolCalls: { name: string, args: any }[] = [];
    if (functionCalls) {
      toolCalls = functionCalls.map(fc => ({
        name: fc.name,
        args: fc.args
      }));
    }

    return {
      text: response.text || '',
      toolCalls
    };
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI Chat Quota Exceeded:", error.message || error);
    } else {
      console.error("AI Chat Error:", error);
    }
    return { text: isRateLimit ? "Elçilerimiz yolda kayboldu (Yapay zeka kotası aşıldı). Lütfen biraz bekleyin." : "Elçilerimiz yolda kayboldu. İletişim kurulamıyor.", toolCalls: [] };
  }
}

export async function evaluatePlayerAction(actionText: string, player: Nation) {
  const prompt = `Oyuncu şu emri verdi: "${actionText}".
  Oyuncunun mevcut durumu: Altın: ${player.gold}, İnsan Gücü: ${player.manpower}, Ordu: ${player.army}, Ekonomi: ${player.economy}, Laboratuvar Sayısı: ${player.labs}, Sahip Olduğu Teknolojiler: ${player.technologies.join(', ') || 'Yok'}.
  Oyun MODERN ÇAĞ'da (2026 yılı) geçmektedir. Bu emrin modern dünyada ne kadar gerçekçi olduğunu değerlendir (İHA, SİHA, siber güvenlik, modern fabrikalar, nükleer enerji, uzay ajansı, modern diplomasi vb.).
  Eğer oyuncu antik çağ silahları (kılıç, ok, mancınık, kalkan) üretmek isterse, bunun modern çağda geçersiz olduğunu belirterek isRealistic: false yap ve reddet.
  Eğer oyuncu "Laboratuvar kur", "Teknoloji merkezi inşa et" gibi bir emir verirse, effectLabs: 1 (veya kaç tane kuruluyorsa) olarak dön.
  Eğer oyuncu bir teknoloji araştırmak istiyorsa (örn: İHA teknolojisi, Siber Güvenlik, Modern Piyade Tüfekleri vb.), laboratuvarı yoksa (labs == 0) isRealistic: false yap ve "Bunun için önce laboratuvar veya teknoloji merkezi kurmalısınız." diyerek reddet. Laboratuvarı varsa ve mantıklıysa unlockedTech: 'Teknoloji Adı' olarak dön.
  Eğer oyuncu ordusunu belirli birimlerle güçlendirmek istiyorsa (örn: "tank üret", "uçak al", "denizaltı inşa et", "piyade eğit"), bunları "effectMilitaryDetails" objesinde (infantry, armored, airForce, navy) belirt. "effectArmy" ise bu birimlerin toplamı kadar artmalı. Piyadeler ucuz (örn: 1 altın, 1 insan = 1 piyade), zırhlılar pahalı, hava ve deniz kuvvetleri çok daha pahalıdır altın ve insan gücü maliyetini buna göre artır.
  Eğer oyuncu gelişmiş bir casusluk yapıyorsa (örn: teknoloji çalma, ekonomik veri öğrenme, sabotaj), 'espionageResults' ile detayları dön (örn: çalınan teknoloji adı, öğrenilen bilgiler vb.) ve 'targetNationId' belirt.
  Eğer oyuncu casusluk, propaganda, suikast, terör eylemi, bölücü güçleri destekleme gibi gizli operasyonlar yapıyorsa, hedeflenen ülkenin ID'sini (örn: 'usa', 'russia', 'syria') 'targetNationId' olarak dön ve hedefin istikrarına vereceği zararı 'effectTargetStability' (negatif değer) olarak belirle.
  Eğer oyuncu kendi iç güvenliğini artırmak istiyorsa 'effectStability' (pozitif değer) dön.
  Eğer gerçekçiyse, bu emri yerine getirmenin altın ve insan gücü maliyetini belirle.
  Ayrıca bu emrin ekonomiye, orduya veya istikrara kalıcı etkisini belirle.
  Eğer çok saçma veya teknolojik olarak imkansız bir emirse (örn: ışınlanma makinesi), isRealistic: false yap.
  
  JSON formatında dön.`;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRealistic: { type: Type.BOOLEAN },
            costGold: { type: Type.NUMBER },
            costManpower: { type: Type.NUMBER },
            effectEconomy: { type: Type.NUMBER, description: "Tur başı gelir artışı" },
            effectArmy: { type: Type.NUMBER, description: "Tek seferlik ordu artışı" },
            effectStability: { type: Type.NUMBER, description: "Kendi istikrar değişimi" },
            effectTargetStability: { type: Type.NUMBER, description: "Hedef ülkenin istikrar değişimi (negatif)" },
            targetNationId: { type: Type.STRING, description: "Hedef ülkenin ID'si (varsa)" },
            effectLabs: { type: Type.NUMBER, description: "Kurulan laboratuvar/teknoloji merkezi sayısı" },
            unlockedTech: { type: Type.STRING, description: "Eğer bir teknoloji araştırıldıysa teknolojinin adı" },
            reasoning: { type: Type.STRING, description: "Neden bu maliyetler ve etkiler seçildi? Veya neden başarısız oldu? (Türkçe)" },
            constructionName: { type: Type.STRING, description: "Yapılan eylemin/binanın kısa adı" },
            effectMilitaryDetails: {
              type: Type.OBJECT,
              properties: {
                infantry: { type: Type.NUMBER },
                armored: { type: Type.NUMBER },
                airForce: { type: Type.NUMBER },
                navy: { type: Type.NUMBER }
              }
            },
            espionageResults: {
              type: Type.OBJECT,
              properties: {
                stolenTech: { type: Type.STRING },
                intelRevealed: { type: Type.BOOLEAN },
                stolenGold: { type: Type.NUMBER }
              }
            }
          },
          required: ["isRealistic", "costGold", "costManpower", "effectEconomy", "effectArmy", "effectStability", "reasoning", "constructionName"]
        }
      }
    }));
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    const isRateLimit = e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || e?.message?.includes('429') || e?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI Action Eval Quota Exceeded:", e.message || e);
    } else {
      console.error("AI Action Eval Error:", e);
    }
    return { isRealistic: false, reasoning: isRateLimit ? "Yapay zeka çok yoğun (Kota aşıldı). Lütfen biraz bekleyip tekrar deneyin." : "Emir iletilemedi veya anlaşılamadı." };
  }
}

export async function generateWarReport(player: Nation, battles: { enemy: Nation, pCas: number, eCas: number, conquered: string[], conqueredCities: string[] }[]) {
  const battlesSummary = battles.map(b => 
    `- ${b.enemy.name} ile çatışma: ${player.name} kaybı: ${b.pCas}, ${b.enemy.name} kaybı: ${b.eCas}. Fethedilenler: ${[...b.conquered, ...b.conqueredCities].join(', ') || 'Yok'}`
  ).join('\n');

  const prompt = `Sen bir askeri tarihçisin. Aşağıdaki savaş verilerine bakarak oyuncuya detaylı bir savaş özeti raporu sun. Bu turda birden fazla cephede savaşılmış olabilir.
  Oyun MODERN ÇAĞ'da (2026 yılı) geçmektedir.
  
  Çatışma Özeti:
  ${battlesSummary}
  
  Savaş modern çağda geçiyor. Tanklar, savaş uçakları, füzeler, İHA/SİHA'lar, siber saldırılar, hava savunma sistemleri ve modern piyadeler kullanılıyor. Kılıç, ok, kalkan, atlı süvari gibi antik silahları KESİNLİKLE KULLANMA.
  
  Bana JSON formatında şu yapıda bir rapor ver.`;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Savaşın veya Çatışmanın Adı (Örn: Kartaca Meydan Muharebesi)" },
            description: { type: Type.STRING, description: "Savaşın nasıl geçtiğine dair epik ve detaylı bir anlatım." },
            tacticalAnalysis: { type: Type.STRING, description: "Hangi birimlerin (hayali olarak döneme uygun süvari, piyade vb. uydurabilirsin) etkili olduğu ve stratejik hatalar/başarılar hakkında taktiksel analiz." }
          },
          required: ["title", "description", "tacticalAnalysis"]
        }
      }
    }));
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    const isRateLimit = e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || e?.message?.includes('429') || e?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI War Report Quota Exceeded:", e.message || e);
    } else {
      console.error("AI War Report Error:", e);
    }
    return {
      title: "Bilinmeyen Çatışma",
      description: isRateLimit ? "Savaş meydanından gelen haberler karmaşık (Yapay zeka kotası aşıldı). Lütfen biraz bekleyin." : "Savaş meydanından gelen haberler karmaşık. Rapor oluşturulamadı.",
      tacticalAnalysis: "Veri yetersiz."
    };
  }
}

export async function getAITurnActions(state: GameState) {
  const npcStates = Object.values(state.nations).filter(n => !n.isPlayer).map(n => ({
    id: n.id,
    name: n.name,
    gold: n.gold,
    manpower: n.manpower,
    army: n.army,
    economy: n.economy,
    atWarWith: n.atWarWith,
    relationsWithPlayer: n.relations[state.playerNationId] || 0
  }));

  const recentLogs = state.logs.slice(0, 5);
  const playerPolicy = state.playerPolicy || 'balanced';

  const prompt = `Sen bir büyük strateji oyununda yapay zeka oyuncularını yöneten bir ustasın.
  Oyun MODERN ÇAĞ'da (2026 yılı) geçmektedir.
  Şu anki tur: ${state.turn}.
  
  OYUNCU (İnsan) DIŞ POLİTİKASI: "${playerPolicy.toUpperCase()}".
${playerPolicy === 'aggressive' ? "  (Oyuncu agresif ve yayılmacı oynuyor. NPC'ler buna tepki olarak daha kolay tehdit hissedebilir, koalisyon kurabilir veya korkup boyun eğebilir.)" : ""}
${playerPolicy === 'defensive' ? "  (Oyuncu savunmacı oynuyor. NPC'ler oyuncuya daha az tehditkar yaklaşabilir veya oyuncunun güçlenmesinden endişe edip casusluk yapabilir.)" : ""}
${playerPolicy === 'isolationist' ? "  (Oyuncu izolasyonist oynuyor. İç işlerine odaklanıyor. NPC'ler oyuncuyu görmezden gelebilir veya oyuncunun yalnızlığından faydalanıp saldırmayı düşünebilir.)" : ""}

  Aşağıda oyuncu dışı ülkelerin (NPC) mevcut durumu verilmiştir.
  Her bir NPC için bu tur ne yapacağına karar ver.
  
  Mevcut Durum:
  ${JSON.stringify(npcStates)}

  Son Olaylar (Oyuncunun ve dünyanın son eylemleri):
  ${JSON.stringify(recentLogs)}
  
  Kurallar:
  - 'invest': Ekonomiye yatırım yapar (Maliyet: 50 altın). Sadece altını >= 50 ise seçebilir.
  - 'recruit': Ordu toplar (Maliyet: 30 altın, 100 insan gücü). Sadece altını >= 30 ve insan gücü >= 100 ise seçebilir.
  - 'declare_war': Başka bir ülkeye savaş ilan eder. Hedef ülkenin ID'sini 'targetId' olarak belirtmelisin.
  - 'send_message': Başka bir ülkeye (özellikle oyuncuya) diplomatik veya ticari mesaj gönderir. Son olaylara (oyuncunun eylemlerine) tepki olarak olumlu veya olumsuz mesajlar göndermelisin. (Örn: "Ürettiğiniz İHA'lardan almak istiyoruz", "Sınırımızdaki tatbikatları durdurun", "Ekonomik büyümenizi tebrik ederiz"). Mesaj içeriği 'messageText', hedef 'targetId' olmalı.
  - 'espionage': Hedef ülkede istikrarsızlık yaratmak için gizli operasyon düzenler (Maliyet: 100 altın). 'targetId' belirtilmelidir. Özellikle düşmanlarına, ilişkisi kötü olanlara (-20'den düşük) veya hızla büyüyen tehditlere karşı kullan. Ayrıca savaşmadan bir ülkeyi çöktürmek istiyorsan kullan.
  - 'idle': Hiçbir şey yapmaz.
  
  Mantıklı kararlar ver. Eğer bir ülke savaştaysa ordu toplamaya öncelik vermeli. Ekonomisi kötüyse yatırım yapmalı. Güçlüyse zayıf ülkelere savaş ilan edebilir veya espionage ile rejimlerini sarsabilir. Sadece savaş odaklı olma, zayıf ülkeler 'invest' veya 'recruit' yapmalı veya oyuncuya 'send_message' ile ulaşarak son eylemlerine tepki göstermeli. Espionage stratejik bir silahtır, agresif ancak savaşa girmek istemeyen düşmanlara uygula.
  `;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nationId: { type: Type.STRING },
              action: { type: Type.STRING, description: "invest, recruit, declare_war, send_message, espionage, idle" },
              targetId: { type: Type.STRING, description: "Sadece declare_war, send_message veya espionage için hedef ülke ID'si" },
              messageText: { type: Type.STRING, description: "Sadece send_message için gönderilecek mesajın içeriği (Türkçe)" },
              reasoning: { type: Type.STRING, description: "Bu kararı neden aldığının kısa Türkçe açıklaması" }
            },
            required: ["nationId", "action", "reasoning"]
          }
        }
      }
    }));
    return JSON.parse(response.text || '[]');
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI Turn Quota Exceeded:", error.message || error);
    } else {
      console.error("AI Turn Error:", error);
    }
    return [];
  }
}

export async function evaluatePeaceOffer(offerer: Nation, target: Nation, playerPolicy: string = 'balanced') {
  const prompt = `Bir strateji oyununda ${offerer.name}, ${target.name} ülkesine barış teklif ediyor.
  Oyun MODERN ÇAĞ'da (2026 yılı) geçmektedir.
  Sen ${target.name} ülkesinin liderisin. Bu barış teklifini kabul edecek misin?
  
  ${offerer.name} Durumu: Ordu: ${offerer.army}, Altın: ${offerer.gold}
  ${target.name} Durumu: Ordu: ${target.army}, Altın: ${target.gold}
  Aralarındaki İlişki: ${target.relations[offerer.id] || 0} (-100 ile 100 arası)
  
  ${offerer.isPlayer ? `(Not: İnsan oyuncu şuan ${playerPolicy} politikası izliyor)` : ''}
  
  Eğer ordun onlardan çok daha güçlüyse ve ilişkiniz kötüyse reddedebilirsin. Eğer zayıfsan veya savaş seni yıprattıysa kabul etmelisin. Mantıklı bir modern çağ lideri gibi düşün.
  `;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accepts: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING, description: "Neden kabul edip etmediğinin kısa Türkçe açıklaması" }
          },
          required: ["accepts", "reasoning"]
        }
      }
    }));
    return JSON.parse(response.text || '{"accepts": false, "reasoning": "Yapay zeka yanıt vermedi."}');
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI Peace Quota Exceeded:", error.message || error);
    } else {
      console.error("AI Peace Error:", error);
    }
    return { accepts: false, reasoning: isRateLimit ? "Elçilerimiz yolda kayboldu (Yapay zeka kotası aşıldı)." : "Elçilerimiz yolda kayboldu." };
  }
}

export async function generateGlobalSummaryReport(state: GameState, recentLogs: string[]) {
  const prompt = `Sen küresel bir veri analisti ve siyasi danışmansın. 
  Oyun MODERN ÇAĞ'da geçmektedir. 
  Şu anki Tur: ${state.turn}.
  
  Aşağıda bu tur gerçekleşen en önemli olaylar verilmiştir:
  ${recentLogs.join('\\n')}

  Bana dünyadaki bu tur gelişen en önemli siyasi, savaş veya diplomatik durumları özetleyen bir haber bülteni / analiz metni oluştur.
  Eğer önemli bir olay yoksa, barışçıl ve ekonomik gelişmelere odaklanabilirsin.
  Lütfen haber spikeri veya istihbarat raporu gibi ciddi ve sürükleyici bir dille (Türkçe) oluştur. İçerisinde başlık, alt başlıklar ve analizler olsun.
  `;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt
    }));
    return response.text || "Küresel rapor alınamadı.";
  } catch (e: any) {
    const isRateLimit = e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || e?.message?.includes('429') || e?.message?.includes('quota');
    if (isRateLimit) {
      console.warn("AI Global Summary Quota Exceeded");
    }
    return "Küresel haberleşme ağlarında bir kesinti var. Rapor alınamadı.";
  }
}

export async function generateDiplomaticEvents(state: GameState) {
  const prompt = `Sen büyük bir strateji oyununda BM (Birleşmiş Milletler) veya rastgele diplomatik olaylar üreten bir sistem yöneticisisin.
  Modern çağda geçmektedir. 
  
  Şu an dünyada ${Object.values(state.nations).filter(n => n.atWarWith.length > 0).length} ülke savaşta.
  
  Bana bu tur için küresel, diplomatik veya ülkelere özel (örneğin "Rusya ve ABD arasında gerilim zirvede", "Dünya İklim Zirvesi toplandı", "Suudi Arabistan petrol ambargosu tartışıyor" gibi) 0, 1 veya 2 adet rastgele olay veya açıklama ver.
  Her olay, tüm devletlerin istikrarını veya ekonomisini hafifçe (+/- 1-5) etkileyebilir ya da sadece kozmetik bir haber olabilir.
  
  JSON formatında dön.`;

  try {
    const response = await withRetry((model) => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              effectTarget: { type: Type.STRING, description: "Etkilenecek ülke ID'si veya 'all' (herkes) veya 'none'" },
              effectType: { type: Type.STRING, description: "stability, economy, none" },
              effectAmount: { type: Type.NUMBER }
            },
            required: ["title", "description", "effectTarget", "effectType", "effectAmount"]
          }
        }
      }
    }));
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}
