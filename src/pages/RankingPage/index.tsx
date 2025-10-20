import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Container,
    Grid,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { alpha } from "@mui/material/styles";

import { api } from "../../lib/axios";
import { colors } from "../../theme/colors";

type RankingEntry = {
    rank_position: string;
    user_full_name: string;
    points: number;
};

const MAX_VISIBLE_RANK = 10;

const medalStyles: Record<1 | 2 | 3, { badge: string; glow: string; icon: ReactNode }> = {
    1: {
        badge: "linear-gradient(135deg, #FFE259 0%, #FFA751 100%)",
        glow: "0 22px 48px rgba(255, 193, 59, 0.45)",
        icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
    },
    2: {
        badge: "linear-gradient(135deg, #ECEEF6 0%, #BDC3D3 100%)",
        glow: "0 18px 36px rgba(163, 169, 191, 0.35)",
        icon: <MilitaryTechIcon sx={{ fontSize: 34 }} />,
    },
    3: {
        badge: "linear-gradient(135deg, #F7B267 0%, #F4845F 100%)",
        glow: "0 18px 36px rgba(244, 132, 95, 0.32)",
        icon: <MilitaryTechIcon sx={{ fontSize: 34 }} />,
    },
};

const RankingPage: React.FC = () => {
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.get<RankingEntry[]>("/ranking");

                if (response.status === 200) {
                    setRanking(response.data ?? []);
                }
            } catch (err) {
                setError("Não foi possível carregar o ranking no momento.");
            } finally {
                setLoading(false);
            }
        };

        void fetchRanking();
    }, []);

    const topThree = useMemo(() => ranking.slice(0, 3), [ranking]);
    const others = useMemo(
        () => ranking.slice(3, MAX_VISIBLE_RANK),
        [ranking],
    );

    const championPoints = ranking[0]?.points ?? 0;

    return (
        <Box
            sx={{
                background: "linear-gradient(180deg, rgba(93,112,246,0.08) 0%, rgba(73,160,251,0.03) 100%)",
                minHeight: "calc(100vh - 64px)",
                py: { xs: 6, md: 8 },
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={{ xs: 5, md: 7 }}>
                    <Stack spacing={1} textAlign="center" alignItems="center">
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900,
                                color: colors.purple,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                            }}
                        >
                            Hall da fama SEG
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                maxWidth: 520,
                                color: alpha("#000", 0.6),
                            }}
                        >
                            Acompanhe os heróis do conhecimento que acumularam mais XP nesta temporada.
                        </Typography>
                    </Stack>

                    <Grid
                        container
                        spacing={{ xs: 3, md: 4 }}
                        alignItems="flex-end"
                        justifyContent="center"
                    >
                        {topThree.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        py: 6,
                                        px: 4,
                                        borderRadius: 4,
                                        background: "#fff",
                                        boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                        Nenhum aluno ranqueado ainda
                                    </Typography>
                                    <Typography sx={{ color: alpha("#000", 0.6), mt: 1 }}>
                                        Assim que os alunos começarem a ganhar XP, o Hall da Fama será atualizado.
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {loading && (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                                        gap: 24,
                                    }}
                                >
                                    {[1, 2, 3].map((skeleton) => (
                                        <Box
                                            key={skeleton}
                                            sx={{
                                                borderRadius: 4,
                                                background: alpha(colors.white, 0.9),
                                                boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                                                minHeight: { xs: 180, md: skeleton === 1 ? 240 : 200 },
                                                opacity: 0.5,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {topThree.map((entry) => {
                            const position = Number(entry.rank_position);
                            const medalKey = (position === 1 || position === 2 || position === 3
                                ? position
                                : 3) as 1 | 2 | 3;
                            const styles = medalStyles[medalKey];
                            const isChampion = position === 1;

                            return (
                                <Grid item xs={12} md={4} key={entry.rank_position}>
                                    <Box
                                        sx={{
                                            borderRadius: 4,
                                            background:
                                                position === 1
                                                    ? `linear-gradient(135deg, rgba(93,112,246,0.92) 0%, rgba(73,160,251,0.92) 60%, rgba(255,203,107,0.95) 100%)`
                                                    : `linear-gradient(135deg, rgba(93,112,246,0.95) 0%, rgba(73,160,251,0.95) 100%)`,
                                            color: "#fff",
                                            px: { xs: 3, md: 4 },
                                            py: { xs: 4, md: isChampion ? 5 : 4 },
                                            boxShadow: styles.glow,
                                            position: "relative",
                                            overflow: "hidden",
                                            transform: {
                                                md: isChampion ? "translateY(-16px)" : "none",
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 16,
                                                right: 16,
                                                width: 64,
                                                height: 64,
                                                borderRadius: "50%",
                                                background: styles.badge,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: position === 1 ? colors.purple : "#4A4A4A",
                                                boxShadow: styles.glow,
                                            }}
                                        >
                                            {styles.icon}
                                        </Box>

                                        <Stack spacing={2}>
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                <Typography
                                                    variant="overline"
                                                    sx={{
                                                        letterSpacing: 3,
                                                        fontWeight: 600,
                                                        opacity: 0.85,
                                                    }}
                                                >
                                                    {position}º lugar
                                                </Typography>
                                                <Typography
                                                    variant={isChampion ? "h4" : "h5"}
                                                    sx={{
                                                        fontWeight: 800,
                                                        lineHeight: 1.1,
                                                    }}
                                                >
                                                    {entry.user_full_name}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Chip
                                                    label={`${entry.points} XP`}
                                                    sx={{
                                                        background: alpha("#fff", 0.16),
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        fontSize: 16,
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 2,
                                                    }}
                                                />
                                                {championPoints > 0 && !isChampion && (
                                                    <Typography sx={{ opacity: 0.8 }} variant="body2">
                                                        {Math.round((entry.points / championPoints) * 100)}% do líder
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {error && (
                        <Box
                            sx={{
                                borderRadius: 4,
                                background: alpha("#FF6B6B", 0.1),
                                border: "1px solid rgba(255,107,107,0.4)",
                                color: "#B00020",
                                px: 3,
                                py: 2,
                                textAlign: "center",
                                fontWeight: 600,
                            }}
                        >
                            {error}
                        </Box>
                    )}

                    {others.length > 0 && (
                        <Stack spacing={2.5}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    color: colors.purple,
                                }}
                            >
                                A liga continua
                            </Typography>

                            <Stack spacing={1.5}>
                                {others.map((entry) => {
                                    const position = Number(entry.rank_position);
                                    const progress = championPoints
                                        ? Math.min(100, Math.round((entry.points / championPoints) * 100))
                                        : 0;

                                    return (
                                        <Box
                                            key={entry.rank_position}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1.5,
                                                background: "#fff",
                                                borderRadius: 3,
                                                px: { xs: 2, md: 3 },
                                                py: { xs: 2.5, md: 3 },
                                                boxShadow: "0px 12px 30px rgba(33, 33, 52, 0.12)",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 6,
                                                    background: colors.horizontalGradient,
                                                }}
                                            />

                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: "50%",
                                                        background: alpha(colors.purple, 0.12),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: 800,
                                                        color: colors.purple,
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    #{position}
                                                </Box>

                                                <Stack sx={{ flex: 1 }} spacing={0.5}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: 700, color: alpha("#000", 0.9) }}
                                                    >
                                                        {entry.user_full_name}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 10,
                                                            borderRadius: 999,
                                                            background: alpha(colors.purple, 0.08),
                                                            "& .MuiLinearProgress-bar": {
                                                                background: colors.horizontalGradient,
                                                                borderRadius: 999,
                                                            },
                                                        }}
                                                    />
                                                </Stack>

                                                <Chip
                                                    label={`${entry.points} XP`}
                                                    sx={{
                                                        background: alpha(colors.purple, 0.12),
                                                        color: colors.purple,
                                                        fontWeight: 700,
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
};

export default RankingPage;
