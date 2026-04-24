import { useState, useCallback } from 'react';
import { GameState, INITIAL_STATE, Nation, WarReport } from './types';
import { getAITurnActions, evaluatePeaceOffer, chatWithNationAI, evaluatePlayerAction, generateWarReport, generateDiplomaticEvents, generateGlobalSummaryReport } from '../services/aiService';
import { TECHNOLOGIES } from './technologies';

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingActions, setPendingActions] = useState<string[]>([""]);
  const [showWarReport, setShowWarReport] = useState<WarReport | null>(null);

  const addLog = (message: string) => {
    setState((prev) => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, 50),
    }));
  };

  const setPendingActionsState = (actions: string[]) => {
    setPendingActions(actions);
  };

  const setPlayerPolicy = (policy: 'aggressive' | 'defensive' | 'isolationist' | 'balanced') => {
    setState(prev => ({ ...prev, playerPolicy: policy }));
  };

  const declareWar = (targetId: string) => {
    setState((prev) => {
      const player = prev.nations[prev.playerNationId];
      const target = prev.nations[targetId];
      if (player.atWarWith.includes(targetId)) return prev;

      const history = prev.chatHistories[targetId] || [];

      return {
        ...prev,
        nations: {
          ...prev.nations,
          [player.id]: {
            ...player,
            atWarWith: [...player.atWarWith, targetId],
            relations: { ...player.relations, [targetId]: -100 },
          },
          [targetId]: {
            ...target,
            atWarWith: [...target.atWarWith, player.id],
            relations: { ...target.relations, [player.id]: -100 },
          },
        },
        logs: [`${target.name} adlı ulusa savaş ilan ettiniz!`, ...prev.logs].slice(0, 50),
        chatHistories: {
          ...prev.chatHistories,
          [targetId]: [
            ...history,
            { role: 'user', text: 'Söz bitti, kılıçlar konuşacak! Size savaş ilan ediyorum.' },
            { role: 'model', text: 'Ordularımız sizi ezmek için sabırsızlanıyor. Savaş alanında görüşürüz!' }
          ]
        }
      };
    });
  };

  const formAlliance = (targetId: string) => {
    setState(prev => {
      const player = prev.nations[prev.playerNationId];
      const target = prev.nations[targetId];
      if (player.allies.includes(targetId)) return prev;
      
      const history = prev.chatHistories[targetId] || [];
      
      return {
        ...prev,
        nations: {
          ...prev.nations,
          [player.id]: { ...player, allies: [...player.allies, targetId] },
          [targetId]: { ...target, allies: [...target.allies, player.id] }
        },
        logs: [`DİPLOMASİ: ${target.name} ile ittifak kuruldu!`, ...prev.logs].slice(0, 50),
        chatHistories: {
          ...prev.chatHistories,
          [targetId]: [
            ...history,
            { role: 'user', text: 'Halklarımız arasında sarsılmaz bir ittifak kuralım.' },
            { role: 'model', text: 'Teklifinizi onurla kabul ediyoruz. Birlikte daha güçlüyüz!' }
          ]
        }
      };
    });
  };

  const makeTradeAgreement = (targetId: string) => {
    setState(prev => {
      const player = prev.nations[prev.playerNationId];
      const target = prev.nations[targetId];
      
      if (player.gold < 20) return prev;
      
      const history = prev.chatHistories[targetId] || [];
      
      return {
        ...prev,
        nations: {
          ...prev.nations,
          [player.id]: { ...player, gold: player.gold - 20, economy: player.economy + 5 },
          [targetId]: { ...target, economy: target.economy + 5 }
        },
        logs: [`TİCARET: ${target.name} ile ticaret anlaşması yapıldı. Ekonomiler güçlendi.`, ...prev.logs].slice(0, 50),
        chatHistories: {
          ...prev.chatHistories,
          [targetId]: [
            ...history,
            { role: 'user', text: 'Karşılıklı refahımız için bir ticaret anlaşması imzalayalım. (20 altın yatırım)' },
            { role: 'model', text: 'Kervanlarımız yola çıktı bile. Bu anlaşma iki ülkeyi de zenginleştirecek.' }
          ]
        }
      };
    });
  };

  const makePeace = async (targetId: string) => {
    const player = state.nations[state.playerNationId];
    const target = state.nations[targetId];
    
    if (!player.atWarWith.includes(targetId)) return;
    if (player.gold < 20) {
      addLog(`Barış elçisi göndermek için 20 altın gerekiyor.`);
      return;
    }

    setIsProcessing(true);
    
    // Deduct 20 gold for the envoy
    setState(prev => ({
      ...prev,
      nations: {
        ...prev.nations,
        [player.id]: { ...prev.nations[player.id], gold: prev.nations[player.id].gold - 20 }
      },
      logs: [`${target.name} ülkesine barış elçisi gönderildi (20 altın).`, ...prev.logs].slice(0, 50)
    }));

    const response = await evaluatePeaceOffer(player, target, state.playerPolicy);
    
    setState(prev => {
      const p = prev.nations[player.id];
      const t = prev.nations[targetId];
      
      if (response.accepts) {
        return {
          ...prev,
          nations: {
            ...prev.nations,
            [p.id]: {
              ...p,
              atWarWith: p.atWarWith.filter(id => id !== targetId),
              relations: { ...p.relations, [targetId]: 0 }
            },
            [t.id]: {
              ...t,
              atWarWith: t.atWarWith.filter(id => id !== p.id),
              relations: { ...t.relations, [p.id]: 0 }
            }
          },
          logs: [`${target.name} barış teklifini KABUL ETTİ: "${response.reasoning}"`, ...prev.logs].slice(0, 50)
        };
      } else {
        return {
          ...prev,
          logs: [`${target.name} barış teklifini REDDETTİ: "${response.reasoning}"`, ...prev.logs].slice(0, 50)
        };
      }
    });
    
    setIsProcessing(false);
  };

  const sendMessage = async (targetId: string, message: string) => {
    setIsProcessing(true);
    
    if (targetId === 'alliance') {
      setState(prev => ({
        ...prev,
        allianceChat: [...(prev.allianceChat || []), { role: 'user', text: message, nationId: prev.playerNationId }]
      }));
      
      const player = state.nations[state.playerNationId];
      if (player.allies.length > 0) {
        // Pick a random ally to respond
        const randomAllyId = player.allies[Math.floor(Math.random() * player.allies.length)];
        const ally = state.nations[randomAllyId];
        
        // Simple mock response for now
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            allianceChat: [...(prev.allianceChat || []), { role: 'model', text: `Anlaşıldı, müttefik. ${message.length > 20 ? 'Bu konuyu değerlendireceğiz.' : 'Yanınızdayız.'}`, nationId: randomAllyId }]
          }));
          setIsProcessing(false);
        }, 1000);
      } else {
        setIsProcessing(false);
      }
      return;
    }

    setState(prev => {
      const history = prev.chatHistories[targetId] || [];
      return {
        ...prev,
        chatHistories: {
          ...prev.chatHistories,
          [targetId]: [...history, { role: 'user', text: message }]
        }
      };
    });

    const player = state.nations[state.playerNationId];
    const target = state.nations[targetId];
    const history = state.chatHistories[targetId] || [];

    const response = await chatWithNationAI(player, target, message, history);

    setState(prev => {
      const newHistory = prev.chatHistories[targetId] || [];
      let nextState = {
        ...prev,
        chatHistories: {
          ...prev.chatHistories,
          [targetId]: [...newHistory, { role: 'model', text: response.text }]
        }
      };

      // Handle Tool Calls
      response.toolCalls.forEach(tool => {
        if (tool.name === 'make_peace') {
          nextState.nations[player.id].atWarWith = nextState.nations[player.id].atWarWith.filter(id => id !== targetId);
          nextState.nations[targetId].atWarWith = nextState.nations[targetId].atWarWith.filter(id => id !== player.id);
          nextState.logs = [`DİPLOMASİ: ${target.name} ile barış yapıldı!`, ...nextState.logs].slice(0, 50);
        } else if (tool.name === 'declare_war') {
          if (!nextState.nations[player.id].atWarWith.includes(targetId)) {
            nextState.nations[player.id].atWarWith.push(targetId);
            nextState.nations[targetId].atWarWith.push(player.id);
            nextState.logs = [`DİPLOMASİ: ${target.name} size savaş ilan etti!`, ...nextState.logs].slice(0, 50);
          }
        } else if (tool.name === 'trade_gold') {
          const amount = Number(tool.args.amount);
          if (amount > 0) {
            // AI gives gold to player
            if (nextState.nations[targetId].gold >= amount) {
              nextState.nations[targetId].gold -= amount;
              nextState.nations[player.id].gold += amount;
              nextState.logs = [`TİCARET: ${target.name} size ${amount} altın gönderdi.`, ...nextState.logs].slice(0, 50);
            }
          } else if (amount < 0) {
            // AI takes gold from player
            const absAmount = Math.abs(amount);
            if (nextState.nations[player.id].gold >= absAmount) {
              nextState.nations[player.id].gold -= absAmount;
              nextState.nations[targetId].gold += absAmount;
              nextState.logs = [`TİCARET: ${target.name} sizden ${absAmount} altın aldı.`, ...nextState.logs].slice(0, 50);
            }
          }
        }
      });

      return nextState;
    });

    setIsProcessing(false);
  };

  const endTurn = async () => {
    setIsProcessing(true);
    
    let intermediateState = { ...state };
    let newLogs = [...intermediateState.logs];
    const newNations = { ...intermediateState.nations };
    const newTerritories = { ...intermediateState.territories };
    const player = newNations[intermediateState.playerNationId];

    // 0. Evaluate Pending Player Actions
    const validActions = pendingActions.filter(a => a.trim().length > 0);
    for (const actionText of validActions) {
      if (actionText.startsWith('Araştır: ')) {
        const techId = actionText.replace('Araştır: ', '').trim();
        const tech = TECHNOLOGIES[techId];
        if (tech) {
          if (!newNations[player.id].researchQueue) {
             newNations[player.id].researchQueue = [];
          }
          if (!newNations[player.id].researchQueue.includes(techId) && !newNations[player.id].technologies.includes(techId)) {
             newNations[player.id].researchQueue.push(techId);
             newLogs.unshift(`Araştırma Sırasına Eklendi: ${tech.name}`);
          }
        }
        continue;
      }

      const evalResult = await evaluatePlayerAction(actionText, player);
      if (!evalResult.isRealistic) {
        newLogs.unshift(`Emir Başarısız: ${evalResult.reasoning}`);
      } else {
        if (player.gold >= evalResult.costGold && player.manpower >= evalResult.costManpower) {
          newNations[player.id].gold -= evalResult.costGold;
          newNations[player.id].manpower -= evalResult.costManpower;
          newNations[player.id].economy += evalResult.effectEconomy || 0;
          newNations[player.id].army += evalResult.effectArmy || 0;
          newNations[player.id].stability += evalResult.effectStability || 0;

          if (evalResult.effectMilitaryDetails) {
            newNations[player.id].militaryDetails = {
              infantry: (newNations[player.id].militaryDetails?.infantry || 0) + (evalResult.effectMilitaryDetails.infantry || 0),
              armored: (newNations[player.id].militaryDetails?.armored || 0) + (evalResult.effectMilitaryDetails.armored || 0),
              airForce: (newNations[player.id].militaryDetails?.airForce || 0) + (evalResult.effectMilitaryDetails.airForce || 0),
              navy: (newNations[player.id].militaryDetails?.navy || 0) + (evalResult.effectMilitaryDetails.navy || 0),
            };
          }

          if (evalResult.espionageResults && evalResult.targetNationId && newNations[evalResult.targetNationId]) {
             if (!newNations[player.id].intel) newNations[player.id].intel = {};
             // Ensure nation intel entry exists
             if (!newNations[player.id].intel![evalResult.targetNationId]) newNations[player.id].intel![evalResult.targetNationId] = {};
             
             const targetToSpy = newNations[evalResult.targetNationId];
             
             if (evalResult.espionageResults.intelRevealed) {
                newNations[player.id].intel![evalResult.targetNationId] = {
                  ...newNations[player.id].intel![evalResult.targetNationId],
                  lastUpdatedTurn: intermediateState.turn,
                  estimatedGold: targetToSpy.gold,
                  estimatedEconomy: targetToSpy.economy,
                  estimatedStability: targetToSpy.stability,
                  technologies: [...targetToSpy.technologies]
                };
             }
             if (evalResult.espionageResults.stolenGold) {
                const stolen = Math.min(targetToSpy.gold, evalResult.espionageResults.stolenGold);
                newNations[evalResult.targetNationId].gold -= stolen;
                newNations[player.id].gold += stolen;
                newLogs.unshift(`GİZLİ OPERASYON: ${targetToSpy.name} hazinesinden ${stolen} altın çalındı!`);
             }
             if (evalResult.espionageResults.stolenTech && targetToSpy.technologies.length > 0) {
                const randomTech = targetToSpy.technologies[Math.floor(Math.random() * targetToSpy.technologies.length)];
                if (!newNations[player.id].technologies.includes(randomTech)) {
                  newNations[player.id].technologies.push(randomTech);
                  newLogs.unshift(`GİZLİ OPERASYON: ${targetToSpy.name} laboratuvarlarından teknoloji çalındı!`);
                }
             }
          }
          
          if (evalResult.effectTargetStability && evalResult.targetNationId && newNations[evalResult.targetNationId]) {
            newNations[evalResult.targetNationId].stability += evalResult.effectTargetStability;
            newLogs.unshift(`GİZLİ OPERASYON: ${newNations[evalResult.targetNationId].name} ülkesinde istikrar değişimi: ${evalResult.effectTargetStability}`);
          }
          
          if (evalResult.effectLabs) {
            newNations[player.id].labs = (newNations[player.id].labs || 0) + evalResult.effectLabs;
          }
          if (evalResult.unlockedTech) {
            newNations[player.id].technologies = [...(newNations[player.id].technologies || []), evalResult.unlockedTech];
          }

          newLogs.unshift(`Emir Başarılı: ${evalResult.constructionName} inşa edildi/uygulandı. ${evalResult.reasoning}`);
        } else {
          newLogs.unshift(`Emir Yarım Kaldı: ${evalResult.constructionName} için kaynak yetersiz! (Gereken: ${evalResult.costGold}a, ${evalResult.costManpower}i)`);
        }
      }
    }
    setPendingActions([""]);

    // Process Research Queue
    Object.values(newNations).forEach((nation: Nation) => {
        if (nation.researchQueue && nation.researchQueue.length > 0) {
            const nextTechId = nation.researchQueue[0];
            const tech = TECHNOLOGIES[nextTechId];
            if (tech && nation.gold >= tech.costGold && nation.labs >= tech.costLabs) {
                // Determine if prerequisites are met
                const hasPrereqs = tech.prerequisites.every(p => nation.technologies.includes(p));
                if (hasPrereqs) {
                    nation.gold -= tech.costGold;
                    nation.technologies = [...nation.technologies, tech.id];
                    nation.researchQueue.shift(); // Remove from queue

                    // Apply static numeric effects
                    if (tech.id === 'tech_infantry_1') nation.army += 500;
                    else if (tech.id === 'tech_cyber_1') nation.stability += 5;
                    else if (tech.id === 'tech_drone_1') nation.army += 1000;
                    else if (tech.id === 'tech_economy_1') nation.economy += 20;
                    else if (tech.id === 'tech_ai_1') { nation.economy += 30; nation.army += 500; }
                    else if (tech.id === 'tech_nuclear_1') { nation.stability += 10; nation.army += 2000; }

                    if (nation.isPlayer) {
                        newLogs.unshift(`Araştırma Tamamlandı: ${tech.name}. ${tech.effect}`);
                    }
                }
            } else if (tech && nation.isPlayer) {
                // If the player doesn't have enough resources, maybe just keep waiting, don't spam the logs every turn
            }
        }
    });

    // 1. Economy, Manpower Growth & Stability Checks
    Object.values(newNations).forEach((nation: Nation) => {
      let currentStability = nation.stability;
      
      // Check for regime change / dissolution if stability is critically low
      if (currentStability < 20) {
        newLogs.unshift(`İÇ KARIŞIKLIK: ${nation.name} ülkesinde istikrar çok düştü! Hükümet devrildi ve yeni bir yönetim başa geçti.`);
        currentStability = 60; // Reset stability after regime change
        newNations[nation.id].army = Math.floor(nation.army * 0.5); // Lose half army in civil war
        newNations[nation.id].gold = Math.floor(nation.gold * 0.5); // Lose half gold
        
        // End all wars due to internal collapse
        newNations[nation.id].atWarWith.forEach(enemyId => {
          if (newNations[enemyId]) {
            newNations[enemyId].atWarWith = newNations[enemyId].atWarWith.filter(id => id !== nation.id);
          }
        });
        newNations[nation.id].atWarWith = [];
      }

      newNations[nation.id] = {
        ...nation,
        gold: nation.gold + nation.economy,
        manpower: nation.manpower + Math.floor(currentStability / 2),
        stability: currentStability,
        economyHistory: [...(nation.economyHistory || [nation.economy]), nation.economy],
      };
    });

    // 2. Resolve Wars
    const resolvedPairs = new Set<string>();
    let playerBattles: { enemy: Nation, pCas: number, eCas: number, conquered: string[], conqueredCities: string[] }[] = [];

    Object.values(newNations).forEach((nation: Nation) => {
      nation.atWarWith.forEach((enemyId) => {
        const pairId = [nation.id, enemyId].sort().join('-');
        if (resolvedPairs.has(pairId)) return;
        resolvedPairs.add(pairId);

        const enemy = newNations[enemyId];
        
        const nationCasualties = Math.floor((enemy.army * (0.1 + Math.random() * 0.2)));
        const enemyCasualties = Math.floor((nation.army * (0.1 + Math.random() * 0.2)));

        newNations[nation.id].army = Math.max(0, nation.army - nationCasualties);
        newNations[enemyId].army = Math.max(0, enemy.army - enemyCasualties);

        let conqueredTerritory = null;

        // Conquest Logic
        const nationRatio = nation.army / Math.max(1, enemy.army);
        const enemyRatio = enemy.army / Math.max(1, nation.army);

        if (nationRatio > 1.5 && Math.random() > 0.4) {
          const enemyLands = Object.entries(newTerritories).filter(([_, data]: [string, any]) => data.owner === enemyId);
          if (enemyLands.length > 0) {
            conqueredTerritory = enemyLands[Math.floor(Math.random() * enemyLands.length)][0];
            newTerritories[conqueredTerritory] = { ...newTerritories[conqueredTerritory], owner: nation.id };
            
            // Resource loss
            const goldLost = Math.floor(enemy.gold * 0.15);
            newNations[enemyId].gold = Math.max(0, enemy.gold - goldLost);
            newNations[nation.id].gold += goldLost;

            newLogs.unshift(`FETHİ: ${nation.name}, ${enemy.name} topraklarından ${conqueredTerritory.split('_').slice(1).join('_') || conqueredTerritory} bölgesini ele geçirdi! ${goldLost} altın ele geçirildi.`);
            
            if (nation.isPlayer || enemy.isPlayer) {
              let battleData = playerBattles.find(b => b.enemy.id === (nation.isPlayer ? enemyId : nation.id));
              if (!battleData) {
                battleData = { enemy: nation.isPlayer ? enemy : nation, pCas: 0, eCas: 0, conquered: [], conqueredCities: [] };
                playerBattles.push(battleData);
              }
              battleData.conquered.push(conqueredTerritory);
            }
          }
        } else if (enemyRatio > 1.5 && Math.random() > 0.4) {
          const nationLands = Object.entries(newTerritories).filter(([_, data]: [string, any]) => data.owner === nation.id);
          if (nationLands.length > 0) {
            conqueredTerritory = nationLands[Math.floor(Math.random() * nationLands.length)][0];
            newTerritories[conqueredTerritory] = { ...newTerritories[conqueredTerritory], owner: enemyId };
            
            // Resource loss
            const goldLost = Math.floor(nation.gold * 0.15);
            newNations[nation.id].gold = Math.max(0, nation.gold - goldLost);
            newNations[enemyId].gold += goldLost;

            newLogs.unshift(`FETHİ: ${enemy.name}, ${nation.name} topraklarından ${conqueredTerritory.split('_').slice(1).join('_') || conqueredTerritory} bölgesini ele geçirdi. ${goldLost} altın kaybedildi.`);
            
            if (nation.isPlayer || enemy.isPlayer) {
              let battleData = playerBattles.find(b => b.enemy.id === (nation.isPlayer ? enemyId : nation.id));
              if (!battleData) {
                battleData = { enemy: nation.isPlayer ? enemy : nation, pCas: 0, eCas: 0, conquered: [], conqueredCities: [] };
                playerBattles.push(battleData);
              }
              battleData.conquered.push(conqueredTerritory);
            }
          }
        }

        if (nation.isPlayer || enemy.isPlayer) {
          newLogs.unshift(`Savaş raporu: ${nation.name} ${nationCasualties} asker kaybetti, ${enemy.name} ${enemyCasualties} asker kaybetti.`);
          
          const isPlayerNation = nation.isPlayer;
          const pCas = isPlayerNation ? nationCasualties : enemyCasualties;
          const eCas = isPlayerNation ? enemyCasualties : nationCasualties;
          const enemyObj = isPlayerNation ? enemy : nation;
          
          let battleData = playerBattles.find(b => b.enemy.id === enemyObj.id);
          if (!battleData) {
            battleData = { enemy: enemyObj, pCas: 0, eCas: 0, conquered: [], conqueredCities: [] };
            playerBattles.push(battleData);
          }
          battleData.pCas += pCas;
          battleData.eCas += eCas;
        }
      });
    });

    intermediateState.nations = newNations;
    intermediateState.territories = newTerritories;
    intermediateState.turn += 1;

    // Generate War Report if player was involved in a battle
    if (playerBattles.length > 0) {
      const reportData = await generateWarReport(player, playerBattles);
      
      const allCasualties: Record<string, number> = { [player.id]: 0 };
      const allConqueredTerritories: string[] = [];
      const allConqueredCities: string[] = [];
      
      playerBattles.forEach(b => {
        allCasualties[player.id] += b.pCas;
        allCasualties[b.enemy.id] = (allCasualties[b.enemy.id] || 0) + b.eCas;
        allConqueredTerritories.push(...b.conquered);
        allConqueredCities.push(...b.conqueredCities);
      });

      const fullReport: WarReport = {
        id: Date.now().toString(),
        turn: intermediateState.turn,
        title: reportData.title,
        description: reportData.description,
        tacticalAnalysis: reportData.tacticalAnalysis,
        casualties: allCasualties,
        conqueredTerritories: allConqueredTerritories,
        conqueredCities: allConqueredCities
      };
      intermediateState.warReports = [fullReport, ...intermediateState.warReports];
      setShowWarReport(fullReport);
    }

    intermediateState.logs = newLogs;

    // 3. AI Actions
    const aiActions = await getAITurnActions(intermediateState);
    const newWars: { attacker: string, defender: string }[] = [];
    
    aiActions.forEach((actionObj: any) => {
      const nation = newNations[actionObj.nationId];
      if (!nation || nation.isPlayer) return;

      if (actionObj.action === 'invest' && nation.gold >= 50) {
        nation.gold -= 50;
        nation.economy += 5;
      } else if (actionObj.action === 'recruit' && nation.gold >= 30 && nation.manpower >= 100) {
        nation.gold -= 30;
        nation.manpower -= 100;
        nation.army += 100;
      } else if (actionObj.action === 'declare_war' && actionObj.targetId) {
        const target = newNations[actionObj.targetId];
        if (target && !nation.atWarWith.includes(target.id)) {
          nation.atWarWith.push(target.id);
          target.atWarWith.push(nation.id);
          newWars.push({ attacker: nation.id, defender: target.id });
          newLogs.unshift(`DİPLOMASİ: ${nation.name}, ${target.name} ülkesine savaş ilan etti! Sebep: ${actionObj.reasoning}`);
        }
      } else if (actionObj.action === 'send_message' && actionObj.targetId && actionObj.messageText) {
        if (actionObj.targetId === intermediateState.playerNationId) {
          const history = intermediateState.chatHistories[nation.id] || [];
          intermediateState.chatHistories[nation.id] = [...history, { role: 'model', text: actionObj.messageText }];
          intermediateState.unreadMessages[nation.id] = true;
          newLogs.unshift(`DİPLOMASİ: ${nation.name} size bir mesaj gönderdi! (Sohbet panelinden kontrol edin)`);
        }
      } else if (actionObj.action === 'espionage' && actionObj.targetId && nation.gold >= 100) {
        const target = newNations[actionObj.targetId];
        if (target) {
          nation.gold -= 100;
          const stabilityHit = Math.floor(Math.random() * 10) + 5; // 5-15 stability damage
          target.stability -= stabilityHit;
          // Only show in logs if the target is player or player's ally, otherwise keep it secret
          if (target.id === intermediateState.playerNationId || newNations[intermediateState.playerNationId].allies.includes(target.id)) {
            newLogs.unshift(`İSTİHBARAT: ${target.name} ülkesinde kaynağı belirsiz bir istikrarsızlık veya sabotaj eylemi gerçekleşti! (İstikrar -${stabilityHit})`);
          }
        }
      }
    });

    // 4. AI Intervention in New Wars
    newWars.forEach(war => {
      const attacker = newNations[war.attacker];
      const defender = newNations[war.defender];
      
      Object.values(newNations).forEach((thirdParty: Nation) => {
        if (thirdParty.id === attacker.id || thirdParty.id === defender.id || thirdParty.isPlayer) return;
        
        // If third party likes defender and dislikes attacker, they might intervene
        const relWithDefender = thirdParty.relations[defender.id] || 0;
        const relWithAttacker = thirdParty.relations[attacker.id] || 0;
        
        if (relWithDefender > 50 && relWithAttacker < 0 && !thirdParty.atWarWith.includes(attacker.id)) {
          thirdParty.atWarWith.push(attacker.id);
          attacker.atWarWith.push(thirdParty.id);
          newLogs.unshift(`DİPLOMASİ: ${thirdParty.name}, müttefiki ${defender.name}'i korumak için ${attacker.name}'e savaş ilan etti!`);
        } else if (relWithDefender > 30 && Math.random() > 0.5) {
          newLogs.unshift(`DİPLOMASİ: ${thirdParty.name}, ${attacker.name}'in ${defender.name}'e yönelik saldırganlığını kınadı.`);
        }
      });
    });

    // 5. Diplomatic Events Generation
    const diplomaticEvents = await generateDiplomaticEvents(intermediateState);
    diplomaticEvents.forEach((event: any) => {
      newLogs.unshift(`KÜRESEL OLAY: ${event.title} - ${event.description}`);
      if (event.effectTarget) {
        if (event.effectTarget === 'all') {
          Object.values(newNations).forEach((n: Nation) => {
            if (event.effectType === 'stability') n.stability += event.effectAmount;
            if (event.effectType === 'economy') n.economy += event.effectAmount;
          });
        } else if (newNations[event.effectTarget]) {
           if (event.effectType === 'stability') newNations[event.effectTarget].stability += event.effectAmount;
           if (event.effectType === 'economy') newNations[event.effectTarget].economy += event.effectAmount;
        }
      }
    });

    // 6. Global Summary Report Generation
    const globalSummaryContent = await generateGlobalSummaryReport(intermediateState, newLogs.slice(0, 15));
    const newGlobalSummary = {
       turn: intermediateState.turn,
       summary: globalSummaryContent
    };

    setState({
      ...intermediateState,
      nations: newNations,
      logs: newLogs.slice(0, 50),
      globalSummaries: [newGlobalSummary, ...(intermediateState.globalSummaries || [])].slice(0, 10),
      turn: intermediateState.turn + 1
    });
    
    setIsProcessing(false);
  };

  const markMessageRead = (nationId: string) => {
    setState(prev => ({
      ...prev,
      unreadMessages: {
        ...prev.unreadMessages,
        [nationId]: false
      }
    }));
  };

  return {
    state,
    isProcessing,
    pendingActions,
    setPendingActions: setPendingActionsState,
    showWarReport,
    setShowWarReport,
    declareWar,
    formAlliance,
    makeTradeAgreement,
    makePeace,
    sendMessage,
    markMessageRead,
    endTurn,
    setPlayerPolicy,
  };
}
