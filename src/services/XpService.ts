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

  /*
  Soma 100 ao fim do nível anterior;
  Multiplica por 1.1 (fator de crescimento de 10%);
  Arredonda para o inteiro mais próximo. 
  */
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

/*
| Nível | XP inicial (`start`) | XP final (`end`) | XP para concluir o nível (`end - start`) |
| ----: | -------------------: | ---------------: | ---------------------------------------: |
|     1 |                    0 |              100 |                                      100 |
|     2 |                  101 |              220 |                                      119 |
|     3 |                  221 |              352 |                                      131 |
|     4 |                  353 |              497 |                                      144 |
|     5 |                  498 |              657 |                                      159 |
|     6 |                  658 |              833 |                                      175 |
|     7 |                  834 |             1026 |                                      192 |
|     8 |                 1027 |             1239 |                                      212 |
|     9 |                 1240 |             1473 |                                      233 |
|    10 |                 1474 |             1730 |                                      256 |
*/
