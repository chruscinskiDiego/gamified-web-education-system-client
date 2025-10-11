import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Paper,
    Grid,
    Typography,
    Divider,
    Stack,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate, useParams } from "react-router-dom";

import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import { colors } from "../../theme/colors";

interface ModuleEpisode {
    order: number;
    title: string;
    created_at: string;
    description: string;
    link_episode: string | null;
    id_module_episode: number;
}

interface ModuleEpisodeWithAttachments extends ModuleEpisode {
    attachments: File[];
}

interface ModuleManagementPayload {
    id_course_module: number;
    title: string;
    description: string;
    created_at: string;
    module_episodes: ModuleEpisode[];
}

const MOCK_MODULE: ModuleManagementPayload = {
    id_course_module: 3,
    title: "Fund. de Prog. 3",
    description: "Um curso muito legal e interativo sobre code",
    created_at: "2025-10-05T23:04:16.192Z",
    module_episodes: [
        {
            order: 1,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:02.278986",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 4,
        },
        {
            order: 2,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:04.762288",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 5,
        },
        {
            order: 3,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:08.106664",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 6,
        },
        {
            order: 4,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:11.258959",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 7,
        },
        {
            order: 5,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:14.851338",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 8,
        },
        {
            order: 6,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:18.00851",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 9,
        },
        {
            order: 7,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:21.119995",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 10,
        },
        {
            order: 8,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:24.477887",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 11,
        },
        {
            order: 9,
            title: "Fund. de Prog. 3",
            created_at: "2025-10-05T20:05:29.058673",
            description: "Um curso muito legal e interativo sobre code",
            link_episode: null,
            id_module_episode: 12,
        },
    ],
};

const fileAccept = "video/*,image/*,application/pdf,text/plain";

