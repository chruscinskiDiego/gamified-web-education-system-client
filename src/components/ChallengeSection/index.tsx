import { Box, Grid, Stack, Typography, alpha, useTheme } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import type { ChallengeSummary } from "../../interfaces/challenge.interfaces";
import { colors } from "../../theme/colors";
import { ChallengeCard } from "../ChallengeCard";

interface ChallengeSectionProps {
    title: string;
    description: string;
    challenges: ChallengeSummary[];
    loading?: boolean;
    emptyTitle: string;
    emptyDescription: string;
    variant: "subscribed" | "all";
    onNavigate: (challenge: ChallengeSummary) => void;
}

const variantIcons = {
    subscribed: <EventAvailableIcon sx={{ fontSize: 26 }} />,
    all: <RocketLaunchIcon sx={{ fontSize: 26 }} />,
};

export const ChallengeSection = ({
    title,
    description,
    challenges,
    loading = false,
    emptyTitle,
    emptyDescription,
    variant,
    onNavigate,
}: ChallengeSectionProps) => {
    const theme = useTheme();
    const headerIcon = variantIcons[variant];

    return (
        <Stack spacing={3} component="section">
            <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: colors.horizontalGradient,
                            color: "white",
                            boxShadow: "0px 14px 30px rgba(93,112,246,0.28)",
                        }}
                    >
                        {headerIcon}
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            color: colors.purple,
                            letterSpacing: 0.5,
                        }}
                    >
                        {title}
                    </Typography>
                </Stack>

                <Typography
                    variant="subtitle1"
                    sx={{
                        color: alpha("#000", 0.6),
                        maxWidth: 620,
                    }}
                >
                    {description}
                </Typography>
            </Stack>

            <Box
                sx={{
                    borderRadius: 4,
                    background: theme.palette.background.paper,
                    boxShadow: "0px 18px 42px rgba(33, 33, 52, 0.12)",
                    p: { xs: 3, md: 4 },
                }}
            >
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} md={4} key={`skeleton-${variant}-${item}`}>
                                <Box
                                    sx={{
                                        height: 240,
                                        borderRadius: 3,
                                        background: alpha(colors.blue, 0.08),
                                        boxShadow: "inset 0 0 0 1px rgba(93,112,246,0.18)",
                                        animation: "pulse 1.6s ease-in-out infinite",
                                        '@keyframes pulse': {
                                            '0%': { opacity: 0.55 },
                                            '50%': { opacity: 0.9 },
                                            '100%': { opacity: 0.55 },
                                        },
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : challenges.length === 0 ? (
                    <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            py: 8,
                            textAlign: "center",
                            color: alpha("#000", 0.65),
                        }}
                    >
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                background: alpha(colors.blue, 0.12),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colors.blue,
                                mb: 1,
                            }}
                        >
                            <EmojiEventsIcon sx={{ fontSize: 36 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                            {emptyTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ maxWidth: 420 }}>
                            {emptyDescription}
                        </Typography>
                    </Stack>
                ) : (
                    <Grid container spacing={3}>
                        {challenges.map((challenge) => (
                            <Grid item xs={12} md={4} key={`${variant}-${challenge.id_challenge}`}>
                                <ChallengeCard
                                    challenge={challenge}
                                    onClick={() => onNavigate(challenge)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Stack>
    );
};
