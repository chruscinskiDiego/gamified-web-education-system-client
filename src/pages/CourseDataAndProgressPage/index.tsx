import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
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

const SNIFF_BYTE_LENGTH = 2048;
const SNIFF_RANGE_HEADER = `bytes=0-${SNIFF_BYTE_LENGTH - 1}`;

const asciiDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("ascii") : undefined;

const decodeAscii = (bytes: Uint8Array, start: number, end: number) => {
    const slice = bytes.slice(start, end);

    if (asciiDecoder) {
        return asciiDecoder.decode(slice);
    }

    return Array.from(slice)
        .map((byte) => String.fromCharCode(byte))
        .join("");
};

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

const resolveMediaTypeFromHeaders = (headers: Headers): EpisodeMediaType => {
    const contentType = headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.startsWith("video/")) {
        return "video";
    }

    if (contentType.startsWith("image/")) {
        return "image";
    }

    if (contentType.includes("pdf")) {
        return "pdf";
    }

    if (contentType.startsWith("text/")) {
        return "text";
    }

    const contentDisposition = headers.get("content-disposition") ?? "";
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);

    if (filenameMatch) {
        const filename = filenameMatch[1]?.replace(/['"]/g, "").trim();
        if (filename) {
            return getEpisodeMediaType(filename);
        }
    }

    return "external";
};

const detectMediaTypeFromBuffer = (buffer: ArrayBuffer): EpisodeMediaType | null => {
    const bytes = new Uint8Array(buffer);

    if (bytes.length >= 4) {
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            return "pdf";
        }

        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return "image";
        }

        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
            return "image";
        }

        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
            return "image";
        }

        if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
            return "image";
        }

        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            const format = decodeAscii(bytes, 8, 12);

            if (format === "WEBP") {
                return "image";
            }

            return "video";
        }

        if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
            return "video";
        }

        if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
            return "video";
        }
    }

    if (bytes.length >= 12) {
        const brand = decodeAscii(bytes, 4, 12);

        if (brand.includes("ftyp")) {
            return "video";
        }
    }

    return null;
};

const probeVideo = (src: string): Promise<boolean> => new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
        video.removeAttribute("src");
        try {
            video.load();
        } catch {
            // ignore load errors during cleanup
        }
    };

    const handleLoadedMetadata = () => {
        cleanup();
        resolve(true);
    };

    const handleError = () => {
        cleanup();
        resolve(false);
    };

    video.addEventListener("loadeddata", handleLoadedMetadata, { once: true });
    video.addEventListener("error", handleError, { once: true });

    video.src = src;
});

const probeImage = (src: string): Promise<boolean> => new Promise((resolve) => {
    const image = new Image();

    const handleLoad = () => resolve(true);
    const handleError = () => resolve(false);

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });

    image.src = src;
});