const ModuleManagementPage: React.FC = () => {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [moduleData, setModuleData] = useState<ModuleManagementPayload | null>(null);

    const [moduleTitle, setModuleTitle] = useState<string>("");
    const [moduleDescription, setModuleDescription] = useState<string>("");

    const [isSavingModule, setIsSavingModule] = useState<boolean>(false);

    const [episodes, setEpisodes] = useState<ModuleEpisodeWithAttachments[]>([]);
    const [hasInitialEpisodesLoaded, setHasInitialEpisodesLoaded] = useState<boolean>(false);

    const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
    const [episodeDraft, setEpisodeDraft] = useState<Partial<ModuleEpisode>>({});
    const [episodeSaving, setEpisodeSaving] = useState<boolean>(false);

    const [episodeToDelete, setEpisodeToDelete] = useState<number | null>(null);

    const [isCreatingEpisode, setIsCreatingEpisode] = useState<boolean>(false);
    const [newEpisodeDraft, setNewEpisodeDraft] = useState<ModuleEpisode>({
        order: episodes.length + 1,
        title: "",
        created_at: new Date().toISOString(),
        description: "",
        link_episode: null,
        id_module_episode: Date.now(),
    });
    const [creatingEpisode, setCreatingEpisode] = useState<boolean>(false);

    const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

    const orderedEpisodes = useMemo(
        () =>
            [...episodes].sort((episodeA, episodeB) => {
                if (episodeA.order === episodeB.order) {
                    return episodeA.id_module_episode - episodeB.id_module_episode;
                }
                return episodeA.order - episodeB.order;
            }),
        [episodes],
    );

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            setModuleData(MOCK_MODULE);
            setLoading(false);
        }, 350);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!moduleData) return;

        setModuleTitle(moduleData.title);
        setModuleDescription(moduleData.description);

        if (!hasInitialEpisodesLoaded) {
            const enhancedEpisodes = moduleData.module_episodes.map((episode) => ({
                ...episode,
                attachments: [],
            }));
            setEpisodes(enhancedEpisodes);
            setHasInitialEpisodesLoaded(true);
        }
    }, [moduleData, hasInitialEpisodesLoaded]);

    const formattedCreatedAt = useMemo(() => {
        if (!moduleData?.created_at) return "-";
        return new Date(moduleData.created_at).toLocaleString("pt-BR", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }, [moduleData?.created_at]);

    const handleNavigateBack = () => {
        navigate(-1);
    };

    const handleResetModuleForm = () => {
        if (!moduleData) return;
        setModuleTitle(moduleData.title);
        setModuleDescription(moduleData.description);
    };

    const handleSaveModule = () => {
        if (!moduleTitle.trim() || !moduleDescription.trim()) {
            SEGPrincipalNotificator(
                "Título e descrição do módulo são obrigatórios.",
                "warning",
                "Campos obrigatórios",
            );
            return;
        }

        setIsSavingModule(true);
        setTimeout(() => {
            setModuleData((prev) =>
                prev
                    ? {
                        ...prev,
                        title: moduleTitle.trim(),
                        description: moduleDescription.trim(),
                    }
                    : prev,
            );
            setIsSavingModule(false);
            SEGPrincipalNotificator("Módulo atualizado com sucesso!", "success", "Sucesso");
        }, 500);
    };

    const startEpisodeEdition = (episode: ModuleEpisodeWithAttachments) => {
        setEditingEpisodeId(episode.id_module_episode);
        setEpisodeDraft({
            order: episode.order,
            title: episode.title,
            description: episode.description,
            link_episode: episode.link_episode,
            created_at: episode.created_at,
            id_module_episode: episode.id_module_episode,
        });
    };

    const handleEpisodeDraftChange = <K extends keyof ModuleEpisode>(key: K, value: ModuleEpisode[K]) => {
        setEpisodeDraft((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleCancelEpisodeEdition = () => {
        setEditingEpisodeId(null);
        setEpisodeDraft({});
    };

    const handleSaveEpisode = () => {
        if (!editingEpisodeId || !episodeDraft.title?.trim() || !episodeDraft.description?.trim()) {
            SEGPrincipalNotificator(
                "Preencha pelo menos título e descrição do episódio.",
                "warning",
                "Dados incompletos",
            );
            return;
        }
        setEpisodeSaving(true);
        setTimeout(() => {
            setEpisodes((prevEpisodes) =>
                prevEpisodes.map((episode) =>
                    episode.id_module_episode === editingEpisodeId
                        ? {
                            ...episode,
                            title: episodeDraft.title?.trim() ?? episode.title,
                            description: episodeDraft.description?.trim() ?? episode.description,
                            order: Number(episodeDraft.order ?? episode.order),
                            link_episode: episodeDraft.link_episode ?? episode.link_episode,
                        }
                        : episode,
                ),
            );
            setEpisodeSaving(false);
            setEditingEpisodeId(null);
            setEpisodeDraft({});
            SEGPrincipalNotificator("Episódio atualizado!", "success", "Sucesso");
        }, 400);
    };

    const openDeleteDialog = (episodeId: number) => {
        setEpisodeToDelete(episodeId);
    };

    const handleConfirmDeleteEpisode = () => {
        if (!episodeToDelete) return;
        setEpisodes((prevEpisodes) => prevEpisodes.filter((ep) => ep.id_module_episode !== episodeToDelete));
        setEpisodeToDelete(null);
        SEGPrincipalNotificator("Episódio removido do módulo.", "success", "Removido");
    };

    const handleCancelDeleteEpisode = () => {
        setEpisodeToDelete(null);
    };

    const handleEpisodeUpload = (episodeId: number, files: FileList | null) => {
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);

        setEpisodes((prevEpisodes) =>
            prevEpisodes.map((episode) =>
                episode.id_module_episode === episodeId
                    ? {
                        ...episode,
                        attachments: [...episode.attachments, ...selectedFiles],
                    }
                    : episode,
            ),
        );

        if (fileInputsRef.current[episodeId]) {
            fileInputsRef.current[episodeId]!.value = "";
        }

        SEGPrincipalNotificator("Arquivo(s) anexado(s) ao episódio!", "success", "Upload realizado");
    };

    const handleRemoveAttachment = (episodeId: number, fileName: string) => {
        setEpisodes((prevEpisodes) =>
            prevEpisodes.map((episode) =>
                episode.id_module_episode === episodeId
                    ? {
                        ...episode,
                        attachments: episode.attachments.filter((file) => file.name !== fileName),
                    }
                    : episode,
            ),
        );
    };

    const toggleCreateEpisode = () => {
        setIsCreatingEpisode((prev) => !prev);
        setNewEpisodeDraft({
            order: episodes.length + 1,
            title: "",
            created_at: new Date().toISOString(),
            description: "",
            link_episode: null,
            id_module_episode: Date.now(),
        });
    };

    const handleCreateEpisodeField = <K extends keyof ModuleEpisode>(key: K, value: ModuleEpisode[K]) => {
        setNewEpisodeDraft((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleCreateEpisode = () => {
        if (!newEpisodeDraft.title.trim() || !newEpisodeDraft.description.trim()) {
            SEGPrincipalNotificator("Informe título e descrição para criar o episódio.", "warning", "Atenção");
            return;
        }

        setCreatingEpisode(true);
        setTimeout(() => {
            setEpisodes((prevEpisodes) => [
                ...prevEpisodes,
                {
                    ...newEpisodeDraft,
                    title: newEpisodeDraft.title.trim(),
                    description: newEpisodeDraft.description.trim(),
                    order: Number(newEpisodeDraft.order) || prevEpisodes.length + 1,
                    attachments: [],
                },
            ]);
            setCreatingEpisode(false);
            toggleCreateEpisode();
            SEGPrincipalNotificator("Novo episódio adicionado!", "success", "Sucesso");
        }, 450);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    zIndex: 999,
                }}
            >
                <SEGPrincipalLoader />
            </Box>
        );
    }

    if (!moduleData) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
                <Paper sx={{ p: 6, maxWidth: 480 }}>
                    <Typography variant="h6" gutterBottom>
                        Não encontramos dados para este módulo.
                    </Typography>
                    <SEGButton startIcon={<ArrowBackIcon />} onClick={handleNavigateBack}>
                        Voltar
                    </SEGButton>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffffff" }}>
            <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 4 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <SEGButton
                        colorTheme="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleNavigateBack}
                        fullWidth={false}
                        sx={{ mb: 0 }}
                    >
                        Voltar
                    </SEGButton>

                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.purple }}>
                        Gerenciar módulo
                    </Typography>
                </Stack>

                <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, boxShadow: "0 18px 40px rgba(76,103,255,0.08)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Informações do módulo
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                Curso #{courseId ?? "-"} • Módulo #{moduleId ?? moduleData.id_course_module}
                            </Typography>
                        </Box>
                        <Box textAlign={{ xs: "left", md: "right" }}>
                            <Typography variant="body2" sx={{ color: colors.weakGray }}>
                                Criado em
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {formattedCreatedAt}
                            </Typography>
                        </Box>
                    </Stack>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <SEGTextField
                                label="Título do módulo"
                                value={moduleTitle}
                                onChange={(event) => setModuleTitle(event.target.value)}
                                placeholder="Ex: Fundamentos de Programação"
                                InputProps={{ disableUnderline: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <SEGTextField
                                label="ID do módulo"
                                value={String(moduleData.id_course_module)}
                                disabled
                                InputProps={{ disableUnderline: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SEGTextField
                                label="Descrição"
                                multiline
                                minRows={4}
                                value={moduleDescription}
                                onChange={(event) => setModuleDescription(event.target.value)}
                                placeholder="Descreva o que será ensinado neste módulo"
                                InputProps={{ disableUnderline: true }}
                            />
                        </Grid>
                    </Grid>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="flex-end">
                        <SEGButton
                            colorTheme="outlined"
                            onClick={handleResetModuleForm}
                            startIcon={<CloseIcon />}
                            fullWidth={false}
                            sx={{ mb: 0 }}
                            disabled={isSavingModule}
                        >
                            Cancelar
                        </SEGButton>
                        <SEGButton
                            startIcon={<SaveIcon />}
                            onClick={handleSaveModule}
                            loading={isSavingModule}
                            fullWidth={false}
                            sx={{ mb: 0 }}
                        >
                            Salvar alterações
                        </SEGButton>
                    </Stack>
                </Paper>

                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: "0 18px 40px rgba(76,103,255,0.08)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Episódios do módulo
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                Gerencie conteúdos, uploads e ordem de apresentação.
                            </Typography>
                        </Box>
                        <SEGButton
                            startIcon={isCreatingEpisode ? <CloseIcon /> : <AddIcon />}
                            colorTheme={isCreatingEpisode ? "outlined" : "purple"}
                            onClick={toggleCreateEpisode}
                            fullWidth={false}
                            sx={{ mb: 0 }}
                        >
                            {isCreatingEpisode ? "Cancelar" : "Novo episódio"}
                        </SEGButton>
                    </Stack>

                    {isCreatingEpisode && (
                        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, mb: 4, backgroundColor: "rgba(93,112,246,0.04)" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: colors.purple }}>
                                Informações do novo episódio
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <SEGTextField
                                        label="Ordem"
                                        type="number"
                                        value={newEpisodeDraft.order}
                                        onChange={(event) =>
                                            handleCreateEpisodeField("order", Number(event.target.value) || 1)
                                        }
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <SEGTextField
                                        label="Título"
                                        value={newEpisodeDraft.title}
                                        onChange={(event) => handleCreateEpisodeField("title", event.target.value)}
                                        placeholder="Ex: Introdução"
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <SEGTextField
                                        label="Descrição"
                                        multiline
                                        minRows={3}
                                        value={newEpisodeDraft.description}
                                        onChange={(event) => handleCreateEpisodeField("description", event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <SEGTextField
                                        label="Link (opcional)"
                                        value={newEpisodeDraft.link_episode ?? ""}
                                        onChange={(event) =>
                                            handleCreateEpisodeField("link_episode", event.target.value || null)
                                        }
                                        placeholder="Cole o link do conteúdo"
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </Grid>
                            </Grid>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                                <SEGButton
                                    colorTheme="outlined"
                                    onClick={toggleCreateEpisode}
                                    startIcon={<CloseIcon />}
                                    fullWidth={false}
                                    sx={{ mb: 0 }}
                                    disabled={creatingEpisode}
                                >
                                    Descartar
                                </SEGButton>
                                <SEGButton
                                    startIcon={<SaveIcon />}
                                    onClick={handleCreateEpisode}
                                    loading={creatingEpisode}
                                    fullWidth={false}
                                    sx={{ mb: 0 }}
                                >
                                    Criar episódio
                                </SEGButton>
                            </Stack>
                        </Paper>
                    )}

                    <Stack spacing={3}>
                        {orderedEpisodes.map((episode) => {
                            const isEditing = editingEpisodeId === episode.id_module_episode;
                            const formattedEpisodeDate = new Date(episode.created_at).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                            });

                            return (
                                <Paper key={episode.id_module_episode} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: "0 12px 30px rgba(76,103,255,0.08)" }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.purple }}>
                                                    #{episode.order}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.weakGray }}>
                                                    Criado em {formattedEpisodeDate}
                                                </Typography>
                                            </Stack>

                                            {isEditing ? (
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={4}>
                                                        <SEGTextField
                                                            label="Ordem"
                                                            type="number"
                                                            value={episodeDraft.order ?? episode.order}
                                                            InputProps={{ disableUnderline: true }}
                                                            onChange={(event) =>
                                                                handleEpisodeDraftChange(
                                                                    "order",
                                                                    Number(event.target.value) || episode.order,
                                                                )
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={8}>
                                                        <SEGTextField
                                                            label="Título"
                                                            value={episodeDraft.title ?? episode.title}
                                                            onChange={(event) =>
                                                                handleEpisodeDraftChange("title", event.target.value)
                                                            }
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <SEGTextField
                                                            label="Descrição"
                                                            multiline
                                                            minRows={3}
                                                            value={episodeDraft.description ?? episode.description}
                                                            onChange={(event) =>
                                                                handleEpisodeDraftChange(
                                                                    "description",
                                                                    event.target.value,
                                                                )
                                                            }
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <SEGTextField
                                                            label="Link (opcional)"
                                                            value={episodeDraft.link_episode ?? episode.link_episode ?? ""}
                                                            onChange={(event) =>
                                                                handleEpisodeDraftChange(
                                                                    "link_episode",
                                                                    event.target.value ? event.target.value : null,
                                                                )
                                                            }
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {episode.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: colors.strongGray, mt: 1 }}>
                                                        {episode.description}
                                                    </Typography>
                                                    {episode.link_episode && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: colors.purple, mt: 1, wordBreak: "break-all" }}
                                                        >
                                                            {episode.link_episode}
                                                        </Typography>
                                                    )}
                                                </>
                                            )}

                                            <Divider sx={{ my: 2 }} />

                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                                                <input
                                                    type="file"
                                                    accept={fileAccept}
                                                    multiple
                                                    ref={(element) => {
                                                        fileInputsRef.current[episode.id_module_episode] = element;
                                                    }}
                                                    style={{ display: "none" }}
                                                    onChange={(event) =>
                                                        handleEpisodeUpload(episode.id_module_episode, event.target.files)
                                                    }
                                                />
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<UploadFileIcon />}
                                                    onClick={() =>
                                                        fileInputsRef.current[episode.id_module_episode]?.click()
                                                    }
                                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                                >
                                                    Fazer upload
                                                </Button>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {episode.attachments.length === 0 && (
                                                        <Typography variant="body2" sx={{ color: colors.weakGray }}>
                                                            Nenhum arquivo enviado
                                                        </Typography>
                                                    )}
                                                    {episode.attachments.map((file) => (
                                                        <Chip
                                                            key={`${episode.id_module_episode}-${file.name}`}
                                                            label={file.name}
                                                            onDelete={() =>
                                                                handleRemoveAttachment(episode.id_module_episode, file.name)
                                                            }
                                                            sx={{
                                                                backgroundColor: "rgba(93,112,246,0.1)",
                                                                color: colors.purple,
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </Box>

                                        <Stack direction="row" spacing={1}>
                                            {isEditing ? (
                                                <>
                                                    <SEGButton
                                                        startIcon={<CloseIcon />}
                                                        colorTheme="outlined"
                                                        onClick={handleCancelEpisodeEdition}
                                                        fullWidth={false}
                                                        sx={{ mb: 0 }}
                                                        disabled={episodeSaving}
                                                    >
                                                        Cancelar
                                                    </SEGButton>
                                                    <SEGButton
                                                        startIcon={<SaveIcon />}
                                                        onClick={handleSaveEpisode}
                                                        loading={episodeSaving}
                                                        fullWidth={false}
                                                        sx={{ mb: 0 }}
                                                    >
                                                        Salvar
                                                    </SEGButton>
                                                </>
                                            ) : (
                                                <>
                                                    <IconButton
                                                        size="large"
                                                        onClick={() => startEpisodeEdition(episode)}
                                                        sx={{ backgroundColor: "rgba(93,112,246,0.08)" }}
                                                    >
                                                        <EditIcon sx={{ color: colors.purple }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="large"
                                                        onClick={() => openDeleteDialog(episode.id_module_episode)}
                                                        sx={{ backgroundColor: "rgba(232,76,61,0.12)" }}
                                                    >
                                                        <DeleteIcon sx={{ color: "#E84C3D" }} />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Paper>
            </Box>

            <Dialog open={Boolean(episodeToDelete)} onClose={handleCancelDeleteEpisode} maxWidth="xs" fullWidth>
                <DialogTitle>Remover episódio</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Deseja realmente remover este episódio do módulo? Esta ação não poderá ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDeleteEpisode} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDeleteEpisode} color="error" startIcon={<DeleteIcon />}>
                        Remover
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ModuleManagementPage;
