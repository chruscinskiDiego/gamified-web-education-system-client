import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { alpha } from "@mui/material/styles";

import SEGButton from "../../components/SEGButton";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import { api } from "../../lib/axios";
import { colors } from "../../theme/colors";

type InsigniaRarity = "COMMON" | "RARE" | "LEGENDARY";

interface UserInsignia {
    id_insignia: number;
    name: string;
    description: string;
    rarity: InsigniaRarity;
    claimed_at: string | null;
}

const rarityLabels: Record<InsigniaRarity, string> = {
    COMMON: "Comum",
    RARE: "Rara",
    LEGENDARY: "Lendária",
};

const rarityIcons: Record<InsigniaRarity, React.ReactNode> = {
    COMMON: <EmojiEventsIcon sx={{ fontSize: 34 }} />,
    RARE: <MilitaryTechIcon sx={{ fontSize: 34 }} />,
    LEGENDARY: <WorkspacePremiumIcon sx={{ fontSize: 34 }} />,
};

const rarityStyles: Record<
    InsigniaRarity,
    { chip: string; text: string; iconBackground: string; iconShadow: string }
> = {
    COMMON: {
        chip: alpha("#49A0FB", 0.18),
        text: "#2B3A67",
        iconBackground: alpha(colors.white, 0.28),
        iconShadow: "0 8px 22px rgba(73,160,251,0.26)",
    },
    RARE: {
        chip: alpha("#7A5CFF", 0.25),
        text: "#4b256d",
        iconBackground: alpha(colors.white, 0.32),
        iconShadow: "0 10px 26px rgba(122,92,255,0.32)",
    },
    LEGENDARY: {
        chip: alpha("#F6AD55", 0.3),
        text: "#3b2613",
        iconBackground: alpha("#f7c14b", 0.35),
        iconShadow: "0 12px 30px rgba(245,149,66,0.4)",
    },
};

const baseCardSurface = {
    background: "linear-gradient(135deg, rgba(93,112,246,0.08) 0%, rgba(73,160,251,0.12) 100%)",
    boxShadow: "0 18px 40px rgba(71,103,214,0.18)",
    border: `1px solid ${alpha(colors.purple, 0.18)}`,
};

const InsigniasPage: React.FC = () => {
    const [insignias, setInsignias] = useState<UserInsignia[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const getInsignias = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await api.get<UserInsignia[]>("/insignia/view-by-student");
            if (response.status === 200) {
                setInsignias(response.data ?? []);
                return;
            }

            setInsignias([]);
            setErrorMessage("Não foi possível carregar as suas insígnias. Tente novamente mais tarde.");
        } catch (error) {
            console.error("Erro ao buscar insígnias", error);
            setInsignias([]);
            setErrorMessage("Não foi possível carregar as suas insígnias. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getInsignias();
    }, [getInsignias]);

    const hasInsignias = useMemo(() => insignias.length > 0, [insignias]);

    const formatClaimDate = useCallback((date: string | null) => {
        if (!date) return "Data não disponível";

        try {
            return new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }).format(new Date(date));
        } catch (error) {
            console.error("Erro ao formatar data da insígnia", error);
            return "Data não disponível";
        }
    }, []);

    return (
        <Box sx={{ backgroundColor: "#ffffffff", minHeight: "calc(100vh - 64px)", pb: { xs: 6, md: 10 } }}>
            <Box
                sx={{
                    background: colors.horizontalGradient,
                    color: "#fff",
                    py: { xs: 6, md: 8 },
                    borderRadius: { xs: 36, md: 60 },
                    boxShadow: "0 18px 45px rgba(93, 112, 246, 0.25)",
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={2} alignItems={{ xs: "flex-start", md: "center" }} textAlign={{ xs: "left", md: "center" }}>
                        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
                            Reconhecimento da sua jornada
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            Minhas Insígnias
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: 520, opacity: 0.9 }}>
                            Visualize todas as insígnias que você já conquistou e acompanhe o seu progresso na plataforma.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -7 }, position: "relative" }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 5,
                        p: { xs: 3, md: 5 },
                        minHeight: 320,
                        backgroundColor: "#fff",
                        boxShadow: "0 22px 60px rgba(93, 112, 246, 0.12)",
                    }}
                >
                    {isLoading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <SEGPrincipalLoader />
                            <Typography variant="body2" sx={{ mt: 2, color: colors.strongGray }}>
                                Carregando suas insígnias...
                            </Typography>
                        </Stack>
                    ) : errorMessage ? (
                        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Ops!
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ maxWidth: 360 }}>
                                {errorMessage}
                            </Typography>
                            <SEGButton
                                colorTheme="gradient"
                                onClick={getInsignias}
                                fullWidth={false}
                                sx={{ mt: 1, px: 4 }}
                            >
                                Tentar novamente
                            </SEGButton>
                        </Stack>
                    ) : !hasInsignias ? (
                        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Nenhuma insígnia encontrada
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ maxWidth: 360 }}>
                                Continue participando dos desafios e atividades para desbloquear novas conquistas!
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={4}>
                            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.purple }}>
                                    Insígnias conquistadas
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                    {insignias.length === 1
                                        ? "Você possui 1 insígnia"
                                        : `Você possui ${insignias.length} insígnias`}
                                </Typography>
                            </Stack>

                            <Grid container spacing={{ xs: 3, md: 4 }}>
                                {insignias.map((insignia) => {
                                    const theme = rarityStyles[insignia.rarity];

                                    return (
                                        <Grid item xs={12} sm={6} lg={4} key={insignia.id_insignia}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    borderRadius: 4,
                                                    p: 3,
                                                    height: "100%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 2,
                                                    color: colors.strongGray,
                                                    overflow: "hidden",
                                                    ...baseCardSurface,
                                                }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            background: theme.iconBackground,
                                                            boxShadow: theme.iconShadow,
                                                            color: theme.text,
                                                        }}
                                                    >
                                                        {rarityIcons[insignia.rarity]}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.4, color: colors.purple }}>
                                                            {insignia.name}
                                                        </Typography>
                                                        <Chip
                                                            label={rarityLabels[insignia.rarity]}
                                                            size="small"
                                                            sx={{
                                                                mt: 1,
                                                                fontWeight: 600,
                                                                textTransform: "uppercase",
                                                                letterSpacing: 0.6,
                                                                backgroundColor: theme.chip,
                                                                color: theme.text,
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                                    {insignia.description}
                                                </Typography>

                                                <Box sx={{ mt: "auto" }}>
                                                    <Typography variant="caption" sx={{ color: colors.strongGray, opacity: 0.8 }}>
                                                        Conquistada em
                                                    </Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.purple }}>
                                                        {formatClaimDate(insignia.claimed_at)}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Stack>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default InsigniasPage;
