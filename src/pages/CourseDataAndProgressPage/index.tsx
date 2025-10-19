import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ClassRoundedIcon from "@mui/icons-material/ClassRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { alpha } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import SEGButton from "../../components/SEGButton";
import { api } from "../../lib/axios";
import { colors } from "../../theme/colors";
import { mapDifficulty } from "../../helpers/DifficultyLevel";

interface CourseProgressEpisode {
    id: string;
    title: string;
    description: string | null;
    order: number;
    xpReward: number | null;
    completed: boolean;
    completedAt: string | null;
}

interface CourseProgressModule {
    id: string;
    title: string;
    description: string | null;
    order: number;
    progressPercentage: number;
    totalEpisodes: number;
    completedEpisodes: number;
    episodes: CourseProgressEpisode[];
}

interface CourseDataAndProgress {
    idCourse: string | null;
    title: string;
    description: string | null;
    difficultyLevel: string | null;
    thumbnail: string | null;
    progressPercentage: number | null;
    totalXp: number | null;
    earnedXp: number | null;
    modules: CourseProgressModule[];
}

const numberFormatter = new Intl.NumberFormat("pt-BR");

const CourseDataAndProgressPage: React.FC = () => {

    const { id } = useParams<{ id: string }>();
    const theme = useTheme();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseDataAndProgress | null>(null);

    const fetchCourseProgress = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        const candidateEndpoints = [
            `/course/student-progress/${id}`,
            `/course/data-and-progress/${id}`,
            `/course/progress/${id}`,
            `/course/${id}/progress`,
        ];

        let lastError: unknown = null;

        for (const endpoint of candidateEndpoints) {
            try {
                const response = await api.get(endpoint);
                const sanitized = sanitizeCourseProgress(response?.data);

                if (sanitized) {
                    setCourseProgress(sanitized);
                    setLoading(false);
                    return;
                }
            } catch (requestError) {
                lastError = requestError;
            }
        }

        if (lastError) {
            console.error("Erro ao buscar dados do curso", lastError);
        }

        setCourseProgress(null);
        setError("Não foi possível carregar os dados do curso no momento.");
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchCourseProgress();
    }, [fetchCourseProgress]);

    const modules = useMemo(() => {
        return courseProgress?.modules ?? [];
    }, [courseProgress]);

    const modulesCount = modules.length;

    const totalEpisodes = useMemo(() => {
        return modules.reduce((acc, module) => acc + module.totalEpisodes, 0);
    }, [modules]);

    const completedEpisodes = useMemo(() => {
        return modules.reduce((acc, module) => acc + module.completedEpisodes, 0);
    }, [modules]);

    const normalizedEarnedXp = useMemo(() => {
        if (courseProgress?.earnedXp != null) return courseProgress.earnedXp;

        return modules.reduce((acc, module) => {
            return acc + module.episodes.reduce((episodeAcc, episode) => episodeAcc + (episode.completed ? episode.xpReward ?? 0 : 0), 0);
        }, 0);
    }, [courseProgress?.earnedXp, modules]);

    const normalizedTotalXp = useMemo(() => {
        if (courseProgress?.totalXp != null) return courseProgress.totalXp;

        return modules.reduce((acc, module) => {
            return acc + module.episodes.reduce((episodeAcc, episode) => episodeAcc + (episode.xpReward ?? 0), 0);
        }, 0);
    }, [courseProgress?.totalXp, modules]);

    const overallProgress = useMemo(() => {
        if (courseProgress?.progressPercentage != null) return clamp(courseProgress.progressPercentage, 0, 100);

        if (modules.length === 0) return 0;

        const totalPercentage = modules.reduce((acc, module) => acc + clamp(module.progressPercentage, 0, 100), 0);
        return Math.round(totalPercentage / modules.length);
    }, [courseProgress?.progressPercentage, modules]);

    const hasEpisodes = totalEpisodes > 0;

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "calc(100vh - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: "#f7f7fb", minHeight: "calc(100vh - 64px)" }}>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Stack spacing={4}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {courseProgress && (
                        <Paper
                            sx={{
                                borderRadius: 4,
                                boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.08)",
                                p: { xs: 3, md: 4 },
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <Stack spacing={3}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                                    <Stack spacing={1.5} flex={1}>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.blue }}>
                                            {courseProgress.title}
                                        </Typography>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {courseProgress.difficultyLevel && (
                                                <Chip
                                                    label={mapDifficulty(courseProgress.difficultyLevel)}
                                                    sx={{
                                                        backgroundColor: colors.purple,
                                                        color: "white",
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}

                                            <Chip
                                                icon={<SchoolRoundedIcon />}
                                                label={`${modulesCount} módulo${modulesCount === 1 ? "" : "s"}`}
                                                sx={{ fontWeight: 600 }}
                                            />

                                            {hasEpisodes && (
                                                <Chip
                                                    icon={<ClassRoundedIcon />}
                                                    label={`${completedEpisodes}/${totalEpisodes} aulas concluídas`}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}

                                            {normalizedTotalXp > 0 && (
                                                <Chip
                                                    icon={<EmojiEventsRoundedIcon />}
                                                    label={`${numberFormatter.format(normalizedEarnedXp)} XP de ${numberFormatter.format(normalizedTotalXp)} XP`}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Stack>
                                    </Stack>

                                    <SEGButton
                                        colorTheme="gradient"
                                        startIcon={<PlayArrowRoundedIcon />}
                                        onClick={() => console.info("Ir para o curso", courseProgress.idCourse)}
                                        sx={{ alignSelf: { xs: "flex-start", md: "center" }, minWidth: 200 }}
                                    >
                                        Continuar curso
                                    </SEGButton>
                                </Stack>

                                {courseProgress.description && (
                                    <Typography variant="body1" sx={{ color: theme.palette.grey[700], maxWidth: 720 }}>
                                        {courseProgress.description}
                                    </Typography>
                                )}

                                <Stack spacing={1.5}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blue }}>
                                            Progresso geral
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.purple }}>
                                            {overallProgress}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={overallProgress}
                                        sx={{
                                            height: 12,
                                            borderRadius: 6,
                                            backgroundColor: theme.palette.grey[200],
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 6,
                                                background: `linear-gradient(90deg, ${colors.purple}, ${colors.blue})`,
                                            },
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    )}

                    <Stack spacing={3}>
                        {modules.map((module) => (
                            <Paper
                                key={module.id}
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: "0px 16px 32px rgba(33, 33, 52, 0.08)",
                                    p: { xs: 3, md: 4 },
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                <Stack spacing={2.5}>
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                                        <Stack spacing={0.5}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blue }}>
                                                {module.title}
                                            </Typography>
                                            {module.description && (
                                                <Typography variant="body2" sx={{ color: theme.palette.grey[700], maxWidth: 720 }}>
                                                    {module.description}
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Stack spacing={0.5} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                                            <Chip
                                                label={`Módulo ${module.order}`}
                                                sx={{ fontWeight: 600, alignSelf: { xs: "flex-start", md: "flex-end" } }}
                                            />
                                            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                                                {module.completedEpisodes}/{module.totalEpisodes} aulas concluídas
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.purple }}>
                                                Progresso do módulo
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.blue }}>
                                                {module.progressPercentage}%
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={module.progressPercentage}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: theme.palette.grey[200],
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: 5,
                                                    background: colors.blue,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <Divider />

                                    <Stack spacing={1.5}>
                                        {module.episodes.length === 0 && (
                                            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                                                Nenhum episódio cadastrado neste módulo ainda.
                                            </Typography>
                                        )}

                                        {module.episodes.map((episode) => (
                                            <Stack
                                                key={episode.id}
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.5}
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                justifyContent="space-between"
                                                sx={{
                                                    p: { xs: 1, sm: 1.5 },
                                                    borderRadius: 2,
                                                    backgroundColor: episode.completed
                                                        ? alpha(theme.palette.success.light, 0.2)
                                                        : theme.palette.grey[100],
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            backgroundColor: episode.completed
                                                                ? colors.purple
                                                                : theme.palette.grey[300],
                                                            color: "#ffffff",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {episode.order}
                                                    </Box>
                                                    <Stack spacing={0.25}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {episode.completed ? (
                                                                <CheckCircleRoundedIcon sx={{ color: colors.purple }} />
                                                            ) : (
                                                                <RadioButtonUncheckedRoundedIcon sx={{ color: theme.palette.grey[500] }} />
                                                            )}
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.blue }}>
                                                                {episode.title}
                                                            </Typography>
                                                        </Stack>
                                                        {episode.description && (
                                                            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                                                                {episode.description}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Stack>

                                                {episode.xpReward != null && episode.xpReward > 0 && (
                                                    <Chip
                                                        label={`${numberFormatter.format(episode.xpReward)} XP`}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}

                        {modules.length === 0 && !loading && !error && (
                            <Paper
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: "0px 16px 32px rgba(33, 33, 52, 0.08)",
                                    p: { xs: 4, md: 6 },
                                    backgroundColor: "#ffffff",
                                    textAlign: "center",
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blue, mb: 1 }}>
                                    Nenhum módulo disponível ainda
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.grey[600], maxWidth: 480, mx: "auto" }}>
                                    Assim que novos conteúdos forem publicados para este curso, eles aparecerão aqui com seu progresso atualizado.
                                </Typography>
                            </Paper>
                        )}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

function sanitizeCourseProgress(data: unknown): CourseDataAndProgress | null {
    if (!data || typeof data !== "object") return null;

    const record = data as Record<string, unknown>;
    const courseRecord = getObject(record["course"]) ?? record;
    const courseObj = courseRecord as Record<string, unknown>;
    const recordModules = record["modules"];
    const courseModules = courseObj["modules"];
    const recordCourseModules = record["course_modules"];

    const rawModules = Array.isArray(recordModules)
        ? recordModules
        : Array.isArray(courseModules)
            ? courseModules
            : Array.isArray(recordCourseModules)
                ? recordCourseModules
                : [];

    const sanitizedModules = rawModules
        .map((module, index) => sanitizeModule(module, index + 1))
        .filter((module): module is CourseProgressModule => module !== null);

    const idCourse = toNullableString(
        courseObj["id_course"] ??
        record["id_course"] ??
        record["course_id"],
    );
    const title = toNullableString(
        courseObj["title"] ??
        record["title"] ??
        courseObj["course_title"] ??
        record["course_title"],
    ) ?? "Curso";
    const description = toNullableString(
        courseObj["description"] ??
        record["description"] ??
        record["course_description"],
    );
    const difficultyLevel = toNullableString(
        courseObj["difficulty_level"] ??
        record["difficulty_level"] ??
        record["course_difficulty"],
    );
    const thumbnail = toNullableString(
        courseObj["link_thumbnail"] ??
        record["link_thumbnail"] ??
        record["thumbnail"],
    );

    const rawProgress = toNullableNumber(
        record["progress_percentage"] ??
        courseObj["progress_percentage"] ??
        record["progress"] ??
        courseObj["progress"],
    );
    const progressPercentage = rawProgress != null ? clamp(rawProgress, 0, 100) : null;

    const totalXp = toNullableNumber(
        record["total_xp"] ??
        record["xp_total"] ??
        courseObj["total_xp"] ??
        courseObj["xp_total"],
    );
    const earnedXp = toNullableNumber(
        record["earned_xp"] ??
        record["xp_earned"] ??
        courseObj["earned_xp"] ??
        courseObj["xp_earned"] ??
        record["current_xp"],
    );

    return {
        idCourse,
        title,
        description,
        difficultyLevel,
        thumbnail,
        progressPercentage,
        totalXp,
        earnedXp,
        modules: sanitizedModules,
    };
}

function sanitizeModule(module: unknown, fallbackIndex: number): CourseProgressModule | null {
    if (!module || typeof module !== "object") return null;

    const record = module as Record<string, unknown>;

    const rawEpisodesValue = record["episodes"];
    const rawModuleEpisodesValue = record["module_episodes"];

    const rawEpisodes = Array.isArray(rawEpisodesValue)
        ? rawEpisodesValue
        : Array.isArray(rawModuleEpisodesValue)
            ? rawModuleEpisodesValue
            : [];

    const sanitizedEpisodes = rawEpisodes
        .map((episode, index) => sanitizeEpisode(episode, index + 1))
        .filter((episode): episode is CourseProgressEpisode => episode !== null)
        .sort((a, b) => a.order - b.order);

    const totalEpisodes = toNumber(record["total_episodes"] ?? record["episodes_count"], sanitizedEpisodes.length);
    const completedEpisodes = toNumber(
        record["completed_episodes"] ?? record["episodes_completed"] ?? sanitizedEpisodes.filter((episode) => episode.completed).length,
        sanitizedEpisodes.filter((episode) => episode.completed).length,
    );

    const progressPercentage = (() => {
        const provided = toNullableNumber(record["progress_percentage"] ?? record["progress"] ?? record["completion_percentage"]);
        if (provided != null) return clamp(provided, 0, 100);

        const normalizedTotal = totalEpisodes > 0 ? totalEpisodes : sanitizedEpisodes.length;
        if (normalizedTotal === 0) return 0;
        const normalizedCompleted = Math.min(completedEpisodes, normalizedTotal);
        return clamp(Math.round((normalizedCompleted * 100) / normalizedTotal), 0, 100);
    })();

    const title = toNullableString(record["title"] ?? record["module_title"]) ?? `Módulo ${fallbackIndex}`;
    const description = toNullableString(record["description"] ?? record["module_description"]);
    const id = toIdentifier(record["id_module"] ?? record["module_id"] ?? record["id"] ?? record["module_identifier"], `module-${fallbackIndex}`);
    const order = toNumber(record["order"] ?? record["sequence"] ?? fallbackIndex, fallbackIndex);

    return {
        id,
        title,
        description,
        order,
        progressPercentage,
        totalEpisodes: totalEpisodes || sanitizedEpisodes.length,
        completedEpisodes: Math.min(completedEpisodes, totalEpisodes || sanitizedEpisodes.length),
        episodes: sanitizedEpisodes,
    };
}

function sanitizeEpisode(episode: unknown, fallbackIndex: number): CourseProgressEpisode | null {
    if (!episode || typeof episode !== "object") return null;

    const record = episode as Record<string, unknown>;

    const id = toIdentifier(
        record["id_module_episode"] ?? record["module_episode_id"] ?? record["id_episode"] ?? record["id"] ?? record["episode_id"],
        `episode-${fallbackIndex}`,
    );
    const title = toNullableString(record["title"] ?? record["episode_title"]) ?? `Episódio ${fallbackIndex}`;
    const description = toNullableString(record["description"] ?? record["episode_description"]);
    const order = toNumber(record["order"] ?? record["sequence"] ?? record["episode_order"] ?? fallbackIndex, fallbackIndex);
    const xpReward = toNullableNumber(record["xp_reward"] ?? record["reward_xp"] ?? record["xp"] ?? record["reward"]);

    const completed = toBoolean(
        record["completed"] ??
        record["finished"] ??
        record["done"] ??
        record["watched"] ??
        record["is_completed"] ??
        record["is_done"] ??
        (typeof record["status"] === "string" ? record["status"].toLowerCase() === "completed" || record["status"].toLowerCase() === "done" : null),
    );

    const completedAt = toNullableString(
        record["completed_at"] ??
        record["finished_at"] ??
        record["watched_at"] ??
        record["done_at"] ??
        record["updated_at"],
    );

    return {
        id,
        title,
        description,
        order,
        xpReward,
        completed,
        completedAt,
    };
}

function toNullableString(value: unknown): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return null;
}

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

function toNullableNumber(value: unknown): number | null {
    const parsed = toNumber(value, NaN);
    return Number.isFinite(parsed) ? parsed : null;
}

function toIdentifier(value: unknown, fallback: string): string {
    const stringValue = toNullableString(value);
    return stringValue ?? fallback;
}

function toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return ["1", "true", "yes", "y", "s", "sim", "completed", "done", "finished"].includes(normalized);
    }
    if (typeof value === "number") {
        return value !== 0;
    }
    return false;
}

function clamp(value: number | null, min: number, max: number): number {
    if (value == null || !Number.isFinite(value)) return min;
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function getObject(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

export default CourseDataAndProgressPage;
