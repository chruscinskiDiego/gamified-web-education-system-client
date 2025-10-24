import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { keyframes } from "@emotion/react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    alpha,
    Box,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import RedeemIcon from "@mui/icons-material/Redeem";
import LogoutIcon from "@mui/icons-material/Logout";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CelebrationIcon from "@mui/icons-material/Celebration";

import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import { colors } from "../../theme/colors";
import { api } from "../../lib/axios";
import { ProfileContext } from "../../contexts/ProfileContext";

interface InsigniaResponse {
    name: string;
    description: string;
    rarity: "COMMON" | "RARE" | "LEGENDARY";
}

interface ChallengeResponse {
    id_challenge: number;
    title: string;
    description: string;
    quantity: number;
    active: boolean;
    type: string;
    user_status: string | null;
    user_sub: boolean;
    insignia: InsigniaResponse;
    id_challenge_user_progress?: number | null;
}

interface CourseOption {
    id_course: string;
    title: string;
}

interface ChallengeDetailsResponse {
    challenge: ChallengeResponse;
    challenge_courses: CourseOption[];
}

const rarityMap = {
    COMMON: {
        label: "Comum",
        chip: alpha("#49A0FB", 0.18),
        text: "#2B3A67",
        icon: <EmojiEventsIcon sx={{ fontSize: 36 }} />,
        iconBackground: alpha(colors.white, 0.28),
        shadow: "0 8px 22px rgba(73,160,251,0.26)",
    },
    RARE: {
        label: "Rara",
        chip: alpha("#7A5CFF", 0.25),
        text: "#4b256d",
        icon: <MilitaryTechIcon sx={{ fontSize: 36 }} />,
        iconBackground: alpha(colors.white, 0.32),
        shadow: "0 10px 26px rgba(122,92,255,0.32)",
    },
    LEGENDARY: {
        label: "Lendária",
        chip: alpha("#F6AD55", 0.3),
        text: "#3b2613",
        icon: <WorkspacePremiumIcon sx={{ fontSize: 36 }} />,
        iconBackground: alpha("#f7c14b", 0.35),
        shadow: "0 12px 30px rgba(245,149,66,0.4)",
    },
} as const;

const statusChipMap: Record<string, { label: string; color: string; background: string }> = {
    P: { label: "Em progresso", color: "#F59E0B", background: "rgba(245, 158, 11, 0.18)" },
    C: { label: "Concluído", color: "#22C55E", background: "rgba(34, 197, 94, 0.18)" },
    F: { label: "Finalizado com sucesso", color: "#3B82F6", background: "rgba(59, 130, 246, 0.18)" },
    R: { label: "Recompensa disponível", color: "#7C3AED", background: "rgba(124, 58, 237, 0.18)" },
    N: { label: "Não iniciado", color: colors.purple, background: alpha(colors.purple, 0.16) },
};

const statusDescriptionMap: Record<string, string> = {
    P: "Você está no meio desta jornada. Continue completando as etapas para conquistar a insígnia!",
    C: "Parabéns! Desafio concluído, agora é só solicitar sua recompensa.",
    F: "Você completou todas as etapas deste desafio com excelência. Solicite sua recompensa e comemore a conquista!",
    R: "Você já tem direito à recompensa. Clique em solicitar para garantir sua insígnia.",
    N: "Inscreva-se no desafio para começar a acumular XP e evoluir sua jornada.",
};

const confettiPalette = ["#5D70F6", "#49A0FB", "#F59E0B", "#22C55E", "#EC4899", "#F97316"];

const confettiFall = keyframes`
    0% {
        transform: translate3d(0, -120%, 0) rotate(0deg);
        opacity: 0;
    }
    15% {
        opacity: 1;
    }
    100% {
        transform: translate3d(0, 120vh, 0) rotate(360deg);
        opacity: 0;
    }
`;

const celebrationPulse = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.15);
    }
