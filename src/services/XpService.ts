export const getXpInfo = (userXp: number) => {

  const BASE_END = 100;
  const GROWTH_FACTOR = 1.1;
  const MAX_LEVEL = 100;

  let xp = Number(userXp);
  if (!Number.isFinite(xp) || xp < 0) xp = 0;
  xp = Math.floor(xp);

  // gera níveis até cobrir xp ou atingir MAX_LEVEL
  let level = 1;
  let start = 0;
  let end = Math.round(BASE_END);

  while (xp > end && level < MAX_LEVEL) {
    level += 1;
    start = end + 1;
    end = Math.round((end + 100) * GROWTH_FACTOR); //regra de crescimento para cada nível
  }

  // cálculos inteiros do nível atual
  const xpInLevel = Math.max(0, xp - start);          // XP obtido dentro do nível (pode ser > tamanho do nível quando overflow)
  const levelSize = end - start;                      // tamanho do nível (inteiro)
  const cappedXpInLevel = Math.min(xpInLevel, levelSize); // cap para cálculo de progress
  const xpToNext = (level === MAX_LEVEL && xp > end) ? 0 : Math.max(0, end - xp); // 0 se estiver além do level 100
  const progress = levelSize > 0 ? Math.floor((cappedXpInLevel * 100) / levelSize) : 100; // % inteiro 0..100

  return {
    level,      // nível atual (1..100)
    start,      // início do nível
    end,        // fim do nível
    xpToNext,   // quanto falta para fechar o nível atual
    progress    // progresso do nível atual em %
  };
};
