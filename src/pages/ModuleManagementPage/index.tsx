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
import { api } from "../../lib/axios";

interface ModuleEpisode {
  order: number;
  title: string;
  created_at: string;
  description: string;
  link_episode: string | null;
  id_module_episode?: number;
}

interface ModuleManagementPayload {
  id_course_module: number;
  title: string;
  description: string;
  created_at: string;
  module_episodes: ModuleEpisode[];
}

const fileAccept = "video/*,image/*,application/pdf";

const ModuleManagementPage: React.FC = () => {
  const { moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<ModuleManagementPayload | null>(null);
  const [loadingDeleteEpisode, setLoadingDeleteEpisode] = useState<boolean>(false);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [isSavingModule, setIsSavingModule] = useState(false);

  const [episodes, setEpisodes] = useState<ModuleEpisode[]>([]);
  const [hasInitialEpisodesLoaded, setHasInitialEpisodesLoaded] = useState(false);

  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
  const [episodeDraft, setEpisodeDraft] = useState<Partial<ModuleEpisode>>({});
  const [episodeSaving, setEpisodeSaving] = useState(false);

  const [episodeToDelete, setEpisodeToDelete] = useState<number | null>(null);

  const [isCreatingEpisode, setIsCreatingEpisode] = useState(false);
  const [newEpisodeDraft, setNewEpisodeDraft] = useState<ModuleEpisode>({
    order: episodes.length + 1,
    title: "",
    created_at: new Date().toISOString(),
    description: "",
    link_episode: null,
  });
  const [creatingEpisode, setCreatingEpisode] = useState(false);

  // upload por episódio já criado
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});
  const [pendingMedia, setPendingMedia] = useState<Record<number, File | null>>({});

  //seleção de mídia durante criação
  const newMediaInputRef = useRef<HTMLInputElement | null>(null);
  const [newEpisodeMedia, setNewEpisodeMedia] = useState<File | null>(null);
  const [uploadingNewMedia, setUploadingNewMedia] = useState(false);

  const orderedEpisodes = useMemo(() => [...episodes].sort((a, b) => a.order - b.order), [episodes]);

  const getModuleEpisode = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/course-module/management-view/${moduleId}`);
      setModuleData(response?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleData !== null) return;
    getModuleEpisode();
  }, []);

  useEffect(() => {
    if (!moduleData) return;

    setModuleTitle(moduleData.title);
    setModuleDescription(moduleData.description);

    if (!hasInitialEpisodesLoaded) {
      setEpisodes(moduleData.module_episodes);
      setHasInitialEpisodesLoaded(true);
    }
  }, [moduleData, hasInitialEpisodesLoaded]);

  const handleNavigateBack = () => navigate(-1);

  const handleSaveModule = () => {
    if (!moduleTitle.trim() || !moduleDescription.trim()) {
      SEGPrincipalNotificator("Título e descrição do módulo são obrigatórios.", "warning", "Campos obrigatórios");
      return;
    }
    setIsSavingModule(true);
    setTimeout(() => {
      setModuleData((prev) =>
        prev ? { ...prev, title: moduleTitle.trim(), description: moduleDescription.trim() } : prev
      );
      setIsSavingModule(false);
      SEGPrincipalNotificator("Módulo atualizado com sucesso!", "success", "Sucesso");
    }, 500);
  };

  const startEpisodeEdition = (episode: ModuleEpisode) => {
    setEditingEpisodeId(episode?.id_module_episode || 0);
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
    setEpisodeDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancelEpisodeEdition = () => {
    setEditingEpisodeId(null);
    setEpisodeDraft({});
  };

  const saveEpisodeFields = async (episodeId: number, payload: Partial<ModuleEpisode>) => {
    await api.patch(`/module-episode/update/${episodeId}`, {
      order: payload.order,
      title: payload.title,
      description: payload.description,
      link_episode: payload.link_episode ?? null,
    });
  };

  // === Helper unificado para upload de mídia (mesmo endpoint da criação) ===
  const uploadMediaForEpisode = async (episodeId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);

    const resp = await api.post(`/module-episode/set-media/${episodeId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const uploadedUrl: string | undefined = resp?.data?.media_url;
    return uploadedUrl;
  };

  // === SALVAR EPISÓDIO: salva campos + sobe mídia pendente (se houver) ===
  const handleSaveEpisode = async () => {
    if (!editingEpisodeId || !episodeDraft.title?.trim() || !episodeDraft.description?.trim()) {
      SEGPrincipalNotificator("Preencha pelo menos título e descrição do episódio.", "warning", "Dados incompletos");
      return;
    }

    setEpisodeSaving(true);

    try {
      await saveEpisodeFields(editingEpisodeId, {
        order: Number(episodeDraft.order),
        title: episodeDraft.title.trim(),
        description: episodeDraft.description.trim(),
        link_episode: episodeDraft.link_episode ?? null,
      });

      let uploadedUrl: string | undefined;
      const fileToUpload = pendingMedia[editingEpisodeId];

      if (fileToUpload) {
        try {
          uploadedUrl = await uploadMediaForEpisode(editingEpisodeId, fileToUpload);
        } catch (uploadErr) {
          console.error(uploadErr);
          SEGPrincipalNotificator("Campos salvos, mas falhou o envio da mídia.", "warning", "Upload não concluído");
        }
      }

      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id_module_episode === editingEpisodeId
            ? {
                ...ep,
                title: episodeDraft.title!.trim(),
                description: episodeDraft.description!.trim(),
                order: Number(episodeDraft.order ?? ep.order),
                link_episode: uploadedUrl ?? ep.link_episode,
              }
            : ep
        )
      );

      setPendingMedia((prev) => ({ ...prev, [editingEpisodeId]: null }));
      SEGPrincipalNotificator(
        fileToUpload ? "Campos e mídia salvos com sucesso!" : "Campos do episódio salvos!",
        "success",
        "Sucesso"
      );
      setEditingEpisodeId(null);
      setEpisodeDraft({});
    } catch (error) {
      console.error(error);
      SEGPrincipalNotificator("Não foi possível salvar as alterações.", "error", "Erro");
    } finally {
      setEpisodeSaving(false);
    }
  };

  const openDeleteDialog = (episodeId: number) => setEpisodeToDelete(episodeId);

  const handleConfirmDeleteEpisode = async () => {
    if (!episodeToDelete) return;

    try {
      setLoadingDeleteEpisode(true);

      const response = await api.delete(`/module-episode/delete/${episodeToDelete}`);

      if (response.status === 200) {
        setEpisodes((prev) => prev.filter((ep) => ep.id_module_episode !== episodeToDelete));
        setEpisodeToDelete(null);
        SEGPrincipalNotificator("Episódio removido do módulo.", "success", "Removido");
      }
    } catch (error) {
      SEGPrincipalNotificator("Falha ao remover episódio", "error", "Erro!");
    } finally {
      setLoadingDeleteEpisode(false);
    }
  };

  const handleCancelDeleteEpisode = () => setEpisodeToDelete(null);

  // ====== Seleção de mídia para episódio EXISTENTE ======
  const handlePickMedia = (episodeId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const [file] = Array.from(files);
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.type !== "application/pdf") {
      SEGPrincipalNotificator("Arquivo não suportado. Use PDF, imagem ou vídeo.", "warning", "Tipo inválido");
      if (fileInputsRef.current[episodeId]) fileInputsRef.current[episodeId]!.value = "";
      return;
    }
    setPendingMedia((prev) => ({ ...prev, [episodeId]: file }));
    if (fileInputsRef.current[episodeId]) fileInputsRef.current[episodeId]!.value = "";
    SEGPrincipalNotificator("Mídia selecionada, clique em SALVAR para enviar.", "info", "Seleção concluída");
  };

  const toggleCreateEpisode = () => {
    setIsCreatingEpisode((prev) => !prev);
    setNewEpisodeDraft({
      order: episodes.length + 1,
      title: "",
      created_at: new Date().toISOString(),
      description: "",
      link_episode: null,
      id_module_episode: undefined,
    });
    setNewEpisodeMedia(null);
  };

  const handleCreateEpisodeField = <K extends keyof ModuleEpisode>(key: K, value: ModuleEpisode[K]) => {
    setNewEpisodeDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateEpisode = async () => {
    if (!newEpisodeDraft.title.trim() || !newEpisodeDraft.description.trim()) {
      SEGPrincipalNotificator("Informe título e descrição para criar o episódio.", "warning", "Atenção");
      return;
    }
    const orderAlreadyExists = episodes.some((e) => e.order === Number(newEpisodeDraft.order));

    if (orderAlreadyExists) {
      SEGPrincipalNotificator("Ordem já existente", "warning", "Atenção!");
      return;
    }

    setCreatingEpisode(true);

    try {
      const episodeDto = {
        title: newEpisodeDraft.title.trim(),
        description: newEpisodeDraft.description.trim(),
        order: Number(newEpisodeDraft.order) || episodes.length + 1,
        id_course_module: Number(moduleId),
      };

      const response = await api.post("/module-episode/create", episodeDto);

      const createdId: number = response?.data?.created_episode_id;
      if (!createdId) throw new Error("ID do episódio não retornado pelo backend.");

      const created: ModuleEpisode = {
        order: episodeDto.order,
        title: episodeDto.title,
        description: episodeDto.description,
        created_at: new Date().toISOString(),
        link_episode: null,
        id_module_episode: createdId,
      };
      setEpisodes((prev) => [...prev, created]);

      if (newEpisodeMedia) {
        setUploadingNewMedia(true);
        const uploadedUrl = await uploadMediaForEpisode(createdId, newEpisodeMedia);
        if (uploadedUrl) {
          setEpisodes((prev) =>
            prev.map((ep) => (ep.id_module_episode === createdId ? { ...ep, link_episode: uploadedUrl } : ep))
          );
        }
      }

      SEGPrincipalNotificator("Episódio criado com sucesso!", "success", "Sucesso");
      toggleCreateEpisode();
    } catch (error) {
      console.error(error);
      SEGPrincipalNotificator("Não foi possível criar o episódio.", "error", "Erro");
    } finally {
      setUploadingNewMedia(false);
      setCreatingEpisode(false);
      setNewEpisodeMedia(null);
    }
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
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffffff" }}>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.purple }}>
            Gerenciar módulo
          </Typography>
        </Stack>

        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, boxShadow: "0 18px 40px rgba(76,103,255,0.08)" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <SEGButton colorTheme="outlined" startIcon={<ArrowBackIcon />} onClick={handleNavigateBack} fullWidth={false} sx={{ mb: 0 }}>
              Voltar
            </SEGButton>

            <SEGButton startIcon={<SaveIcon />} onClick={handleSaveModule} loading={isSavingModule} fullWidth={false} sx={{ mb: 0 }}>
              Salvar alterações
            </SEGButton>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SEGTextField
                label="Título do módulo"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Ex: Fundamentos de Programação"
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12}>
              <SEGTextField
                label="Descrição"
                multiline
                minRows={4}
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Descreva o que será ensinado neste módulo"
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: "0 18px 40px rgba(76,103,255,0.08)" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
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
                    onChange={(e) => handleCreateEpisodeField("order", Number(e.target.value) || 1)}
                    fullWidth
                    InputProps={{ disableUnderline: true }}
                    sx={{ width: "100%", "& .MuiInputBase-root": { minHeight: 48 } }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <SEGTextField
                    label="Título"
                    value={newEpisodeDraft.title}
                    onChange={(e) => handleCreateEpisodeField("title", e.target.value)}
                    placeholder="Ex: Introdução"
                    fullWidth
                    InputProps={{ disableUnderline: true }}
                    sx={{ width: "100%", "& .MuiInputBase-root": { minHeight: 48 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SEGTextField
                    label="Descrição"
                    multiline
                    minRows={3}
                    value={newEpisodeDraft.description}
                    onChange={(e) => handleCreateEpisodeField("description", e.target.value)}
                    fullWidth
                    sx={{ width: "100%" }}
                  />
                </Grid>

                {/* Seleção de mídia já na criação */}
                <Grid item xs={12}>
                  <input
                    type="file"
                    accept={fileAccept}
                    ref={newMediaInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.type !== "application/pdf") {
                        SEGPrincipalNotificator("Arquivo não suportado. Use PDF, imagem ou vídeo.", "warning", "Tipo inválido");
                        if (newMediaInputRef.current) newMediaInputRef.current.value = "";
                        return;
                      }
                      setNewEpisodeMedia(file);
                      if (newMediaInputRef.current) newMediaInputRef.current.value = "";
                    }}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <Button
                      variant="outlined"
                      startIcon={<UploadFileIcon />}
                      onClick={() => newMediaInputRef.current?.click()}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Selecionar mídia (opcional)
                    </Button>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {!newEpisodeMedia && (
                        <Typography variant="body2" sx={{ color: colors.weakGray }}>
                          Nenhuma mídia selecionada
                        </Typography>
                      )}
                      {newEpisodeMedia && (
                        <Chip
                          label={newEpisodeMedia.name}
                          onDelete={() => setNewEpisodeMedia(null)}
                          sx={{ backgroundColor: "rgba(93,112,246,0.1)", color: colors.purple, fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <SEGButton colorTheme="outlined" onClick={toggleCreateEpisode} startIcon={<CloseIcon />} fullWidth={false} sx={{ mb: 0 }} disabled={creatingEpisode || uploadingNewMedia}>
                  Descartar
                </SEGButton>
                <SEGButton
                  startIcon={<SaveIcon />}
                  onClick={handleCreateEpisode}
                  loading={creatingEpisode || uploadingNewMedia}
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
              const epId = episode.id_module_episode || 0;
              const selectedFile = pendingMedia[epId] || null;

              return (
                <Paper key={epId} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: "0 12px 30px rgba(76,103,255,0.08)" }}>
                  {/* Em edição troca layout para coluna para liberar largura */}
                  <Stack
                    direction={isEditing ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems={isEditing ? "stretch" : "flex-start"}
                    spacing={2}
                  >
                    <Box sx={{ flex: 1, width: "100%" }}>
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
                              onChange={(e) => handleEpisodeDraftChange("order", Number(e.target.value) || episode.order)}
                              fullWidth
                              InputProps={{ disableUnderline: true }}
                              sx={{ width: "100%", "& .MuiInputBase-root": { minHeight: 48 } }}
                            />
                          </Grid>

                          <Grid item xs={12} md={8}>
                            <SEGTextField
                              label="Título"
                              value={episodeDraft.title ?? episode.title}
                              onChange={(e) => handleEpisodeDraftChange("title", e.target.value)}
                              fullWidth
                              InputProps={{ disableUnderline: true }}
                              sx={{ width: "100%", "& .MuiInputBase-root": { minHeight: 48 } }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <SEGTextField
                              label="Descrição"
                              multiline
                              minRows={3}
                              value={episodeDraft.description ?? episode.description}
                              onChange={(e) => handleEpisodeDraftChange("description", e.target.value)}
                              fullWidth
                              InputProps={{ disableUnderline: true }}
                              sx={{ width: "100%" }}
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
                            <Typography variant="body2" sx={{ color: colors.purple, mt: 1, wordBreak: "break-all" }}>
                              {episode.link_episode}
                            </Typography>
                          )}
                        </>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Mídia para episódios EXISTENTES */}
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                        <input
                          type="file"
                          accept={fileAccept}
                          ref={(el) => {
                            fileInputsRef.current[epId] = el;
                          }}
                          style={{ display: "none" }}
                          onChange={(e) => handlePickMedia(epId, e.target.files)}
                        />
                        {isEditing && (
                          <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => fileInputsRef.current[epId]?.click()}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                          >
                            Selecionar mídia
                          </Button>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                          {(!selectedFile && !episode.link_episode) && isEditing && (
                            <Typography variant="body2" sx={{ color: colors.weakGray }}>
                              Nenhuma mídia selecionada/enviada
                            </Typography>
                          )}
                          {(selectedFile && isEditing) && (
                            <Chip
                              label={selectedFile.name}
                              onDelete={() => setPendingMedia((prev) => ({ ...prev, [epId]: null }))}
                              sx={{ backgroundColor: "rgba(93,112,246,0.1)", color: colors.purple, fontWeight: 600 }}
                            />
                          )}
                          {(episode.link_episode && !selectedFile) && isEditing && (
                            <Chip
                              label="Mídia enviada"
                              sx={{ backgroundColor: "rgba(93,112,246,0.1)", color: colors.purple, fontWeight: 600 }}
                            />
                          )}
                        </Stack>
                      </Stack>

                      {/* Botões em EDIÇÃO */}
                      {isEditing && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
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
                        </Stack>
                      )}
                    </Box>

                    {/* Ações no modo visualização */}
                    {!isEditing && (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="large"
                          onClick={() => startEpisodeEdition(episode)}
                          sx={{ backgroundColor: "rgba(93,112,246,0.08)" }}
                        >
                          <EditIcon sx={{ color: colors.purple }} />
                        </IconButton>
                        <IconButton
                          size="large"
                          onClick={() => openDeleteDialog(epId)}
                          sx={{ backgroundColor: "rgba(232,76,61,0.12)" }}
                        >
                          <DeleteIcon sx={{ color: "#E84C3D" }} />
                        </IconButton>
                      </Stack>
                    )}
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
          <SEGButton colorTheme="outlined" onClick={handleCancelDeleteEpisode} color="inherit">
            Cancelar
          </SEGButton>
          <SEGButton colorTheme="gradient" loading={loadingDeleteEpisode} onClick={handleConfirmDeleteEpisode} color="error" startIcon={<DeleteIcon />}>
            Remover
          </SEGButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleManagementPage;