`;

const subscribeEndpoint = "/challenge-user/join";
const abandonEndpoint = (progressId: number | string) => `/challenge-user/leave/${progressId}`;
const claimEndpoint = "/challenge-user/finish";

const ChallengeSubPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const profileContext = useContext(ProfileContext);
    const currentXp = profileContext?.userXp ?? 0;
    const displayedXp = profileContext?.userXp ?? "--";

    const [data, setData] = useState<ChallengeDetailsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [subscribeDialogOpen, setSubscribeDialogOpen] = useState<boolean>(false);
    const [confirmAction, setConfirmAction] = useState<"abandon" | "claim" | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [celebrating, setCelebrating] = useState<boolean>(false);
    const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const confettiPieces = useMemo(
        () =>
            Array.from({ length: 24 }, (_, index) => ({
                id: index,
                left: Math.random() * 100,
                delay: index * 0.08,
                size: 8 + Math.random() * 10,
                color: confettiPalette[index % confettiPalette.length],
                rotation: Math.random() * 360,
            })),
        []
    );

    const getChallengeDetails = async () => {
        if (!id) {
            setError("Identificador do desafio não informado.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get<ChallengeDetailsResponse>(`/challenge/student-view/id/${id}`);

            if (response.status === 200 && response.data) {
                setData(response.data);
                if (response.data.challenge_courses?.length) {
                    setSelectedCourse(response.data.challenge_courses[0].id_course);
                }
            }
        } catch (err) {
            setError("Não foi possível carregar as informações deste desafio agora. Tente novamente mais tarde.");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void getChallengeDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        return () => {
            if (celebrationTimeoutRef.current) {
                clearTimeout(celebrationTimeoutRef.current);
            }
        };
    }, []);

    const statusChip = useMemo(() => {
        const status = data?.challenge.user_status ?? (data?.challenge.user_sub ? "P" : "N");
        return statusChipMap[status] ?? {
            label: "Disponível",
            color: colors.blue,
            background: alpha(colors.blue, 0.16),
        };
    }, [data?.challenge.user_status, data?.challenge.user_sub]);

    const statusDescription = useMemo(() => {
        const status = data?.challenge.user_status ?? (data?.challenge.user_sub ? "P" : "N");
        return statusDescriptionMap[status] ?? "Desafio disponível para inscrição.";
    }, [data?.challenge.user_status, data?.challenge.user_sub]);

    const handleSubscribe = async () => {
        if (!data?.challenge || !selectedCourse) {
            SEGPrincipalNotificator("Selecione um curso antes de confirmar sua inscrição.", "warning");
            return;
        }

        if (profileContext?.userXp === null || profileContext?.userXp === undefined) {
            SEGPrincipalNotificator("Não foi possível obter seu XP atual. Tente novamente em instantes.", "warning");
            return;
        }

        setActionLoading(true);
        try {
            await api.post(subscribeEndpoint, {
                start_xp: profileContext.userXp,
                id_challenge: data.challenge.id_challenge,
                id_course: selectedCourse,
            });
            SEGPrincipalNotificator("Inscrição realizada com sucesso!", "success");
            setSubscribeDialogOpen(false);
            await getChallengeDetails();
        } catch (err) {
            SEGPrincipalNotificator("Não foi possível realizar sua inscrição agora.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAbandon = async () => {
        if (!data?.challenge?.id_challenge_user_progress) {
            SEGPrincipalNotificator("Não foi possível identificar o progresso deste desafio.", "error");
            return;
        }

        setActionLoading(true);
        try {
            await api.delete(abandonEndpoint(data.challenge.id_challenge_user_progress));
            SEGPrincipalNotificator("Você abandonou o desafio.", "info");
            setConfirmAction(null);
            await getChallengeDetails();
        } catch (err) {
            SEGPrincipalNotificator("Não foi possível abandonar o desafio.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!data?.challenge?.id_challenge_user_progress) {
            SEGPrincipalNotificator("Não foi possível identificar o progresso deste desafio.", "error");
            return;
        }

        if (profileContext?.userXp === null || profileContext?.userXp === undefined) {
            SEGPrincipalNotificator("Não foi possível obter seu XP atual. Tente novamente em instantes.", "warning");
            return;
        }

        setActionLoading(true);
        try {
            await api.patch(claimEndpoint, {
                end_xp: profileContext.userXp,
                id_challenge_user_progress: data.challenge.id_challenge_user_progress,
            });
            SEGPrincipalNotificator("Recompensa solicitada com sucesso!", "success");
            setConfirmAction(null);
            if (celebrationTimeoutRef.current) {
                clearTimeout(celebrationTimeoutRef.current);
            }
            setCelebrating(true);
            celebrationTimeoutRef.current = setTimeout(() => setCelebrating(false), 4200);
            await getChallengeDetails();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const status = error.response?.status;
            const apiMessage = error.response?.data?.message;

            if (status === 400 && apiMessage) {
                SEGPrincipalNotificator(apiMessage, "error");
            } else {
                SEGPrincipalNotificator("Não foi possível solicitar a recompensa agora.", "error");
            }
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
            
        }
    };

    const renderInsignia = () => {
        if (!data?.challenge.insignia) return null;
        const rarity = rarityMap[data.challenge.insignia.rarity] ?? rarityMap.COMMON;

        return (
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.18) 100%)",
                    boxShadow: "0 20px 44px rgba(71,103,214,0.22)",
                    border: `1px solid ${alpha(colors.purple, 0.15)}`,
                }}
            >
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: rarity.iconBackground,
                                color: rarity.text,
                                boxShadow: rarity.shadow,
                            }}
                        >
                            {rarity.icon}
                        </Box>

                        <Stack spacing={0.5}>
                            <Typography variant="overline" sx={{ letterSpacing: 1.2, color: alpha("#000", 0.6) }}>
                                Insígnia do desafio
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 800, color: rarity.text, textTransform: "uppercase", letterSpacing: 1 }}
                            >
                                {data.challenge.insignia.name}
                            </Typography>
                            <Chip
                                label={rarity.label}
                                size="small"
                                sx={{
                                    alignSelf: "flex-start",
                                    background: rarity.chip,
                                    color: rarity.text,
                                    fontWeight: 700,
                                    letterSpacing: 0.6,
                                }}
                            />
                        </Stack>
                    </Stack>

                    <Typography
                        variant="body1"
                        sx={{ color: alpha("#000", 0.72), lineHeight: 1.6, overflowWrap: "anywhere" }}
                    >
                        {data.challenge.insignia.description}
                    </Typography>

                    <Divider sx={{ borderColor: alpha("#000", 0.1) }} />

                    <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: alpha("#000", 0.65), fontWeight: 700 }}>
                            Como conquistar
                        </Typography>

                        {data.challenge.type === "X" ? (
                            <Typography variant="body2" sx={{ color: alpha("#000", 0.6), lineHeight: 1.6 }}>
                                Some a quantidade de XP proposta através das atividades do curso escolhido. O progresso considera o seu
                                XP inicial registrado na inscrição. Ao atingir o objetivo, finalize clicando em "Solicitar recompensa".
                            </Typography>
                        ) : (
                            <Typography variant="body2" sx={{ color: alpha("#000", 0.6), lineHeight: 1.6 }}>
                                Complete todas as etapas do curso dentro do número de dias indicado. Este prazo é contado a partir da sua
                                inscrição, então organize seus estudos e conclua a trilha a tempo para garantir a insígnia!
                            </Typography>
                        )}

                    </Stack>
                </Stack>
            </Paper>
        );
    };

    const isSubscribed = Boolean(data?.challenge.user_sub);
    const isXpChallenge = data?.challenge.type === "X";
    const isFinalizedStatus = data?.challenge.user_status === "F";

    const canSubscribe = Boolean(data && !data.challenge.user_sub && data.challenge.active);
    const canAbandon = Boolean(
        data &&
        data.challenge.user_sub &&
        !["C", "F", "R"].includes(data.challenge.user_status ?? "") &&
        data.challenge.id_challenge_user_progress
    );
    const canClaim = Boolean(data && data.challenge.user_sub && data.challenge.id_challenge_user_progress);
    const actionButtonSx = {
        width: "100%",
        minWidth: { xs: "100%", sm: 220 },
        mb: 0,
    };

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                background: "white",
                py: { xs: 6 },
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={{ xs: 4, md: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Tooltip title="Voltar">
                            <IconButton onClick={() => navigate(-1)} sx={{ color: colors.purple }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.purple }}>
                            Detalhes do desafio
                        </Typography>
                    </Stack>

                    {loading && (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={280}>
                            <CircularProgress color="primary" />
                        </Box>
                    )}

                    {error && !loading && (
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 3,
                                background: alpha("#ff4d4d", 0.08),
                                color: "#d32f2f",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                            action={
                                <SEGButton colorTheme="white" onClick={() => void getChallengeDetails()} fullWidth={false}>
                                    Tentar novamente
                                </SEGButton>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {!loading && !error && data && (
                        <Grid container spacing={{ xs: 4, md: 5 }}>
                            <Grid item xs={12} md={7}>
                                <Stack spacing={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            borderRadius: 4,
                                            p: { xs: 3, md: 4 },
                                            background: "linear-gradient(135deg, rgba(93,112,246,0.1) 0%, rgba(73,160,251,0.16) 100%)",
                                            boxShadow: "0px 22px 46px rgba(71,103,214,0.18)",
                                            border: `1px solid ${alpha(colors.purple, 0.12)}`,
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                                    <Chip
                                                        label={data.challenge.active ? "Ativo" : "Encerrado"}
                                                        size="small"
                                                        sx={{
                                                            background: data.challenge.active
                                                                ? alpha(colors.blue, 0.18)
                                                                : alpha("#000", 0.08),
                                                            color: data.challenge.active ? colors.blue : alpha("#000", 0.6),
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={statusChip.label}
                                                        size="small"
                                                        sx={{
                                                            background: statusChip.background,
                                                            color: statusChip.color,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    {data.challenge.user_sub && (
                                                        <Chip
                                                            label="Você está participando"
                                                            size="small"
                                                            sx={{
                                                                background: alpha(colors.purple, 0.18),
                                                                color: colors.purple,
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    )}
                                                </Stack>

                                                <Typography
                                                    variant="h3"
                                                    sx={{
                                                        fontWeight: 900,
                                                        letterSpacing: 0.8,
                                                        color: colors.purple,
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {data.challenge.title}
                                                </Typography>

                                                <Typography variant="body1" sx={{ color: alpha("#000", 0.72), lineHeight: 1.7 }}>
                                                    {data.challenge.description}
                                                </Typography>
                                            </Stack>

                                            <Divider sx={{ borderColor: alpha("#000", 0.08) }} />

                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="overline" sx={{ letterSpacing: 1, color: alpha("#000", 0.5) }}>
                                                        {isXpChallenge ? "Qtd. XP necessária" : "Dias disponíveis para finalizar"}
                                                    </Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: colors.purple }}>
                                                        {data.challenge.quantity}
                                                    </Typography>
                                                </Stack>

                                                <Stack spacing={0.5}>
                                                    <Typography variant="overline" sx={{ letterSpacing: 1, color: alpha("#000", 0.5) }}>
                                                        Status atual
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: statusChip.color }}>
                                                        {statusChip.label}
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            <Box
                                                sx={{
                                                    background: alpha(colors.white, 0.75),
                                                    borderRadius: 3,
                                                    p: { xs: 2.5, md: 3 },
                                                    border: `1px dashed ${alpha(colors.purple, 0.2)}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                                    <StarOutlineIcon sx={{ fontSize: 36, color: colors.purple }} />
                                                    <Stack spacing={1}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.purple }}>
                                                            {statusChip.label}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: alpha("#000", 0.6), lineHeight: 1.6 }}>
                                                            {statusDescription}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: alpha("#000", 0.55), lineHeight: 1.6 }}>
                                                            {isXpChallenge
                                                                ? "Este desafio acompanha a sua evolução em XP. Some a quantidade informada para destravar a recompensa."
                                                                : "Este desafio é uma corrida contra o tempo! Conclua o curso dentro do prazo de dias indicado para garantir a insígnia."}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            borderRadius: 4,
                                            p: { xs: 3, md: 4 },
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(238,242,255,0.92) 100%)",
                                            boxShadow: "0px 18px 36px rgba(71,103,214,0.16)",
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            {isFinalizedStatus ? (
                                                <Stack spacing={1.5}>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.purple }}>
                                                        Desafio finalizado
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: alpha("#000", 0.65) }}>
                                                        Você levou este desafio até o fim. Agora é só solicitar a recompensa para registrar sua conquista!
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.purple }}>
                                                        Escolha um curso para participar
                                                    </Typography>

                                                    {data.challenge_courses.length === 0 ? (
                                                        <Typography variant="body2" sx={{ color: alpha("#000", 0.6) }}>
                                                            Nenhum curso disponível para inscrição neste desafio no momento.
                                                        </Typography>
                                                    ) : (
                                                        <SEGTextField
                                                            select
                                                            label="Cursos disponíveis"
                                                            value={selectedCourse}
                                                            onChange={(event) => setSelectedCourse(event.target.value as string)}
                                                            helperText={
                                                                isSubscribed
                                                                    ? "Curso selecionado para este desafio."
                                                                    : "Selecione o curso que você utilizará para cumprir as missões."
                                                            }
                                                            InputLabelProps={{ shrink: true }}
                                                            disabled={isSubscribed}
                                                        >
                                                            {data.challenge_courses.map((course) => (
                                                                <MenuItem key={course.id_course} value={course.id_course}>
                                                                    {course.title}
                                                                </MenuItem>
                                                            ))}
                                                        </SEGTextField>
                                                    )}
                                                </>
                                            )}

                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gap: { xs: 2, sm: 2.5 },
                                                    gridTemplateColumns: {
                                                        xs: "1fr",
                                                        sm: "repeat(auto-fit, minmax(220px, 1fr))",
                                                    },
                                                }}
                                            >
                                                {!isFinalizedStatus && (
                                                    <SEGButton
                                                        startIcon={<HowToRegIcon />}
                                                        onClick={() => {
                                                            if (!selectedCourse && data.challenge_courses.length > 0) {
                                                                setSelectedCourse(data.challenge_courses[0].id_course);
                                                            }
                                                            setSubscribeDialogOpen(true);
                                                        }}
                                                        disabled={!canSubscribe || data.challenge_courses.length === 0}
                                                        sx={actionButtonSx}
                                                        fullWidth={false}
                                                    >
                                                        Inscrever-se no desafio
                                                    </SEGButton>
                                                )}
                                                {canAbandon && (
                                                    <SEGButton
                                                        colorTheme="outlined"
                                                        startIcon={<LogoutIcon />}
                                                        onClick={() => setConfirmAction("abandon")}
                                                        sx={actionButtonSx}
                                                        fullWidth={false}
                                                    >
                                                        Abandonar desafio
                                                    </SEGButton>
                                                )}
                                                <SEGButton
                                                    colorTheme="purple"
                                                    startIcon={<RedeemIcon />}
                                                    onClick={() => setConfirmAction("claim")}
                                                    disabled={!canClaim}
                                                    sx={actionButtonSx}
                                                    fullWidth={false}
                                                >
                                                    Solicitar recompensa
                                                </SEGButton>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Stack spacing={4}>{renderInsignia()}</Stack>
                            </Grid>
                        </Grid>
                    )}
                </Stack>
            </Container>

            <Dialog open={subscribeDialogOpen} onClose={() => setSubscribeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: colors.purple }}>Confirmar inscrição</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ color: alpha("#000", 0.7), mb: 2 }}>
                        Você está prestes a se inscrever no desafio "{data?.challenge.title}". Confirme o curso que será
                        utilizado nesta jornada.
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha("#000", 0.6), mb: 3 }}>
                        Seu XP inicial registrado será de {" "}
                        <Box component="span" sx={{ fontWeight: 700, color: colors.purple }}>
                            {displayedXp}
                        </Box>{" "}
                        pontos para acompanhar o desempenho deste desafio.
                    </Typography>
                    <SEGTextField
                        select
                        label="Curso selecionado"
                        value={selectedCourse}
                        onChange={(event) => setSelectedCourse(event.target.value as string)}
                        disabled={data?.challenge_courses.length === 0}
                    >
                        {data?.challenge_courses.map((course) => (
                            <MenuItem key={course.id_course} value={course.id_course}>
                                {course.title}
                            </MenuItem>
                        ))}
                    </SEGTextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <SEGButton colorTheme="white" onClick={() => setSubscribeDialogOpen(false)} fullWidth={false}>
                        Cancelar
                    </SEGButton>
                    <SEGButton onClick={() => void handleSubscribe()} loading={actionLoading} fullWidth={false}>
                        Confirmar inscrição
                    </SEGButton>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: colors.purple }}>
                    {confirmAction === "abandon" ? "Abandonar desafio" : "Solicitar recompensa"}
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ color: alpha("#000", 0.7) }}>
                        {confirmAction === "abandon"
                            ? "Tem certeza de que deseja abandonar este desafio? Seu progresso atual será perdido."
                            : "Deseja solicitar a recompensa deste desafio agora mesmo?"}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <SEGButton colorTheme="white" onClick={() => setConfirmAction(null)} fullWidth={false}>
                        Cancelar
                    </SEGButton>
                    {confirmAction === "abandon" ? (
                        <SEGButton
                            colorTheme="outlined"
                            onClick={() => void handleAbandon()}
                            loading={actionLoading}
                            fullWidth={false}
                        >
                            Abandonar
                        </SEGButton>
                    ) : (
                        <SEGButton
                            colorTheme="purple"
                            onClick={() => void handleClaim()}
                            loading={actionLoading}
                            fullWidth={false}
                        >
                            Solicitar
                        </SEGButton>
                    )}
                </DialogActions>
            </Dialog>

            {celebrating && (
                <Box
                    sx={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: (theme) => theme.zIndex.modal + 2,
                    }}
                >
                    <Paper
                        elevation={8}
                        sx={{
                            px: { xs: 4, sm: 6 },
                            py: { xs: 3, sm: 4 },
                            borderRadius: 6,
                            background: "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(56,189,248,0.92) 100%)",
                            color: colors.white,
                            textAlign: "center",
                            boxShadow: "0 24px 64px rgba(79,70,229,0.45)",
                            pointerEvents: "auto",
                            position: "relative",
                            overflow: "hidden",
                            minWidth: { xs: 280, sm: 360 },
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                overflow: "hidden",
                                pointerEvents: "none",
                            }}
                        >
                            {confettiPieces.map((piece) => (
                                <Box
                                    key={piece.id}
                                    sx={{
                                        position: "absolute",
                                        top: "-15%",
                                        left: `${piece.left}%`,
                                        width: piece.size,
                                        height: piece.size * 0.6,
                                        borderRadius: 0.5,
                                        backgroundColor: piece.color,
                                        opacity: 0,
                                        animation: `${confettiFall} 2.8s ease-in-out forwards`,
                                        animationDelay: `${piece.delay}s`,
                                        transform: `rotate(${piece.rotation}deg)`,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    }}
                                />
                            ))}
                        </Box>
                        <Stack spacing={1.5} alignItems="center">
                            <CelebrationIcon sx={{ fontSize: 48, animation: `${celebrationPulse} 1.4s ease-in-out infinite` }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Recompensa garantida!
                            </Typography>
                            <Typography variant="body1" sx={{ maxWidth: 320 }}>
                                Você acaba de adicionar uma nova insígnia à sua coleção. Continue acumulando conquistas!
                            </Typography>
                        </Stack>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default ChallengeSubPage;
