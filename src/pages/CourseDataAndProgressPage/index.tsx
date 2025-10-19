import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArticleIcon from "@mui/icons-material/Article";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import { useParams } from "react-router-dom";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import SEGButton from "../../components/SEGButton";
import { colors } from "../../theme/colors";
import { api } from "../../lib/axios";

interface CourseEpisode {
    order: number;
    title: string;
    completed: boolean;
    description: string;
    link_episode: string | null;
    id_module_episode: number;
}

interface CourseModule {
    order: number;
    title: string;
    description: string;
    id_course_module: number;
    module_completed: boolean;
    episodes: CourseEpisode[];
}

interface CourseData {
    title: string;
    modules: CourseModule[];
    id_course: string;
    description: string;
    difficulty_level: string;
}

type EpisodeMediaType = "text" | "video" | "image" | "pdf" | "external";

const createEmptyCourseState = (): CourseData => ({
    title: "",
    modules: [],
    id_course: "",
    description: "",
    difficulty_level: "",
});

const getEpisodeMediaType = (link: string | null): EpisodeMediaType => {
    if (!link) return "text";

    let pathname = link;

    try {
        const url = new URL(link);
        pathname = url.pathname;
    } catch (error) {
        // ignore invalid URL parsing and fallback to the raw string
    }

    const cleanPath = pathname.split("?")[0];
    const extension = cleanPath.includes(".") ? cleanPath.split(".").pop()?.toLowerCase() ?? "" : "";

    if (["mp4", "webm", "ogg", "mov", "m4v"].includes(extension)) {
        return "video";
    }

    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)) {
        return "image";
    }

    if (extension === "pdf") {
        return "pdf";
    }

    if (link.includes("youtube.com") || link.includes("youtu.be") || link.includes("vimeo.com")) {
        return "video";
    }

    return "external";

};

const sanitizeCourse = (course: CourseData): CourseData => ({
        ...course,
        modules: course.modules.map((module) => {
            const sanitizedEpisodes = module.episodes
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((episode) => ({
                    ...episode,
                    completed: Boolean(episode.completed),
                }));

            const isModuleCompleted = sanitizedEpisodes.every((episode) => episode.completed);

            return {
                ...module,
                episodes: sanitizedEpisodes,
                module_completed: isModuleCompleted,
            };
        })
            .slice()
            .sort((a, b) => a.order - b.order),
    });

