import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Stack,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import type { ChallengeSummary } from "../../interfaces/challenge.interfaces";
import { colors } from "../../theme/colors";

const statusMap: Record<string, { label: string; color: string; background: string }> = {
    P: {
        label: "Em progresso",
        color: "#F59E0B",
        background: "rgba(245, 158, 11, 0.14)",
    },
    C: {
        label: "Concluído",
        color: "#22C55E",
        background: "rgba(34, 197, 94, 0.16)",
    },
    F: {
        label: "Finalizado",
        color: "#3B82F6",
        background: "rgba(59, 130, 246, 0.16)",
    },
};

const challengeTypeLabels: Record<string, string> = {
    X: "XP Turbo",
    D: "Daily Mission",
    M: "Maratona",
};

const getStatusBadge = (status: string | null) => {
    if (!status) {
        return {
            label: "Disponível",
            color: colors.purple,
            background: alpha(colors.purple, 0.12),
        };
    }

    return statusMap[status] ?? {
        label: "Em breve",
        color: colors.blue,
        background: alpha(colors.blue, 0.16),
    };
};

const getTypeLabel = (challengeType: string) =>
    challengeTypeLabels[challengeType] ?? `Modo ${challengeType}`;

const getDescription = (challenge: ChallengeSummary) => {
    if (challenge.user_sub) {
        if (challenge.status === "C" || challenge.status === "F") {
            return "Você concluiu este desafio e já pode reivindicar suas conquistas.";
        }

        if (challenge.status === "P") {
            return "Continue cumprindo as missões para evoluir no ranking e desbloquear recompensas.";
        }

        return "Você já está inscrito, acompanhe o progresso e não perca nenhuma meta.";
    }

    return "Entre no desafio para ganhar XP extra e transformar seus estudos em uma aventura épica.";
};

interface ChallengeCardProps {
    challenge: ChallengeSummary;
    onClick: () => void;
}

export const ChallengeCard = ({ challenge, onClick }: ChallengeCardProps) => {
    const theme = useTheme();
    const statusBadge = getStatusBadge(challenge.status);
    const typeLabel = getTypeLabel(challenge.challenge_type);
    const description = getDescription(challenge);

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                height: "100%",
                position: "relative",
                overflow: "hidden",
                background: theme.palette.background.paper,
                boxShadow: "0px 16px 36px rgba(33, 33, 52, 0.14)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0px 24px 48px rgba(33, 33, 52, 0.22)",
                },
                "&::before": {
                    content: "''",
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.22) 100%)",
                    opacity: 0.65,
                },
                "& > .MuiCardActionArea-root": {
                    position: "relative",
                    zIndex: 1,
                },
            }}
        >
            <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
                <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: colors.horizontalGradient,
                                    color: "white",
                                    boxShadow: "0px 12px 24px rgba(93,112,246,0.35)",
                                }}
                            >
                                <EmojiEventsIcon sx={{ fontSize: 28 }} />
                            </Box>

                            <Stack spacing={0.5}>
                                <Typography variant="overline" sx={{ letterSpacing: 1, color: alpha("#000", 0.52) }}>
                                    Desafio
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        color: colors.purple,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {challenge.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha("#000", 0.6) }}>
                                    {typeLabel}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {challenge.user_sub ? (
                                <Chip
                                    label="Você está participando"
                                    size="small"
                                    sx={{
                                        background: alpha(colors.purple, 0.12),
                                        color: colors.purple,
                                        fontWeight: 600,
                                    }}
                                />
                            ) : (
                                <Chip
                                    label="Novo desafio"
                                    size="small"
                                    sx={{
                                        background: alpha(colors.blue, 0.12),
                                        color: colors.blue,
                                        fontWeight: 600,
                                    }}
                                />
                            )}

                            <Chip
                                label={statusBadge.label}
                                size="small"
                                sx={{
                                    background: statusBadge.background,
                                    color: statusBadge.color,
                                    fontWeight: 600,
                                }}
                            />

                            {!challenge.active && (
                                <Chip
                                    label="Encerrado"
                                    size="small"
                                    sx={{
                                        background: alpha(theme.palette.grey[500], 0.16),
                                        color: theme.palette.grey[700],
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha("#000", 0.68),
                                minHeight: 60,
                                lineHeight: 1.5,
                            }}
                        >
                            {description}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ color: colors.purple, fontWeight: 700 }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                Ver detalhes do desafio
                            </Typography>
                            <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
