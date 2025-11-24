import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ProfileContext } from "../../contexts/ProfileContext";
import { api } from "../../lib/axios";
import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import { colors } from "../../theme/colors";
import { logout } from "../../services/AuthService";
import Cookies from "js-cookie";

type UserProfileResponse = {
  id_user: string;
  name: string;
  surname: string;
  email: string;
  birth_date?: string | null;
  profile_picture_link?: string | null;
  active: boolean;
};

type GeneralFormValues = {
  name: string;
  surname: string;
  email: string;
  birthDate: string;
};

type PasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

const buildInitialGeneralValues = (
  profile: UserProfileResponse | null,
): GeneralFormValues => ({
  name: profile?.name ?? "",
  surname: profile?.surname ?? "",
  email: profile?.email ?? "",
  birthDate: profile?.birth_date ? profile.birth_date.slice(0, 10) : "",
});

const ProfilePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const userId = profileContext?.userId ?? null;
  const setUserProfilePic =
    profileContext?.setUserProfilePic ?? (() => undefined);

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [generalForm, setGeneralForm] = useState<GeneralFormValues>(() =>
    buildInitialGeneralValues(null),
  );
  const [generalErrors, setGeneralErrors] = useState<
    Partial<Record<keyof GeneralFormValues, string>>
  >({});
  const [isUpdatingGeneral, setIsUpdatingGeneral] = useState<boolean>(false);

  const [passwordForm, setPasswordForm] = useState<PasswordFormValues>({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<keyof PasswordFormValues, string>>
  >({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [disableDialogOpen, setDisableDialogOpen] = useState<boolean>(false);
  const [isDisablingAccount, setIsDisablingAccount] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await api.get<UserProfileResponse>(
          `/user-profile/view/${userId}`,
          {
            signal: controller.signal,
          },
        );
        setProfile(response.data ?? null);
        setGeneralForm(buildInitialGeneralValues(response.data ?? null));
        setGeneralErrors({});
      } catch (error: any) {
        if (error?.name === "CanceledError") return;
        console.error("Erro ao carregar perfil", error);
        setProfile(null);
        SEGPrincipalNotificator(
          "Não foi possível carregar seus dados.",
          "error",
          "Erro",
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const profilePicture = useMemo(() => {
    if (imagePreview) return imagePreview;
    if (profile?.profile_picture_link) return profile.profile_picture_link;
    return null;
  }, [imagePreview, profile?.profile_picture_link]);

  const handleGeneralChange =
    (field: keyof GeneralFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setGeneralForm((prev) => ({ ...prev, [field]: value }));
      setGeneralErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handlePasswordChange =
    (field: keyof PasswordFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Informe um e-mail";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return "E-mail inválido";
    return undefined;
  };

  const validateGeneralForm = () => {
    const errors: Partial<Record<keyof GeneralFormValues, string>> = {};

    if (!generalForm.name.trim()) {
      errors.name = "Informe seu nome";
    } else if (generalForm.name.trim().length < 2) {
      errors.name = "O nome deve ter ao menos 2 caracteres";
    }

    if (!generalForm.surname.trim()) {
      errors.surname = "Informe seu sobrenome";
    } else if (generalForm.surname.trim().length < 2) {
      errors.surname = "O sobrenome deve ter ao menos 2 caracteres";
    }

    const emailValidation = validateEmail(generalForm.email);
    if (emailValidation) {
      errors.email = emailValidation;
    }

    setGeneralErrors(errors);
    return errors;
  };

  const validatePasswordForm = () => {
    const errors: Partial<Record<keyof PasswordFormValues, string>> = {};

    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!newPassword) {
      errors.newPassword = "Informe a nova senha";
    } else if (newPassword.length < 8) {
      errors.newPassword = "A nova senha deve ter pelo menos 8 caracteres";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirme a nova senha";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    setPasswordErrors(errors);
    return errors;
  };

  const handleSubmitGeneral = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    const errors = validateGeneralForm();
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) return;

    try {
      setIsUpdatingGeneral(true);

      const payload: Record<string, unknown> = {
        name: generalForm.name.trim(),
        surname: generalForm.surname.trim(),
        email: generalForm.email.trim(),
      };

      if (generalForm.birthDate) {
        payload.birth_date = generalForm.birthDate;
      }

      const response = await api.patch<UserProfileResponse>(
        `/user-profile/update/${userId}`,
        payload,
      );
      const updatedProfile = response?.data ?? payload;

      setProfile((prev) => ({
        ...(prev ?? { id_user: userId, active: true }),
        ...prev,
        ...updatedProfile,
        name: generalForm.name.trim(),
        surname: generalForm.surname.trim(),
        email: generalForm.email.trim(),
        birth_date: generalForm.birthDate || prev?.birth_date || null,
      }));

      SEGPrincipalNotificator(
        "Dados atualizados com sucesso!",
        "success",
        "Sucesso",
      );
    } catch (error: any) {
      console.error("Erro ao atualizar perfil", error);
      const message =
        error?.response?.data?.message ??
        "Não foi possível atualizar seus dados.";
      SEGPrincipalNotificator(String(message), "error", "Erro");
    } finally {
      setIsUpdatingGeneral(false);
    }
  };

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      SEGPrincipalNotificator(
        "Selecione um arquivo de imagem válido.",
        "warning",
        "Formato inválido",
      );
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });
  };

  const handleUploadPicture = async () => {
    if (!selectedFile || !userId) {
      SEGPrincipalNotificator("Escolha uma imagem para enviar.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploadingPicture(true);
      const response = await api.post<UserProfileResponse>(
        `/user-profile/set-profile-picture/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const newPictureLink = response?.data?.profile_picture_link ?? null;

      setProfile((prev) => {
        if (prev) {
          return {
            ...prev,
            profile_picture_link: newPictureLink,
          };
        } else {
          return {
            id_user: userId,
            name: "",
            surname: "",
            email: "",
            active: true,
            profile_picture_link: newPictureLink,
            birth_date: null,
          };
        }
      });

      if (newPictureLink) {
        setUserProfilePic(newPictureLink);
        Cookies.set("pic", newPictureLink);
      }

      setSelectedFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      SEGPrincipalNotificator(
        "Foto de perfil atualizada!",
        "success",
        "Sucesso",
      );
    } catch (error: any) {
      console.error("Erro ao enviar foto de perfil", error);
      const message =
        error?.response?.data?.message ??
        "Não foi possível atualizar a foto de perfil.";
      SEGPrincipalNotificator(String(message), "error", "Erro");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const resetPasswordState = () => {
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    if (isUpdatingPassword) return;
    setPasswordDialogOpen(false);
    resetPasswordState();
  };

  const handleSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    const errors = validatePasswordForm();
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) return;

    const newPassword = passwordForm.newPassword.trim();

    try {
      setIsUpdatingPassword(true);
      await api.patch(`/user-profile/update-password/${userId}`, {
        password: newPassword,
      });

      SEGPrincipalNotificator(
        "Senha alterada com sucesso!",
        "success",
        "Sucesso",
      );
      resetPasswordState();
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao alterar senha", error);
      const message =
        error?.response?.data?.message ?? "Não foi possível alterar a senha.";
      SEGPrincipalNotificator(String(message), "error", "Erro");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDisableAccount = async () => {
    if (!userId) return;

    try {
      setIsDisablingAccount(true);
      await api.patch(`/user-profile/disable/${userId}`);
      SEGPrincipalNotificator("Conta desativada.", "info", "Até breve");
      logout();
    } catch (error: any) {
      console.error("Erro ao desativar conta", error);
      const message =
        error?.response?.data?.message ?? "Não foi possível desativar a conta.";
      SEGPrincipalNotificator(String(message), "error", "Erro");
    } finally {
      setIsDisablingAccount(false);
      setDisableDialogOpen(false);
    }
  };

  const isGeneralDirty = useMemo(() => {
    if (!profile) return false;
    return (
      profile.name !== generalForm.name.trim() ||
      profile.surname !== generalForm.surname.trim() ||
      profile.email !== generalForm.email.trim() ||
      (profile.birth_date ? profile.birth_date.slice(0, 10) : "") !==
        generalForm.birthDate
    );
  }, [generalForm, profile]);

  if (!userId) {
    return (
      <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Typography
              variant="h4"
              fontWeight={700}
              color={colors.purple}
              textAlign="center"
            >
              Faça login para acessar seu perfil
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Não encontramos informações de usuário ativas. Entre novamente
              para gerenciar seus dados.
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 5,
              p: { xs: 3, md: 5 },
              backgroundColor: "#fff",
              border: "1px solid rgba(226,232,240,0.8)",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems={{ xs: "center", md: "flex-start" }}
            >
              <Box position="relative">
                <Avatar
                  src={profilePicture ?? undefined}
                  alt={profile?.name ?? "Foto de perfil"}
                  sx={{
                    width: { xs: 160, md: 180 },
                    height: { xs: 160, md: 180 },
                    border: "4px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 12px 40px rgba(93,112,246,0.35)",
                    fontSize: 48,
                    background: colors.purple,
                  }}
                >
                  {profile?.name?.charAt(0) ?? "?"}
                </Avatar>

                <Tooltip title="Escolher nova foto" placement="top">
                  <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      bgcolor: "#fff",
                      boxShadow: "0 10px 30px rgba(93,112,246,0.25)",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <PhotoCameraRoundedIcon />
                  </IconButton>
                </Tooltip>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleSelectImage}
                />
              </Box>

              <Stack spacing={3} flex={1}>
                <Box>
                  <Typography
                    variant="overline"
                    color={colors.strongGray}
                    sx={{ letterSpacing: 2 }}
                  >
                    Olá,
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    color={colors.purple}
                    gutterBottom
                  >
                    {isLoadingProfile ? (
                      <Skeleton width={240} />
                    ) : (
                      `${profile?.name ?? ""} ${profile?.surname ?? ""}`
                    )}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 520 }}
                  >
                    Gerencie suas informações pessoais, proteja sua conta
                    atualizando a senha e personalize a experiência com uma nova
                    foto de perfil.
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Chip
                    label={`ID: ${profile?.id_user ?? "--"}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      profile?.active === false
                        ? "Conta desativada"
                        : "Conta ativa"
                    }
                    color={profile?.active === false ? "default" : "success"}
                    variant={profile?.active === false ? "outlined" : "filled"}
                  />
                  {selectedFile && (
                    <Chip
                      icon={<CloudUploadRoundedIcon />}
                      label={selectedFile.name}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {selectedFile && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                  >
                    <SEGButton
                      colorTheme="purple"
                      onClick={handleUploadPicture}
                      loading={isUploadingPicture}
                      startIcon={<CloudUploadRoundedIcon />}
                      sx={{ maxWidth: 240 }}
                    >
                      Enviar nova foto
                    </SEGButton>
                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        if (imagePreview) {
                          URL.revokeObjectURL(imagePreview);
                          setImagePreview(null);
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                )}

                {isUploadingPicture && (
                  <LinearProgress sx={{ borderRadius: 999 }} />
                )}
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={0}
                sx={{ borderRadius: 4, p: { xs: 3, md: 4 }, height: "100%" }}
              >
                <Stack
                  component="form"
                  spacing={3}
                  onSubmit={handleSubmitGeneral}
                  height="100%"
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color={colors.purple}
                      gutterBottom
                    >
                      Informações pessoais
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Atualize seus dados básicos. Essas informações são usadas
                      para personalizar sua experiência no sistema.
                    </Typography>
                  </Box>

                  {isLoadingProfile ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rounded" height={70} />
                      <Skeleton variant="rounded" height={70} />
                      <Skeleton variant="rounded" height={70} />
                      <Skeleton variant="rounded" height={70} />
                    </Stack>
                  ) : (
                    <>
                      <SEGTextField
                        label="Nome"
                        placeholder="Nome"
                        value={generalForm.name}
                        onChange={handleGeneralChange("name")}
                        error={Boolean(generalErrors.name)}
                        helperText={generalErrors.name}
                      />
                      <SEGTextField
                        label="Sobrenome"
                        placeholder="Sobrenome"
                        value={generalForm.surname}
                        onChange={handleGeneralChange("surname")}
                        error={Boolean(generalErrors.surname)}
                        helperText={generalErrors.surname}
                      />
                      <SEGTextField
                        label="E-mail"
                        placeholder="nome.sobrenome@seg.br"
                        type="email"
                        value={generalForm.email}
                        onChange={handleGeneralChange("email")}
                        error={Boolean(generalErrors.email)}
                        helperText={generalErrors.email}
                      />
                      <SEGTextField
                        label="Data de nascimento"
                        type="date"
                        value={generalForm.birthDate}
                        onChange={handleGeneralChange("birthDate")}
                        InputLabelProps={{ shrink: true }}
                      />

                      <SEGButton
                        colorTheme="gradient"
                        type="submit"
                        startIcon={<SaveRoundedIcon />}
                        loading={isUpdatingGeneral}
                        disabled={!isGeneralDirty || isUpdatingGeneral}
                      >
                        Salvar alterações
                      </SEGButton>
                    </>
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{ borderRadius: 4, p: { xs: 3, md: 4 }, height: "100%" }}
              >
                <Stack spacing={3} height="100%">
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color={colors.purple}
                      gutterBottom
                    >
                      Segurança e acesso
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Altere sua senha periodicamente para manter sua conta
                      protegida. Clique no botão abaixo para abrir o formulário
                      de atualização em uma janela dedicada.
                    </Typography>
                  </Box>

                  <Stack spacing={2} mt="auto">
                    <SEGButton
                      colorTheme="purple"
                      startIcon={<LockResetRoundedIcon />}
                      onClick={handleOpenPasswordDialog}
                    >
                      Alterar senha
                    </SEGButton>
                    <Typography variant="caption" color="text.secondary">
                      Informe a nova senha, confirme-a e salve para concluir a
                      atualização.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              border: "1px dashed rgba(242,109,109,0.5)",
              background: "rgba(242,109,109,0.05)",
            }}
          >
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <WarningAmberRoundedIcon
                  sx={{ color: "#F26D6D", fontSize: 36 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#C0392B">
                    Zona de risco
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Desativar sua conta remove seu acesso imediato ao sistema.
                    Você poderá solicitar a reativação posteriormente junto à
                    instituição.
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <SEGButton
                  colorTheme="outlined"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={() => setDisableDialogOpen(true)}
                  sx={{
                    maxWidth: 260,
                    borderColor: "rgba(242,109,109,0.6)",
                    color: "#C0392B",
                    "&:hover": {
                      borderColor: "rgba(192,57,43,0.9)",
                      background: "rgba(242,109,109,0.08)",
                    },
                  }}
                >
                  Desativar conta
                </SEGButton>
                <Typography variant="body2" color="text.secondary">
                  Após confirmar, você será desconectado imediatamente.
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Dialog
          open={passwordDialogOpen}
          onClose={handleClosePasswordDialog}
          fullWidth
          maxWidth="sm"
        >
          <Box component="form" onSubmit={handleSubmitPassword}>
            <DialogTitle>Atualizar senha</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <SEGTextField
                  label="Nova senha"
                  type="password"
                  showPasswordToggle
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  error={Boolean(passwordErrors.newPassword)}
                  helperText={passwordErrors.newPassword}
                />
                <SEGTextField
                  label="Confirme a nova senha"
                  type="password"
                  showPasswordToggle
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  error={Boolean(passwordErrors.confirmPassword)}
                  helperText={passwordErrors.confirmPassword}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClosePasswordDialog}
                disabled={isUpdatingPassword}
              >
                Cancelar
              </Button>
              <SEGButton
                colorTheme="purple"
                type="submit"
                startIcon={<LockResetRoundedIcon />}
                loading={isUpdatingPassword}
                disabled={isUpdatingPassword}
              >
                Salvar nova senha
              </SEGButton>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog
          open={disableDialogOpen}
          onClose={() =>
            !isDisablingAccount ? setDisableDialogOpen(false) : undefined
          }
        >
          <DialogTitle>Deseja realmente desativar sua conta?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Essa ação pode ser revertida somente pelo time administrativo.
              Confirme para prosseguir com a desativação.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setDisableDialogOpen(false)}
              disabled={isDisablingAccount}
            >
              Cancelar
            </Button>
            <SEGButton
              colorTheme="purple"
              onClick={handleDisableAccount}
              loading={isDisablingAccount}
              startIcon={<LogoutRoundedIcon />}
              fullWidth={false}
              sx={{
                px: 3,
                background: "#C0392B",
                "&:hover": { background: "#A93226" },
              }}
            >
              Confirmar desativação
            </SEGButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProfilePage;