const probePdf = async (src: string, signal: AbortSignal): Promise<boolean> => {
    try {
        const response = await fetch(src, {
            method: "GET",
            headers: { Range: SNIFF_RANGE_HEADER },
            signal,
        });

        if (!response.ok) {
            return false;
        }

        const resolvedType = resolveMediaTypeFromHeaders(response.headers);

        if (resolvedType === "pdf") {
            return true;
        }

        if (resolvedType === "video" || resolvedType === "image") {
            return false;
        }

        const buffer = await response.arrayBuffer();
        return detectMediaTypeFromBuffer(buffer) === "pdf";
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return false;
        }

        return false;
    }
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

    const [mediaType, setMediaType] = useState<EpisodeMediaType>("text");
    const [isResolvingMediaType, setIsResolvingMediaType] = useState(false);
    const [videoWatchProgress, setVideoWatchProgress] = useState(0);

    useEffect(() => {
        if (!selectedEpisode) {
            setMediaType("text");
            setIsResolvingMediaType(false);
            setVideoWatchProgress(0);
            return;
        }

        const { link_episode: linkEpisode } = selectedEpisode;

        if (!linkEpisode) {
            setMediaType("text");
            setIsResolvingMediaType(false);
            setVideoWatchProgress(selectedEpisode.completed ? 1 : 0);
            return;
        }

        const inferredType = getEpisodeMediaType(linkEpisode);

        if (inferredType !== "external") {
            setMediaType(inferredType);
            setIsResolvingMediaType(false);
            setVideoWatchProgress(selectedEpisode.completed ? 1 : 0);
            return;
        }

        let isActive = true;
        const abortController = new AbortController();

        const resolveMediaType = async () => {
            setIsResolvingMediaType(true);

            const isVideo = await probeVideo(linkEpisode);

            if (!isActive) return;

            if (isVideo) {
                setMediaType("video");
                setIsResolvingMediaType(false);
                setVideoWatchProgress(selectedEpisode.completed ? 1 : 0);
                return;
            }

            const isImage = await probeImage(linkEpisode);

            if (!isActive) return;

            if (isImage) {
                setMediaType("image");
                setIsResolvingMediaType(false);
                setVideoWatchProgress(selectedEpisode.completed ? 1 : 0);
                return;
            }

            const isPdf = await probePdf(linkEpisode, abortController.signal);

            if (!isActive) return;

            setMediaType(isPdf ? "pdf" : "external");
            setIsResolvingMediaType(false);
            setVideoWatchProgress(selectedEpisode.completed ? 1 : 0);
        };

        void resolveMediaType();

        return () => {
            isActive = false;
            abortController.abort();
        };
    }, [selectedEpisode]);

    useEffect(() => {
        if (!selectedEpisode) {
            setVideoWatchProgress(0);
            return;
        }

        if (selectedEpisode.completed) {
            setVideoWatchProgress(1);
            return;
        }

        if (mediaType !== "video") {
            setVideoWatchProgress(0);
        }
    }, [mediaType, selectedEpisode]);

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

        if (mediaType === "video" && videoWatchProgress < 0.75) {
            return;
        }

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

    const mediaIcon = (() => {
        if (isResolvingMediaType) {
            return <ArticleIcon color="secondary" />;
        }

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

    const handleVideoTimeUpdate = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        const { currentTarget } = event;
        const { currentTime, duration } = currentTarget;

        if (!duration || Number.isNaN(duration) || duration === Infinity) {
            return;
        }

        const progress = currentTime / duration;

        setVideoWatchProgress((previousProgress) => Math.max(previousProgress, Math.min(progress, 1)));
    }, []);

    const handleVideoLoadedMetadata = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        const { currentTarget } = event;
        const { currentTime, duration } = currentTarget;

        if (!duration || Number.isNaN(duration) || duration === Infinity) {
            return;
        }

        const progress = currentTime / duration;

        setVideoWatchProgress((previousProgress) => Math.max(previousProgress, Math.min(progress, 1)));
    }, []);

    const handleVideoEnded = useCallback(() => {
        setVideoWatchProgress(1);
    }, []);

    const canMarkSelectedEpisodeAsCompleted = useMemo(() => {
        if (!selectedEpisode || selectedEpisode.completed) return false;

        if (isSelectedEpisodeLocked) return false;

        if (mediaType === "video") {
            return videoWatchProgress >= 0.75;
        }

        return true;
    }, [isSelectedEpisodeLocked, mediaType, selectedEpisode, videoWatchProgress]);

    return (
        <Box sx={{ backgroundColor: "white", minHeight: "calc(100vh - 32px)", py: { xs: 3 } }}>
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
                                        isResolvingMediaType ? (
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
                                                <CircularProgress color="secondary" />
                                            </Box>
                                        ) : (
                                            <Stack spacing={2.5}>
                                                {mediaType === "video" && selectedEpisode.link_episode && (
                                                    <Box sx={{ borderRadius: 2, overflow: "hidden", backgroundColor: "black" }}>
                                                        <video
                                                            src={selectedEpisode.link_episode}
                                                            controls
                                                            onTimeUpdate={handleVideoTimeUpdate}
                                                            onLoadedMetadata={handleVideoLoadedMetadata}
                                                            onEnded={handleVideoEnded}
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
                                                    <Stack spacing={1.5}>
                                                        <Box sx={{ height: { xs: 360, md: 480 }, borderRadius: 2, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                                                            <iframe
                                                                src={`${selectedEpisode.link_episode}#view=FitH`}
                                                                style={{ border: "none", width: "100%", height: "100%" }}
                                                                title={selectedEpisode.title}
                                                            />
                                                        </Box>
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            component="a"
                                                            href={selectedEpisode.link_episode}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                        >
                                                            Baixar PDF
                                                        </SEGButton>
                                                    </Stack>
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
                                        )
                                    ) : (
                                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                            Selecione uma aula para visualizar o conteúdo.
                                        </Typography>
                                    )}

                                    {selectedEpisode && (
                                        <SEGButton
                                            colorTheme="gradient"
                                            onClick={handleCompleteEpisode}
                                            disabled={!canMarkSelectedEpisodeAsCompleted}
                                            title={
                                                mediaType === "video" && !selectedEpisode.completed && videoWatchProgress < 0.75
                                                    ? "Assista pelo menos 75% do vídeo para concluir a aula."
                                                    : undefined
                                            }
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
