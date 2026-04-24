import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './game/useGame';
import { Coins, Users, Swords, TrendingUp, Shield, Flag, AlertCircle, Loader2, Handshake, Landmark, FileText, MessageSquare, X, FlaskConical, Send, ChevronRight, Check, Search, BarChart2, Globe, Newspaper } from 'lucide-react';
import WorldMap from './components/WorldMap';
import EconomyChart from './components/EconomyChart';
import { TECHNOLOGIES } from './game/technologies';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    state, 
    isProcessing, 
    pendingActions, 
    setPendingActions, 
    showWarReport, 
    setShowWarReport, 
    declareWar, 
    formAlliance, 
    makeTradeAgreement, 
    makePeace, 
    sendMessage,
    markMessageRead,
    endTurn,
    setPlayerPolicy
  } = useGame();
  
  const player = state.nations[state.playerNationId];
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeChatNationId, setActiveChatNationId] = useState<string | null>(null);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);
  const [modalChatMessage, setModalChatMessage] = useState("");
  
  // New States
  const [isChroniclesOpen, setIsChroniclesOpen] = useState(false);
  const [chronicleTab, setChronicleTab] = useState<'global' | 'national'>('global');
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);
  const [compareNation1, setCompareNation1] = useState<string>(player.id);
  const [compareNation2, setCompareNation2] = useState<string>('');
  const [messageSearch, setMessageSearch] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [animatedNationIds, setAnimatedNationIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const prevTurnRef = useRef(state.turn);

  useEffect(() => {
    if (state.turn > prevTurnRef.current) {
      setIsChroniclesOpen(true);
      prevTurnRef.current = state.turn;
    }
  }, [state.turn]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedNationId) return;
    sendMessage(selectedNationId, chatMessage);
    setChatMessage("");
  };

  const handleModalSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalChatMessage.trim() || !activeChatNationId) return;
    
    if (activeChatNationId === 'alliance') {
      // Handle alliance message
      // We need to add it to state.allianceChat via a new function in useGame or just directly if we expose setState
      // Wait, useGame doesn't expose sendAllianceMessage. Let's add it or just use sendMessage with 'alliance'
      sendMessage('alliance', modalChatMessage);
    } else {
      sendMessage(activeChatNationId, modalChatMessage);
    }
    setModalChatMessage("");
  };

  const handleResearchTech = (techId: string) => {
    const tech = TECHNOLOGIES[techId];
    if (player.gold >= tech.costGold && player.labs >= tech.costLabs) {
      setPendingActions([...pendingActions, `Araştır: ${tech.id}`]);
      setIsTechTreeOpen(false);
    }
  };

  const globalLogs = state.logs.filter(log => log.match(/DİPLOMASİ:|FETHİ:|İÇ KARIŞIKLIK:|Savaş raporu:|GİZLİ OPERASYON:/));
  const nationalLogs = state.logs.filter(log => !log.match(/DİPLOMASİ:|FETHİ:|İÇ KARIŞIKLIK:|Savaş raporu:|GİZLİ OPERASYON:/));
  const activeLogs = chronicleTab === 'global' ? globalLogs : nationalLogs;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans pb-12">
      {/* Header */}
      <header className="bg-neutral-950 border-b border-neutral-800 p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-50">Pax Historia</h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Büyük Strateji Motoru</p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
            title="Ayarlar (Dış Politika)"
          >
            <Shield size={20} />
          </button>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
            title="Nasıl Oynanır?"
          >
            <AlertCircle size={20} />
          </button>
          <button
            onClick={() => setIsChroniclesOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
            title="Dünya Olayları"
          >
            <Globe size={20} />
          </button>
          <button
            onClick={() => setIsTechTreeOpen(true)}
            className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 border border-purple-500/30"
          >
            <FlaskConical size={16} />
            Teknoloji Ağacı
          </button>
          <div className="text-center">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Tur</div>
            <div className="text-xl font-mono">{state.turn}</div>
          </div>
          <button
            onClick={endTurn}
            disabled={isProcessing}
            className="bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            Turu Bitir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
              <p className="text-neutral-300 font-medium">Yapay Zeka Hamlelerini Düşünüyor...</p>
            </div>
          </div>
        )}

        {/* War Report Modal */}
        {showWarReport && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                    <Swords size={24} />
                    {showWarReport.title}
                  </h2>
                  <span className="text-sm text-neutral-500">Tur {showWarReport.turn}</span>
                </div>
                
                <p className="text-neutral-300 leading-relaxed italic border-l-4 border-neutral-700 pl-4">
                  "{showWarReport.description}"
                </p>
                
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                   <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                     <FileText size={16} className="text-blue-400" />
                     Taktiksel Analiz
                   </h4>
                   <p className="text-sm text-neutral-400 leading-relaxed">{showWarReport.tacticalAnalysis}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                    <h4 className="font-semibold text-neutral-200 mb-2">Kayıplar</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(showWarReport.casualties).map(([nationId, cas]) => (
                        <li key={nationId} className="flex justify-between">
                          <span className="text-neutral-400">{state.nations[nationId]?.name || nationId}:</span>
                          <span className="text-red-400 font-mono">-{cas}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                    <h4 className="font-semibold text-neutral-200 mb-2">Fethedilen Topraklar</h4>
                    {showWarReport.conqueredTerritories.length > 0 || (showWarReport.conqueredCities && showWarReport.conqueredCities.length > 0) ? (
                      <ul className="text-sm space-y-1">
                        {showWarReport.conqueredTerritories.map((t, i) => (
                          <li key={`t-${i}`} className="text-green-400 flex items-center gap-2">
                            <Flag size={12} /> {t} (Bölge)
                          </li>
                        ))}
                        {showWarReport.conqueredCities && showWarReport.conqueredCities.map((c, i) => (
                          <li key={`c-${i}`} className="text-green-400 flex items-center gap-2 font-bold">
                            <Flag size={12} /> {c} (Şehir)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-neutral-500">Toprak değişimi olmadı.</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setShowWarReport(null)}
                    className="bg-neutral-100 text-neutral-900 px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors"
                  >
                    Raporu Kapat
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Left Sidebar: Player Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }}></div>
              <h2 className="text-xl font-semibold">{player.name}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Coins size={16} />
                  <span className="text-sm">Hazine</span>
                </div>
                <div className="font-mono flex items-center gap-2">
                  <span>{player.gold}</span>
                  <span className="text-xs text-green-400">(+{player.economy})</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Users size={16} />
                  <span className="text-sm">İnsan Gücü</span>
                </div>
                <div className="font-mono flex items-center gap-2">
                  <span>{player.manpower}</span>
                  <span className="text-xs text-green-400">(+{Math.floor(player.stability / 2)})</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Swords size={16} />
                    <span className="text-sm">Ordu Büyüklüğü</span>
                  </div>
                  <div className="font-mono">{player.army}</div>
                </div>
                {player.militaryDetails && (
                  <div className="grid grid-cols-2 gap-1 mt-2 p-2 bg-neutral-900 rounded-lg text-xs text-neutral-400">
                    <div>Piyade: <span className="text-neutral-200">{player.militaryDetails.infantry}</span></div>
                    <div>Zırhlı: <span className="text-neutral-200">{player.militaryDetails.armored}</span></div>
                    <div>Hava K.: <span className="text-neutral-200">{player.militaryDetails.airForce}</span></div>
                    <div>Deniz K.: <span className="text-neutral-200">{player.militaryDetails.navy}</span></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Shield size={16} />
                  <span className="text-sm">İstikrar</span>
                </div>
                <div className="font-mono">{player.stability}%</div>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <FlaskConical size={16} />
                    <span className="text-sm">Laboratuvar / Araştırma</span>
                  </div>
                  <div className="font-mono">{player.labs}</div>
                </div>
                {player.researchQueue && player.researchQueue.length > 0 ? (
                  <div className="mt-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md p-2">
                    <span className="text-neutral-500 block mb-1">Araştırma Sırası:</span>
                    {player.researchQueue.map((techId, idx) => {
                      const tech = TECHNOLOGIES[techId];
                      return (
                        <div key={idx} className={`flex justify-between items-center ${idx === 0 ? 'text-purple-400 font-semibold' : 'text-neutral-400'}`}>
                          <span>{idx + 1}. {tech?.name || techId}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-neutral-500 italic">Araştırma sırası boş.</div>
                )}
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-700/50">
                <div className="text-sm text-neutral-400">Bölgeler/Şehirler:</div>
                <div className="text-xs text-neutral-300">
                  {(Object.values(state.cities) as any[]).filter(c => c.ownerId === player.id).map(c => c.name).join(', ') || 'Yok'}
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-700/50">
                <div className="text-sm text-neutral-400">Teknolojiler:</div>
                <div className="text-xs text-neutral-300 flex flex-wrap gap-1">
                  {player.technologies && player.technologies.length > 0 
                    ? player.technologies.map((t, i) => <span key={i} className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">{TECHNOLOGIES[t] ? TECHNOLOGIES[t].name : t}</span>)
                    : <span className="text-neutral-500 italic">Henüz araştırılan teknoloji yok.</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Devlet Emirleri (Sırayla)</h3>
                <button 
                  onClick={() => setPendingActions([...pendingActions, ""])}
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded text-neutral-300"
                >
                  + Yeni Emir Ekle
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <AnimatePresence>
                  {pendingActions.map((action, index) => {
                    const isTechAction = action.startsWith('Araştır: ');
                    const techId = isTechAction ? action.replace('Araştır: ', '') : '';
                    const techName = isTechAction && TECHNOLOGIES[techId] ? TECHNOLOGIES[techId].name : '';

                    return (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-2"
                      >
                        <div className="bg-neutral-800 text-neutral-500 px-2 py-2 rounded-lg text-xs font-mono flex items-center justify-center">
                          {index + 1}
                        </div>
                        {isTechAction ? (
                          <div className="flex-1 bg-purple-900/20 border border-purple-500/30 rounded-lg p-2 text-sm text-purple-300 flex items-center">
                            <FlaskConical size={14} className="mr-2" />
                            Teknoloji Araştırması: {techName}
                          </div>
                        ) : (
                          <textarea
                            value={action}
                            onChange={(e) => {
                              const newActions = [...pendingActions];
                              newActions[index] = e.target.value;
                              setPendingActions(newActions);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (action.trim()) {
                                  setPendingActions([...pendingActions, ""]);
                                }
                              }
                            }}
                            placeholder={index === 0 ? "Örn: Askeri sanayi kur..." : index === 1 ? "Örn: İngiltere'de isyan çıkart..." : "Emir girin (Onaylamak için Enter)..."}
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-sm focus:outline-none focus:border-neutral-500 resize-none h-16"
                            disabled={isProcessing}
                          />
                        )}
                        {pendingActions.length > 1 && (
                          <button 
                            onClick={() => {
                              const newActions = pendingActions.filter((_, i) => i !== index);
                              setPendingActions(newActions);
                            }}
                            className="text-neutral-500 hover:text-red-400 p-2"
                          >
                            ✕
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="text-xs text-blue-400/80 leading-relaxed">
                Emirler sırayla işlenir. Laboratuvar kurmadan teknoloji araştıramazsınız.
              </div>
            </div>
          </div>
        </div>

        {/* Center: Map */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          <div className="h-[600px] w-full rounded-xl overflow-hidden border border-neutral-800 shrink-0 relative">
            <WorldMap 
              nations={state.nations} 
              territories={state.territories}
              cities={state.cities}
              selectedNationId={selectedNationId}
              onSelectNation={(id) => setSelectedNationId(id === selectedNationId ? null : id)}
              animatedNationIds={animatedNationIds}
            />
            {/* Map overlay hints */}
            <div className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-neutral-400 border border-neutral-800 pointer-events-none">
              Etkileşim için haritadan bir ülke seçin
            </div>
            <button
              onClick={() => setIsEconomyOpen(true)}
              className="absolute top-4 right-4 bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-neutral-200 border border-neutral-700 flex items-center gap-2 transition-colors"
            >
              <BarChart2 size={16} />
              Ekonomik Büyüme
            </button>
          </div>
        </div>

        {/* Right Sidebar: Dynamic (Nation Details) */}
        <div className="lg:col-span-3">
          {selectedNationId && selectedNationId !== player.id ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
              {/* Nation Header */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.nations[selectedNationId].color }}></div>
                  <h3 className="font-semibold text-lg">{state.nations[selectedNationId].name}</h3>
                </div>
                <button onClick={() => setSelectedNationId(null)} className="text-neutral-500 hover:text-white">✕</button>
              </div>
              
              {/* Nation Stats */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2"><Swords size={14} className="text-neutral-400"/> <span className="font-mono">{state.nations[selectedNationId].army}</span></div>
                  {state.nations[selectedNationId].militaryDetails && (
                    <div className="text-[10px] text-neutral-500 grid grid-cols-2">
                       <span>P:{state.nations[selectedNationId].militaryDetails!.infantry}</span>
                       <span>Z:{state.nations[selectedNationId].militaryDetails!.armored}</span>
                       <span>H:{state.nations[selectedNationId].militaryDetails!.airForce}</span>
                       <span>D:{state.nations[selectedNationId].militaryDetails!.navy}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2"><Coins size={14} className="text-neutral-400"/> <span className="font-mono">{state.nations[selectedNationId].gold}</span> <span className="text-xs text-green-400">(+{state.nations[selectedNationId].economy})</span></div>
                <div className="flex items-center gap-2"><Users size={14} className="text-neutral-400"/> <span>İlişki:</span> <span className="font-mono">{player.relations[selectedNationId] || 0}</span></div>
                <div className="flex items-center gap-2"><Shield size={14} className="text-neutral-400"/> <span>İstikrar:</span> <span className="font-mono">{state.nations[selectedNationId].stability}%</span></div>
                <div className="col-span-2 text-xs text-neutral-400 mt-1">
                  <div className="mb-1"><span className="text-neutral-500">Müttefikler:</span> {state.nations[selectedNationId].allies.length > 0 ? state.nations[selectedNationId].allies.map(id => state.nations[id].name).join(', ') : 'Yok'}</div>
                  <div className="mb-1"><span className="text-neutral-500">Savaşta:</span> {state.nations[selectedNationId].atWarWith.length > 0 ? state.nations[selectedNationId].atWarWith.map(id => state.nations[id].name).join(', ') : 'Yok'}</div>
                  <div><span className="text-neutral-500">Bölgeler/Şehirler:</span> {(Object.values(state.cities) as any[]).filter(c => c.ownerId === selectedNationId).map(c => c.name).join(', ') || 'Yok'}</div>
                </div>
                {player.intel && player.intel[selectedNationId] && (
                  <div className="col-span-2 mt-2 bg-neutral-950 border border-neutral-700/50 rounded p-2 text-xs text-purple-300">
                    <div className="flex items-center gap-1 mb-1 font-semibold border-b border-neutral-700/50 pb-1">
                       <AlertCircle size={12} /> Sızdırılan İstihbarat (Tur: {player.intel[selectedNationId].lastUpdatedTurn})
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span>Bilinen Hazine: {player.intel[selectedNationId].estimatedGold || '?'}</span>
                      <span>Bilinen Ekonomi: {player.intel[selectedNationId].estimatedEconomy || '?'}</span>
                      <span className="col-span-2 text-neutral-400 mt-1">Gizli Teknolojiler: {player.intel[selectedNationId].technologies?.join(', ') || 'Bilinmiyor'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-b border-neutral-800 bg-neutral-900/80 grid grid-cols-4 gap-2">
                <button 
                  onClick={() => {
                    formAlliance(selectedNationId);
                    setAnimatedNationIds([selectedNationId]);
                    setTimeout(() => setAnimatedNationIds([]), 1500);
                  }}
                  disabled={isProcessing || player.allies.includes(selectedNationId) || (player.relations[selectedNationId] || 0) < 30}
                  className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border border-blue-800/50 rounded py-1.5 text-xs font-medium disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1 text-center group relative"
                >
                  <Handshake size={14} />
                  İttifak
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] w-32 p-2 rounded shadow-lg pointer-events-none transition-opacity z-50">
                    İlişkiler 30'un üzerinde olmalı. Müttefikler savaşta birbirini savunabilir.
                  </div>
                </button>
                <button 
                  onClick={() => {
                    makeTradeAgreement(selectedNationId);
                    setAnimatedNationIds([selectedNationId]);
                    setTimeout(() => setAnimatedNationIds([]), 1500);
                  }}
                  disabled={isProcessing || player.gold < 20}
                  className="bg-green-900/30 hover:bg-green-800/50 text-green-300 border border-green-800/50 rounded py-1.5 text-xs font-medium disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1 text-center group relative"
                >
                  <Landmark size={14} />
                  Ticaret
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] w-32 p-2 rounded shadow-lg pointer-events-none transition-opacity z-50">
                    Maliyeti 20 Altın. Her iki ülkenin ekonomik gelirini kalıcı olarak +5 artırır.
                  </div>
                </button>
                <button 
                  onClick={() => declareWar(selectedNationId)}
                  disabled={isProcessing || player.atWarWith.includes(selectedNationId)}
                  className="bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-800/50 rounded py-1.5 text-xs font-medium disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1 text-center group relative"
                >
                  <Swords size={14} />
                  Savaş İlanı
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-neutral-900 border border-neutral-700 text-red-300 text-[10px] w-32 p-2 rounded shadow-lg pointer-events-none transition-opacity z-50">
                    Geri dönüşü yoktur. İlişkileri -100 yapar.
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPendingActions([...pendingActions, `${state.nations[selectedNationId].name} ülkesinde istikrarı bozmak için gizli propaganda ajanları gönder.`]);
                  }}
                  disabled={isProcessing || player.gold < 50}
                  className="bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 border border-purple-800/50 rounded py-1.5 text-xs font-medium disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1 text-center group relative"
                >
                  <AlertCircle size={14} />
                  Casusluk
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full right-0 mb-2 bg-neutral-900 border border-neutral-700 text-purple-300 text-[10px] w-48 p-2 rounded shadow-lg pointer-events-none transition-opacity z-50">
                    Tahmini maliyet: ~50-100 Altın. Tur sonunda hedefin istikrarını ve kaynaklarını tüketmek için riskli operasyon emri verin.
                  </div>
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(state.chatHistories[selectedNationId] || []).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-800 text-neutral-400 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Yazıyor...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Elçi gönder..." 
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                  disabled={isProcessing}
                />
                <button 
                  type="submit" 
                  disabled={isProcessing || !chatMessage.trim()}
                  className="bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Gönder
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center gap-2">
                <AlertCircle size={18} className="text-neutral-400" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-300">Kronikler</h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {state.logs.map((log, i) => (
                  <div key={i} className="text-sm text-neutral-400 border-l-2 border-neutral-700 pl-3 py-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Floating Messages Button */}
      <button
        onClick={() => setIsMessagesOpen(true)}
        className="fixed bottom-14 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 z-40 flex items-center justify-center"
        title="Mesajlar"
      >
        <MessageSquare size={24} />
        {Object.values(state.unreadMessages).some(v => v) && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-neutral-900"></span>
        )}
      </button>

      {/* Ticker for World News */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-neutral-950 border-t border-neutral-800 z-30 flex items-center shadow-lg">
        <div className="h-full flex items-center bg-red-600/90 text-white px-4 font-bold text-xs uppercase tracking-widest flex-shrink-0 z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)]">
          <Globe size={14} className="mr-2" /> SON DAKİKA
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="animate-marquee whitespace-nowrap text-sm text-neutral-300 flex gap-12 font-medium">
            {globalLogs.length > 0 ? (
              [...globalLogs.slice(0, 10), ...globalLogs.slice(0, 10), ...globalLogs.slice(0, 10)].map((log, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {log}
                </span>
              ))
            ) : (
              <span className="italic text-neutral-500 text-sm">Dünya genelinde sakin bir gün...</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Modal */}
      {isMessagesOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-5xl w-full h-[85vh] flex overflow-hidden shadow-2xl">
            {/* Left Pane - Contacts */}
            <div className="w-1/3 border-r border-neutral-800 flex flex-col bg-neutral-950">
              <div className="p-4 border-b border-neutral-800 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-400" />
                  Diplomatik İletişim
                </h2>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Ülke ara..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-neutral-100"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {(!messageSearch || 'ittifak kanalı'.includes(messageSearch.toLowerCase())) && (
                  <button
                    onClick={() => setActiveChatNationId('alliance')}
                    className={`w-full text-left p-4 border-b border-neutral-800/50 hover:bg-neutral-800 transition-colors flex items-center gap-3 ${activeChatNationId === 'alliance' ? 'bg-neutral-800' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-blue-600">
                      <Shield size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-neutral-200 truncate">İttifak Kanalı</h3>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">Müttefiklerinizle konuşun</p>
                    </div>
                  </button>
                )}
                {(Object.values(state.nations) as any[])
                  .filter(n => !n.isPlayer)
                  .filter(n => {
                    // If searching, show matching nations regardless of chat history
                    if (messageSearch) {
                      return n.name.toLowerCase().includes(messageSearch.toLowerCase());
                    }
                    // Otherwise, only show nations with chat history or unread messages
                    return (state.chatHistories[n.id] && state.chatHistories[n.id].length > 0) || state.unreadMessages[n.id];
                  })
                  .map(nation => {
                  const msgs = state.chatHistories[nation.id] || [];
                  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : "Mesaj göndermek için tıklayın";
                  const isActive = activeChatNationId === nation.id;
                  const isUnread = state.unreadMessages[nation.id];
                  
                  return (
                    <button
                      key={nation.id}
                      onClick={() => {
                        setActiveChatNationId(nation.id);
                        if (isUnread) markMessageRead(nation.id);
                      }}
                      className={`w-full text-left p-4 border-b border-neutral-800/50 hover:bg-neutral-800 transition-colors flex items-center gap-3 ${isActive ? 'bg-neutral-800' : ''}`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{ backgroundColor: nation.color }}>
                          {nation.name.substring(0, 2).toUpperCase()}
                        </div>
                        {isUnread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-950"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${isUnread ? 'text-white' : 'text-neutral-200'}`}>{nation.name}</h3>
                          {msgs.length > 0 && <span className="text-[10px] text-neutral-500">{msgs.length} msj</span>}
                        </div>
                        <p className={`text-xs truncate ${isUnread ? 'text-neutral-300 font-medium' : 'text-neutral-400'}`}>{lastMsg}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane - Chat */}
            <div className="flex-1 flex flex-col bg-neutral-900 relative">
              <button onClick={() => setIsMessagesOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white z-10 bg-neutral-900/80 p-1 rounded-full">
                <X size={20} />
              </button>
              
              {activeChatNationId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center gap-3">
                    {activeChatNationId === 'alliance' ? (
                      <>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-600">
                          <Shield size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-100">İttifak Kanalı</h3>
                          <p className="text-xs text-neutral-400">{player.allies.length > 0 ? player.allies.map(id => state.nations[id].name).join(', ') : 'Henüz müttefikiniz yok'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: state.nations[activeChatNationId]?.color }}>
                          {state.nations[activeChatNationId]?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-100">{state.nations[activeChatNationId]?.name}</h3>
                          <p className="text-xs text-neutral-400">Diplomatik Kanal</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeChatNationId === 'alliance' ? (
                      (!state.allianceChat || state.allianceChat.length === 0) ? (
                        <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                          İttifak kanalında henüz mesaj yok.
                        </div>
                      ) : (
                        (state.allianceChat as any[]).map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col max-w-[75%]">
                              {msg.role !== 'user' && <span className="text-[10px] text-neutral-500 ml-1 mb-1">{state.nations[msg.nationId]?.name}</span>}
                              <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-neutral-800 text-neutral-200 rounded-bl-sm border border-neutral-700'}`}>
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      (!state.chatHistories[activeChatNationId] || state.chatHistories[activeChatNationId].length === 0) ? (
                        <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                          Bu ülkeyle henüz bir iletişiminiz olmadı. Aşağıdan ilk mesajı gönderin.
                        </div>
                      ) : (
                        (state.chatHistories[activeChatNationId] as any[]).map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-neutral-800 text-neutral-200 rounded-bl-sm border border-neutral-700'}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-neutral-950 border-t border-neutral-800">
                    <form onSubmit={handleModalSendMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={modalChatMessage}
                        onChange={(e) => setModalChatMessage(e.target.value)}
                        placeholder="Mesaj yazın..."
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-neutral-100"
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !modalChatMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center flex-shrink-0"
                      >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p>Mesajlaşmak için sol taraftan bir ülke seçin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Tech Tree Modal */}
      {isTechTreeOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-4 bg-neutral-950 rounded-t-xl">
              <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                <FlaskConical size={20} className="text-purple-400" />
                Teknoloji Ağacı
              </h2>
              <button onClick={() => setIsTechTreeOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-center gap-6 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 uppercase">Mevcut Altın</span>
                  <span className="text-lg font-mono text-yellow-500 flex items-center gap-1"><Coins size={16}/> {player.gold}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 uppercase">Mevcut Laboratuvar</span>
                  <span className="text-lg font-mono text-purple-400 flex items-center gap-1"><FlaskConical size={16}/> {player.labs}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(TECHNOLOGIES).map(tech => {
                  const isResearched = player.technologies.includes(tech.id);
                  const canAfford = player.gold >= tech.costGold && player.labs >= tech.costLabs;
                  const hasPrereqs = tech.prerequisites.every(prereq => player.technologies.includes(prereq));
                  const isAvailable = !isResearched && hasPrereqs;

                  return (
                    <div 
                      key={tech.id} 
                      className={`p-4 rounded-xl border ${
                        isResearched ? 'bg-purple-900/20 border-purple-500/50' : 
                        isAvailable ? 'bg-neutral-800 border-neutral-600 hover:border-purple-400 transition-colors' : 
                        'bg-neutral-950 border-neutral-800 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-neutral-200 flex items-center gap-2">
                          {isResearched && <Check size={16} className="text-purple-400" />}
                          {tech.name}
                        </h3>
                        {!isResearched && (
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className={player.gold >= tech.costGold ? 'text-yellow-500' : 'text-red-400'}>
                              {tech.costGold} Altın
                            </span>
                            <span className={player.labs >= tech.costLabs ? 'text-purple-400' : 'text-red-400'}>
                              {tech.costLabs} Lab
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 mb-3">{tech.description}</p>
                      <div className="text-xs text-neutral-300 bg-neutral-900 p-2 rounded mb-3 border border-neutral-800">
                        <span className="text-neutral-500">Etki:</span> {tech.effect}
                      </div>
                      
                      {!isResearched && tech.prerequisites.length > 0 && (
                        <div className="text-xs text-neutral-500 mb-3">
                          Gereksinimler: {tech.prerequisites.map(p => TECHNOLOGIES[p].name).join(', ')}
                        </div>
                      )}

                      {!isResearched && (
                        <button
                          onClick={() => handleResearchTech(tech.id)}
                          disabled={!isAvailable || !canAfford || isProcessing}
                          className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                            isAvailable && canAfford 
                              ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          {!hasPrereqs ? 'Gereksinimler Karşılanmadı' : 
                           !canAfford ? 'Yetersiz Kaynak' : 
                           'Araştır (Sıraya Ekle)'}
                        </button>
                      )}
                      {isResearched && (
                        <div className="w-full py-2 text-center text-sm font-medium text-purple-400 bg-purple-900/20 rounded">
                          Araştırıldı
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chronicles Modal */}
      {isChroniclesOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-4 bg-neutral-950 rounded-t-xl">
              <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                <Globe size={20} className="text-blue-400" />
                Dünya Gazetesi (Tur {state.turn})
              </h2>
              <button onClick={() => setIsChroniclesOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-neutral-800 bg-neutral-950 px-4">
              <button 
                onClick={() => setChronicleTab('global')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${chronicleTab === 'global' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
              >
                <Newspaper size={16} /> Küresel Haberler
              </button>
              <button 
                onClick={() => setChronicleTab('national')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${chronicleTab === 'national' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
              >
                <Flag size={16} /> Ulusal Olaylar (Gizli)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chronicleTab === 'global' && state.globalSummaries && state.globalSummaries.length > 0 && (
                 <div className="mb-6 bg-blue-900/10 border border-blue-500/30 rounded-lg p-5">
                   <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                     <AlertCircle size={18} /> Yapay Zeka Küresel Analiz Raporu
                   </h3>
                   <div className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
                     {state.globalSummaries[0].summary}
                   </div>
                 </div>
              )}
              {activeLogs.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  {chronicleTab === 'global' ? "Dünya genelinde bu tur önemli bir olay rapor edilmedi." : "Ülkenize ait herhangi bir operasyon veya olay bulunamadı."}
                </div>
              ) : (
                activeLogs.map((log, i) => {
                  let borderColor = 'border-neutral-700';
                  let icon = null;
                  if (log.startsWith('DİPLOMASİ:')) { borderColor = 'border-blue-500'; icon = <Handshake size={14} className="text-blue-500 mt-0.5 shrink-0" />; }
                  else if (log.startsWith('FETHİ:')) { borderColor = 'border-green-500'; icon = <Flag size={14} className="text-green-500 mt-0.5 shrink-0" />; }
                  else if (log.startsWith('İÇ KARIŞIKLIK:')) { borderColor = 'border-red-500'; icon = <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />; }
                  else if (log.startsWith('Savaş raporu:')) { borderColor = 'border-orange-500'; icon = <Swords size={14} className="text-orange-500 mt-0.5 shrink-0" />; }
                  else if (log.startsWith('GİZLİ OPERASYON:')) { borderColor = 'border-purple-500'; icon = <Users size={14} className="text-purple-500 mt-0.5 shrink-0" />; }
                  else if (log.startsWith('Araştırma')) { borderColor = 'border-purple-400'; icon = <FlaskConical size={14} className="text-purple-400 mt-0.5 shrink-0" />; }
                  
                  return (
                    <div key={i} className={`text-sm text-neutral-300 border-l-2 ${borderColor} pl-4 py-3 bg-neutral-900/80 rounded-r-lg flex gap-3 shadow-sm`}>
                      {icon}
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Economy Modal */}
      {isEconomyOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-4 bg-neutral-950 rounded-t-xl">
              <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                <BarChart2 size={20} className="text-green-400" />
                Ekonomik Büyüme Karşılaştırması
              </h2>
              <button onClick={() => setIsEconomyOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-neutral-800 flex gap-4 bg-neutral-900/50">
              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1">1. Ülke</label>
                <select 
                  value={compareNation1} 
                  onChange={(e) => setCompareNation1(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {(Object.values(state.nations) as any[]).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1">2. Ülke (İsteğe Bağlı)</label>
                <select 
                  value={compareNation2} 
                  onChange={(e) => setCompareNation2(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Karşılaştırma Yok --</option>
                  {(Object.values(state.nations) as any[]).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 p-6 min-h-[400px]">
              <EconomyChart 
                nations={state.nations} 
                compareNations={compareNation2 ? [compareNation1, compareNation2] : [compareNation1]} 
              />
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[compareNation1, compareNation2].filter(Boolean).map(nationId => {
                  const n = state.nations[nationId];
                  if (!n) return null;
                  
                  // Faux indicators based on existing data
                  const gdpPerCapita = Math.floor((n.economy * 1000) / Math.max(1, n.manpower));
                  const inflationRate = Math.max(0.5, 15 - Math.floor(n.stability / 10)).toFixed(1);
                  const tradeBalance = Math.floor((n.economy / 2) - (n.army * 0.1));
                  
                  return (
                    <div key={n.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: n.color}}></div>
                         <h4 className="font-bold text-neutral-200">{n.name} Ekonomik Göstergeler</h4>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-neutral-400">Kişi Başına GSYH:</span>
                           <span className="font-mono text-green-400">${gdpPerCapita}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-neutral-400">Enflasyon Oranı:</span>
                           <span className={`font-mono ${parseFloat(inflationRate) > 8 ? 'text-red-400' : 'text-yellow-400'}`}>%{inflationRate}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-neutral-400">Ticaret Dengesi:</span>
                           <span className={`font-mono ${tradeBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {tradeBalance >= 0 ? '+' : ''}{tradeBalance} Milyar
                           </span>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 w-full max-w-md rounded-xl border border-neutral-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 rounded-t-xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shield size={20} className="text-blue-400" />
                Dış Politika ve Ayarlar
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Dış Politika Duruşu</label>
                <select
                  value={state.playerPolicy || 'balanced'}
                  onChange={(e) => setPlayerPolicy(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="balanced">Dengeli (Varsayılan)</option>
                  <option value="aggressive">Agresif (Saldırgan ve Yayılmacı)</option>
                  <option value="defensive">Savunmacı (Korumacı)</option>
                  <option value="isolationist">İzolasyonist (Tarafsız ve Dışa Kapalı)</option>
                </select>
                <p className="text-xs text-neutral-500 mt-2">Bu seçim, yapay zekanın size karşı olan diplomatik tutumunu ve barış/savaş kararlarını etkiler.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-neutral-800 flex justify-end bg-neutral-950 rounded-b-xl">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 w-full max-w-4xl max-h-[85vh] rounded-xl border border-neutral-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 rounded-t-xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle size={20} className="text-yellow-400" />
                Nasıl Oynanır?
              </h2>
              <button onClick={() => setIsHelpOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <Globe className="text-blue-400" /> Pax Historia'ya Hoş Geldiniz
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  Pax Historia, doğal dille komut vererek bir ülkeyi yönettiğiniz yenilikçi bir büyük strateji oyunudur. 
                  Yapay zeka, verdiğiniz her komutu yorumlar, maliyetini hesaplar ve dünya düzeni üzerindeki etkisini belirler.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Coins size={16} className="text-yellow-400" />
                    Ekonomi ve İnsan Gücü
                  </h4>
                  <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                    <li><strong>Hazine:</strong> Fabrika kurmak, araştırma yapmak ve ordu basmak için kullanılır. Her tur "Ekonomi" puanınız kadar artar.</li>
                    <li><strong>İnsan Gücü:</strong> Asker yetiştirmek ve projeler için gereklidir. "İstikrar" seviyenize bağlı olarak artar.</li>
                    <li><strong>Büyüklük:</strong> Yeni fabrikalar, ticaret anlaşmaları ve teknolojiler ekonominizi büyütür.</li>
                  </ul>
                </div>

                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Swords size={16} className="text-red-400" />
                    Savaş ve Askeriye
                  </h4>
                  <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                    <li><strong>Asker Alımı:</strong> "100 asker bas" gibi komutlarla ordunuzu büyütebilirsiniz.</li>
                    <li><strong>Savaş İlanı:</strong> Diplomatik görüşmeler sırasında savaş ilan edebilir veya komut satırından askeri harekat emri verebilirsiniz.</li>
                    <li><strong>Toprak Fethi:</strong> Savaşlarda rakibinizin şehirlerini ve bölgelerini ele geçirebilirsiniz.</li>
                  </ul>
                </div>

                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Handshake size={16} className="text-blue-400" />
                    Diplomasi ve İstihbarat
                  </h4>
                  <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                    <li><strong>Mesajlaşma:</strong> Sağ alt köşedeki mesaj panelinden diğer ülkelere teklifler sunun.</li>
                    <li><strong>İttifaklar:</strong> İttifak kurduğunuz ülkeler olası savaşlarda arkanızda durur.</li>
                    <li><strong>Gizli Operasyonlar:</strong> Komut satırından rakip ülkelerde propaganda, ayaklanma, sabotaj gibi ajanlık faaliyetleri yürütebilir, istikrarlarını düşürebilirsiniz. İstikrarı 20'nin altına düşen ülkeler çöküş yaşar.</li>
                  </ul>
                </div>

                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <FlaskConical size={16} className="text-purple-400" />
                    Teknoloji Ağacı
                  </h4>
                  <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                    <li><strong>Laboratuvarlar:</strong> Araştırma yapabilmek için "Laboratuvar inşa et" komutu ile lab sayınızı artırmalısınız.</li>
                    <li><strong>Sıraya Alma:</strong> "Teknoloji Ağacı" menüsünden istediğiniz teknolojiyi araştırma sırasına ekleyebilirsiniz. Gerekli altın ve lab sağlandığında sırayla araştırılırlar.</li>
                  </ul>
                </div>

                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-green-400" />
                    Dünya Haritası ve Tesisler
                  </h4>
                  <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                    <li><strong>Önemli Kaynak / Tesisler:</strong> Haritada mor renkli elmas (♦) şeklinde görünür. Bu özel bölgeleri ele geçirmek, normal şehirlere göre çok daha yüksek ekonomik bonus (+10~25) ve ganimet sağlar. Stratejik öncelik tanıyın!</li>
                  </ul>
                </div>
              </div>

              <section>
                <h3 className="text-xl font-bold text-white mb-3 border-b border-neutral-800 pb-2">Örnek Komutlar</h3>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 font-mono text-sm text-neutral-400 space-y-2">
                  <p>"İstanbul'da yeni bir silah fabrikası kur"</p>
                  <p>"Suriye sınırındaki birlikleri güçlendir ve 500 asker daha topla"</p>
                  <p>"Yunanistan'da halkı hükümete karşı kışkırtmak için propaganda başlat"</p>
                  <p>"Tarım arazilerini modernize et"</p>
                  <p>"Vergileri düşür ve halkı memnun et"</p>
                </div>
                <p className="text-xs text-neutral-500 mt-2 italic">* Komutlarınızı yazıp Enter'a basarak sıraya alın ve 'Turu Bitir' ile uygulayın.</p>
              </section>
            </div>
            
            <div className="p-4 border-t border-neutral-800 flex justify-end bg-neutral-950 rounded-b-xl">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