const CourseDataAndProgressPage: React.FC = () => {

    const { id } = useParams();
    const [courseData, setCourseData] = useState<CourseData>(() => sanitizeCourse(createEmptyCourseState()));
    const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);


    const orderedModules = useMemo(() => courseData.modules.slice().sort((a, b) => a.order - b.order), [courseData.modules]);

    const totalEpisodes = useMemo(() => orderedModules.reduce((acc, module) => acc + module.episodes.length, 0), [orderedModules]);

    const completedEpisodes = useMemo(() => orderedModules.reduce((acc, module) => acc + module.episodes.filter((episode) => episode.completed).length, 0), [orderedModules]);

    const overallProgress = totalEpisodes > 0 ? (completedEpisodes / totalEpisodes) * 100 : 0;

    const selectedModule = useMemo(() => orderedModules.find((module) => module.id_course_module === selectedModuleId) ?? null, [orderedModules, selectedModuleId]);

    const selectedEpisode = useMemo(() => selectedModule?.episodes.find((episode) => episode.id_module_episode === selectedEpisodeId) ?? null, [selectedModule, selectedEpisodeId]);

    const getCourseDataAndProgress = useCallback(async () => {
        if (!id) return;

        try {
            const response = await api.get(`/course/data-and-progress/${id}`);

            if (response?.status === 200) {
                const sanitizedCourse = sanitizeCourse(response?.data);
                const modulesOrdered = sanitizedCourse.modules.slice().sort((a, b) => a.order - b.order);
                const firstModuleId = modulesOrdered[0]?.id_course_module ?? null;
                const firstEpisodeId = modulesOrdered[0]?.episodes[0]?.id_module_episode ?? null;

                setCourseData(sanitizedCourse);
                setExpandedModuleId(firstModuleId);
                setSelectedModuleId(firstModuleId);
                setSelectedEpisodeId(firstEpisodeId);
            }
        } catch (error) {
            console.error("Erro ao buscar dados do curso e progresso", error);
        }
    }, [id]);

    useEffect(() => {
        getCourseDataAndProgress();
    }, [getCourseDataAndProgress]);
    const isModuleLocked = useCallback((moduleId: number, modulesList: CourseModule[] = orderedModules) => {
        const modulesSorted = modulesList.slice().sort((a, b) => a.order - b.order);
        const moduleIndex = modulesSorted.findIndex((module) => module.id_course_module === moduleId);

        if (moduleIndex === -1) return true;

        if (moduleIndex === 0) return false;

        const previousModules = modulesSorted.slice(0, moduleIndex);

        return !previousModules.every((module) => module.episodes.every((episode) => episode.completed));
    }, [orderedModules]);

    const isEpisodeLocked = useCallback((moduleId: number, episodeId: number, modulesList: CourseModule[] = orderedModules) => {
        const modulesSorted = modulesList.slice().sort((a, b) => a.order - b.order);
        const module = modulesSorted.find((item) => item.id_course_module === moduleId);

        if (!module) return true;

        if (isModuleLocked(moduleId, modulesSorted)) return true;

        const episodeIndex = module.episodes.findIndex((episode) => episode.id_module_episode === episodeId);

        if (episodeIndex === -1) return true;

        if (episodeIndex === 0) return false;

        const previousEpisodes = module.episodes.slice(0, episodeIndex);

        return !previousEpisodes.every((episode) => episode.completed);
    }, [isModuleLocked, orderedModules]);

    const isSelectedEpisodeLocked = useMemo(() => {
        if (!selectedModule || !selectedEpisode) return true;

        return isEpisodeLocked(selectedModule.id_course_module, selectedEpisode.id_module_episode);
    }, [isEpisodeLocked, selectedEpisode, selectedModule]);

    const handleExpandModule = (_: React.SyntheticEvent, isExpanded: boolean, moduleId: number) => {
        setExpandedModuleId(isExpanded ? moduleId : null);
    };

    const handleSelectEpisode = (moduleId: number, episodeId: number) => {
        if (isEpisodeLocked(moduleId, episodeId)) {
            return;
        }

        setSelectedModuleId(moduleId);
        setSelectedEpisodeId(episodeId);
        setExpandedModuleId(moduleId);
    };

    const handleCompleteEpisode = () => {
        if (selectedModuleId == null || selectedEpisodeId == null) return;

        if (isEpisodeLocked(selectedModuleId, selectedEpisodeId)) return;

        const updatedModules = courseData.modules.map((module) => {
            if (module.id_course_module !== selectedModuleId) return module;

            const updatedEpisodes = module.episodes.map((episode) => {
                if (episode.id_module_episode !== selectedEpisodeId) return episode;

                if (episode.completed) return episode;

                return { ...episode, completed: true };
            });

            const moduleCompleted = updatedEpisodes.every((episode) => episode.completed);

            return {
                ...module,
                episodes: updatedEpisodes,
                module_completed: moduleCompleted,
            };
        });

        const updatedCourse: CourseData = {
            ...courseData,
            modules: updatedModules,
        };

        const updatedModulesSorted = updatedModules.slice().sort((a, b) => a.order - b.order);
        const currentModuleIndex = updatedModulesSorted.findIndex((module) => module.id_course_module === selectedModuleId);
        const currentModule = updatedModulesSorted[currentModuleIndex];
        const currentEpisodeIndex = currentModule?.episodes.findIndex((episode) => episode.id_module_episode === selectedEpisodeId) ?? -1;

        let nextModuleId = selectedModuleId;
        let nextEpisodeId = selectedEpisodeId;

        if (currentModule && currentEpisodeIndex > -1) {
            const nextEpisode = currentModule.episodes[currentEpisodeIndex + 1];

            if (nextEpisode && !isEpisodeLocked(currentModule.id_course_module, nextEpisode.id_module_episode, updatedModulesSorted)) {
                nextEpisodeId = nextEpisode.id_module_episode;
                nextModuleId = currentModule.id_course_module;
            } else {
                const followingModule = updatedModulesSorted[currentModuleIndex + 1];

                if (followingModule && !isModuleLocked(followingModule.id_course_module, updatedModulesSorted)) {
                    nextModuleId = followingModule.id_course_module;
                    const firstEpisode = followingModule.episodes[0];

                    if (firstEpisode) {
                        nextEpisodeId = firstEpisode.id_module_episode;
                    }
                }
            }
        }

        setCourseData(updatedCourse);
        setSelectedModuleId(nextModuleId);
        setSelectedEpisodeId(nextEpisodeId);
        setExpandedModuleId(nextModuleId);
    };

    const mediaType = getEpisodeMediaType(selectedEpisode?.link_episode ?? null);

    const mediaIcon = (() => {
        switch (mediaType) {
            case "pdf":
                return <PictureAsPdfIcon color="secondary" />;
            case "image":
                return <ImageIcon color="secondary" />;
            case "video":
                return <OndemandVideoIcon color="secondary" />;
            case "external":
                return <ArticleIcon color="secondary" />;
            default:
                return <ArticleIcon color="secondary" />;
        }
    })();

    const shouldTruncateDescription = courseData.description.length > 480;

    const toggleDescription = () => {
        setIsDescriptionExpanded((previous) => !previous);
    };

    const handleOpenExternalEpisode = () => {
        if (!selectedEpisode?.link_episode) return;

        window.open(selectedEpisode.link_episode, "_blank", "noopener,noreferrer");
    };

    return (
        <Box sx={{ backgroundColor: "#f6f7fb", minHeight: "calc(100vh - 64px)", py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <Grid container rowSpacing={4} columnSpacing={4} alignItems="flex-start">
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: 3,
                                boxShadow: "0 12px 34px rgba(93,112,246,0.12)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="overline" sx={{ color: colors.purple, fontWeight: 700 }}>
                                    Curso #{id ?? courseData.id_course}
                                </Typography>

                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {courseData.title}
                                </Typography>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                    <Chip label={`Dificuldade: ${mapDifficulty(courseData.difficulty_level)}`} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                                    <Chip label={`${completedEpisodes} de ${totalEpisodes} aulas concluídas`} color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                                </Stack>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}>
                                        Progresso geral
                                    </Typography>
                                    <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5 }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Stack spacing={3} sx={{ height: "100%" }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2.5, md: 3 },
                                    borderRadius: 3,
                                    boxShadow: "0 12px 34px rgba(93,112,246,0.12)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2.5,
                                }}
                            >
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        {mediaIcon}
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {selectedEpisode?.title ?? "Selecione uma aula"}
                                        </Typography>
                                    </Stack>

                                    <Divider />

                                    {selectedEpisode ? (
                                        <Stack spacing={2.5}>
                                            {mediaType === "video" && selectedEpisode.link_episode && (
                                                <Box sx={{ borderRadius: 2, overflow: "hidden", backgroundColor: "black" }}>
                                                    <video
                                                        src={selectedEpisode.link_episode}
                                                        controls
                                                        style={{ width: "100%", display: "block" }}
                                                    >
                                                        Seu navegador não suporta a reprodução de vídeo.
                                                    </video>
                                                </Box>
                                            )}

                                            {mediaType === "image" && selectedEpisode.link_episode && (
                                                <Box
                                                    component="img"
                                                    src={selectedEpisode.link_episode}
                                                    alt={selectedEpisode.title}
                                                    loading="lazy"
                                                    sx={{ width: "100%", borderRadius: 2, objectFit: "cover" }}
                                                />
                                            )}

                                            {mediaType === "pdf" && selectedEpisode.link_episode && (
                                                <Box sx={{ height: { xs: 360, md: 480 }, borderRadius: 2, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                                                    <iframe
                                                        src={`${selectedEpisode.link_episode}#view=FitH`}
                                                        style={{ border: "none", width: "100%", height: "100%" }}
                                                        title={selectedEpisode.title}
                                                    />
                                                </Box>
                                            )}

                                            {mediaType === "external" && selectedEpisode.link_episode && (
                                                <Stack spacing={1.5}>
                                                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                                        Abrimos este conteúdo em uma nova aba porque o formato não pôde ser identificado automaticamente.
                                                    </Typography>
                                                    <SEGButton colorTheme="outlined" onClick={handleOpenExternalEpisode}>
                                                        Abrir conteúdo em nova aba
                                                    </SEGButton>
                                                </Stack>
                                            )}

                                            <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                                {selectedEpisode.description}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                            Selecione uma aula para visualizar o conteúdo.
                                        </Typography>
                                    )}

                                    {selectedEpisode && (
                                        <SEGButton
                                            colorTheme="gradient"
                                            onClick={handleCompleteEpisode}
                                            disabled={selectedEpisode.completed || isSelectedEpisodeLocked}
                                            sx={{ mt: 1 }}
                                        >
                                            {selectedEpisode.completed ? "Aula concluída" : "Marcar aula como concluída"}
                                        </SEGButton>
                                    )}
                                </Stack>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2.5, md: 3 },
                                    borderRadius: 3,
                                    boxShadow: "0 12px 34px rgba(93,112,246,0.12)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Sobre o curso
                                    </Typography>
                                    <Box sx={{ position: "relative" }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                whiteSpace: "pre-line",
                                                display: "-webkit-box",
                                                WebkitBoxOrient: "vertical",
                                                WebkitLineClamp: isDescriptionExpanded || !shouldTruncateDescription ? "unset" : 6,
                                                overflow: "hidden",
                                            }}
                                        >
                                            {courseData.description}
                                        </Typography>
                                        {!isDescriptionExpanded && shouldTruncateDescription && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 96,
                                                    background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 80%)",
                                                }}
                                            />
                                        )}
                                    </Box>
                                    {shouldTruncateDescription && (
                                        <Button
                                            variant="text"
                                            onClick={toggleDescription}
                                            sx={{ alignSelf: "flex-start", fontWeight: 600, textTransform: "none" }}
                                        >
                                            {isDescriptionExpanded ? "Ver menos" : "Ver mais..."}
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                borderRadius: 3,
                                boxShadow: "0 12px 34px rgba(93,112,246,0.12)",
                                position: { md: "sticky" },
                                top: { md: 104 },
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Conteúdo do curso
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Finalize cada aula para desbloquear a próxima
                                </Typography>

                                <Divider />

                                <Stack spacing={1.5}>
                                    {orderedModules.map((module) => {
                                        const moduleLocked = isModuleLocked(module.id_course_module);
                                        const episodesCompleted = module.episodes.filter((episode) => episode.completed).length;
                                        const moduleProgress = module.episodes.length > 0 ? (episodesCompleted / module.episodes.length) * 100 : 0;

                                        return (
                                            <Accordion
                                                key={module.id_course_module}
                                                expanded={expandedModuleId === module.id_course_module}
                                                onChange={(event, expanded) => handleExpandModule(event, expanded, module.id_course_module)}
                                                disableGutters
                                                square={false}
                                                sx={{
                                                    borderRadius: 2,
                                                    border: "1px solid rgba(93,112,246,0.12)",
                                                    "&:before": { display: "none" },
                                                    boxShadow: "none",
                                                    backgroundColor: expandedModuleId === module.id_course_module ? "rgba(93,112,246,0.05)" : "#fff",
                                                }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Stack spacing={1} sx={{ width: "100%" }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                {module.order}. {module.title}
                                                            </Typography>
                                                            <Chip
                                                                size="small"
                                                                color={module.module_completed ? "success" : moduleLocked ? "default" : "primary"}
                                                                label={module.module_completed ? "Concluído" : moduleLocked ? "Bloqueado" : "Em andamento"}
                                                            />
                                                        </Stack>
                                                        <LinearProgress variant="determinate" value={moduleProgress} sx={{ height: 6, borderRadius: 3 }} />
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <List disablePadding>
                                                        {module.episodes.map((episode) => {
                                                            const locked = isEpisodeLocked(module.id_course_module, episode.id_module_episode);
                                                            const isSelected = selectedEpisodeId === episode.id_module_episode;

                                                            return (
                                                                <ListItemButton
                                                                    key={episode.id_module_episode}
                                                                    onClick={() => handleSelectEpisode(module.id_course_module, episode.id_module_episode)}
                                                                    disabled={locked}
                                                                    selected={isSelected}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        mb: 1,
                                                                        alignItems: "flex-start",
                                                                        backgroundColor: isSelected ? "rgba(93,112,246,0.12)" : undefined,
                                                                    }}
                                                                >
                                                                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                                                        {episode.completed ? (
                                                                            <CheckCircleIcon color="success" fontSize="small" />
                                                                        ) : locked ? (
                                                                            <LockIcon color="disabled" fontSize="small" />
                                                                        ) : (
                                                                            <PlayCircleOutlineIcon color="primary" fontSize="small" />
                                                                        )}
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: episode.completed ? 600 : 500 }}>
                                                                                {episode.order}. {episode.title}
                                                                            </Typography>
                                                                        }
                                                                        secondary={
                                                                            <Typography variant="caption" sx={{ color: episode.completed ? "success.main" : "text.secondary" }}>
                                                                                {episode.completed ? "Aula concluída" : locked ? "Conclua as anteriores" : "Clique para assistir"}
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </ListItemButton>
                                                            );
                                                        })}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CourseDataAndProgressPage;
