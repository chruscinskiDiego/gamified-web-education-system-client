export const mapDifficulty = (d: string) => {
    switch (d) {
        case "E":
            return "Fácil";
        case "M":
            return "Médio";
        case "H":
            return "Difício";
        default:
            return "Médio";
    }
};
