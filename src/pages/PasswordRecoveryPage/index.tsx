import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { Root } from "../../components/LoginAndRegisterPages/Root";
import { LeftPanel } from "../../components/LoginAndRegisterPages/LeftPanel";
import { CornerDots } from "../../components/LoginAndRegisterPages/CornerDots";
import { BottomDots } from "../../components/BottomDots";
import { RightPanel } from "../../components/LoginAndRegisterPages/RightPanel";
import { Card } from "../../components/LoginAndRegisterPages/Card";
import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import logoSeg from "../../assets/logo-seg.png";
import { colors } from "../../theme/colors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RecoveryStatus = "idle" | "success" | "error";

type ApiResponse = {
    message?: string;
};

const defaultMessages: Record<RecoveryStatus, string> = {
    idle: "Informe seu e-mail para receber as instruções de redefinição de senha.",
    success: "Enviamos um link de recuperação para o e-mail informado. Verifique também a sua caixa de spam.",
    error: "Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.",
};

const PasswordRecoveryPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [status, setStatus] = useState<RecoveryStatus>("idle");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const handleNavigateToLogin = () => navigate("/login");

    const validateEmail = (value: string) => {
        if (!value.trim()) {
            return "Por favor, informe um e-mail.";
        }

        if (!emailRegex.test(value.trim())) {
            return "E-mail inválido.";
        }

        return null;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationMessage = validateEmail(email);
        setEmailError(validationMessage);

        if (validationMessage) {
            return;
        }

        try {
            setIsSubmitting(true);
            setStatus("idle");
            setFeedbackMessage(null);

            const response = await api.post<ApiResponse>("/user-profile/password-recovery", { email: email.trim() });

            if (response.status === 200) {
                const message = response.data?.message?.trim() || null;
                setFeedbackMessage(message ?? defaultMessages.success);
                setStatus("success");
                return;
            }

            setFeedbackMessage(response.data?.message?.trim() || defaultMessages.error);
            setStatus("error");
        } catch (err: any) {
            const message: string | null =
                err?.response?.data?.message?.trim?.() ?? err?.message ?? defaultMessages.error;
            setFeedbackMessage(message || defaultMessages.error);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setStatus("idle");
        setFeedbackMessage(null);
        setEmailError(null);
    };

    const shouldShowForm = status === "idle";

    const renderStatusContent = () => {
        if (status === "success") {
            return (
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#3BB273" }} />
                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700} color={colors.purple}>
                            Verifique seu e-mail
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {feedbackMessage ?? defaultMessages.success}
                        </Typography>
                    </Stack>
                    <SEGButton onClick={handleNavigateToLogin} colorTheme="blue">
                        Voltar para o login
                    </SEGButton>
                </Stack>
            );
        }

        if (status === "error") {
            return (
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <ErrorOutlineIcon sx={{ fontSize: 64, color: "#F26D6D" }} />
                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700} color={colors.purple}>
                            Não foi possível enviar o e-mail
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {feedbackMessage ?? defaultMessages.error}
                        </Typography>
                    </Stack>
                    <SEGButton onClick={handleRetry} colorTheme="gradient">
                        Tentar novamente
                    </SEGButton>
                </Stack>
            );
        }

        return null;
    };

    return (
        <Root>
            <LeftPanel>
                <CornerDots>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 18px rgba(0,0,0,0.12)" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.6)" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.6)" }} />
                </CornerDots>
                <Box
                    component="img"
                    src={logoSeg}
                    alt="SEG - ilustração"
                    sx={{
                        maxWidth: "85%",
                        height: "auto",
                        objectFit: "contain",
                        filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.15))",
                    }}
                />
                <Typography
                    variant="h5"
                    sx={{
                        color: "#fff",
                        fontWeight: 700,
                        mt: 4,
                        textAlign: "center",
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                    }}
                >
                    Sistema Web de
                    <br />
                    Ensino Gamificado
                </Typography>
                <BottomDots>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.6)" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.4)" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.4)" }} />
                </BottomDots>
            </LeftPanel>
            <RightPanel>
                <Card sx={{ backgroundColor: "#fff", borderRadius: 5, boxShadow: "0 24px 60px rgba(17,24,39,0.12)" }}>
                    {shouldShowForm ? (
                        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
                            <Stack spacing={1}>
                                <Typography variant="h4" fontWeight={700} color={colors.purple}>
                                    Recuperar senha
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {feedbackMessage ?? defaultMessages.idle}
                                </Typography>
                            </Stack>
                            <SEGTextField
                                label="E-mail"
                                placeholder="nome.sobrenome@seg.br"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (emailError) {
                                        setEmailError(null);
                                    }
                                }}
                                onBlur={(event) => setEmailError(validateEmail(event.target.value))}
                                error={Boolean(emailError)}
                                helperText={emailError ?? undefined}
                                startIcon={<EmailOutlinedIcon sx={{ color: colors.purple, mb: 2 }} />}
                                InputProps={{ disableUnderline: true }}
                            />
                            <SEGButton type="submit" loading={isSubmitting} colorTheme="gradient">
                                Enviar instruções
                            </SEGButton>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                Lembrou sua senha?{' '}
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={handleNavigateToLogin}
                                    style={{
                                        border: "none",
                                        background: "none",
                                        color: colors.purple,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Voltar para o login
                                </Box>
                            </Typography>
                        </Stack>
                    ) : (
                        renderStatusContent()
                    )}
                </Card>
            </RightPanel>
        </Root>
    );
};

export default PasswordRecoveryPage;
