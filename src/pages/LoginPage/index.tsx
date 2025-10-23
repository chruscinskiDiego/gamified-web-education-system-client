import React, { useContext, useRef, useState } from "react";
import {
    Box,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logoSeg from "../../assets/logo-seg.png";
import SEGButton from "../../components/SEGButton";
import SEGTextField from "../../components/SEGTextField";
import { colors } from "../../theme/colors";
import { useNavigate } from "react-router-dom";
import { Root } from "../../components/LoginAndRegisterPages/Root";
import { LeftPanel } from "../../components/LoginAndRegisterPages/LeftPanel";
import { CornerDots } from "../../components/LoginAndRegisterPages/CornerDots";
import { BottomDots } from "../../components/BottomDots";
import { RightPanel } from "../../components/LoginAndRegisterPages/RightPanel";
import { Card } from "../../components/LoginAndRegisterPages/Card";
import type { ISignIn } from "../../interfaces/user.interfaces";
import { signIn } from "../../services/AuthService";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ProfileContext } from "../../contexts/ProfileContext";


export const LoginPage: React.FC = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string | null }>({});
    const navigate = useNavigate();
    const [snackMessage, setSnackMessage] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackType, setSnackType] = useState<'success' | 'warning' | null>(null);
    const profileContext = useContext(ProfileContext);
    const { setIsAuthenticated, setUserId, setUserType, setUserProfilePic } = profileContext!;

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    function handleTogglePassword() {
        setShowPassword((s) => !s);
    }

    const handleSetSnackSucess = (message: string) => {
        setSnackType('success');
        setSnackMessage(message);
        setSnackOpen(true);
    }

    const handleSetSnackWarning = (message: string) => {
        setSnackType('warning');
        setSnackMessage(message);
        setSnackOpen(true);
    }

    const focusFirstError = (eObj: { [k: string]: string | null }) => {
        if (eObj.email) return emailRef.current?.focus();
        if (eObj.password) return passwordRef.current?.focus();
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = validate();
        const hasError = Object.values(result).some((v) => v);
        if (hasError) {
            focusFirstError(result);

            handleSetSnackWarning("Preencha os campos obrigatórios marcados em vermelho!");

            return;
        }

        const siginData: ISignIn = { email, password };

        try {

            const response = await signIn(siginData);

            if(response.status !== 200){

                handleSetSnackWarning(response?.data?.message || "Erro no login. Verifique suas credenciais.");
                return;
            }

            setIsAuthenticated(true);

            const { user_id: responseUserId, user_type: responseUserType, user_profile_pic: responseProfilePic } = response?.data ?? {};

            if (responseUserId !== undefined && responseUserId !== null) {
                setUserId(String(responseUserId));
            }

            if (responseUserType === 'S' || responseUserType === 'T' || responseUserType === 'A') {
                setUserType(responseUserType);
            } else {
                setUserType(null);
            }

            setUserProfilePic(responseProfilePic ?? null);

            navigate("/homepage");

            handleSetSnackSucess("Login realizado com sucesso!");

        } catch (err: any) {

            handleSetSnackWarning(err?.response?.data?.message || "Erro no login. Verifique suas credenciais.");

        }
    };

    const handleNavigateToRegister = () => {
        navigate("/signup");
    }

    const handleNavigateToPasswordRecovery = () => {
        navigate("/password-recovery");
    }

    const validateEmail = (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const validate = () => {
        const e: { [k: string]: string | null } = {};

        if (!email.trim()) e.email = "Por favor, informe um e-mail.";
        else if (!validateEmail(email)) e.email = "E-mail inválido.";
        else e.email = null;

        if (!password) e.password = "Por favor, informe a senha.";
        else if (password.length < 8)
            e.password = "Senha muito curta (mínimo 8 caracteres).";
        else e.password = null;
        setErrors(e);
        return e;
    };

    const handleBlurField = (field: string) => {

        const e = { ...errors };

        if (field === "email") {
            if (!email.trim()) e.email = "Por favor, informe um e-mail.";
            else if (!validateEmail(email)) e.email = "E-mail inválido.";
            else e.email = null;
        } else if (field === "password") {
            if (!password) e.password = "Por favor, informe a senha.";
            else if (password.length < 6) e.password = "Senha muito curta (mínimo 6).";
            else e.password = null;
        }

        setErrors(e);
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
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.6)" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.95)" }} />
                </BottomDots>

            </LeftPanel>

            <RightPanel>
                <Card>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Typography
                            variant="h3"
                            sx={{
                                color: colors.blue,
                                fontWeight: 800,
                                mb: 3,
                            }}
                        >
                            Login
                        </Typography>

                        <Typography variant="subtitle2" sx={{ color: "#8b8b8b", mb: 1, fontWeight: 600 }}>
                            E-mail
                        </Typography>
                        <SEGTextField
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon sx={{ mb: 2 }} />
                                    </InputAdornment>
                                ),
                                disableUnderline: true,
                            }}
                            onBlur={() => handleBlurField("email")}
                            error={!!errors.email}
                            helperText={errors.email ?? ""}
                            inputRef={emailRef}
                        />

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" sx={{ color: "#8b8b8b", fontWeight: 600 }}>
                                Senha
                            </Typography>
                            <Link underline="none" onClick={handleNavigateToPasswordRecovery} sx={{
                                fontSize: 13,
                                color: colors.weakGray,
                                '&:hover': {
                                    color: colors.purple,
                                }
                            }}>
                                Esqueceu sua senha?
                            </Link>
                        </Box>
                        <SEGTextField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{ mb: 2 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            size="small"
                                            aria-label="mostrar senha"
                                            disableRipple
                                            disableFocusRipple
                                            sx={{
                                                "&:focus": {
                                                    outline: "none",
                                                },
                                                "&.Mui-focusVisible": {
                                                    outline: "none",
                                                    boxShadow: "none",
                                                },
                                                "&:active": {
                                                    outline: "none",
                                                    boxShadow: "none",
                                                },
                                                "& .MuiSvgIcon-root": {
                                                    outline: "none",
                                                },
                                                p: 0.5,
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                disableUnderline: true,
                            }}
                            onBlur={() => handleBlurField("password")}
                            error={!!errors.password}
                            helperText={errors.password ?? ""}
                            inputRef={passwordRef}
                        />

                        <SEGButton type="submit" colorTheme="gradient">
                            ENVIAR
                        </SEGButton>

                        <Box textAlign="center" mt={1}>
                            <Typography variant="body2" sx={{ color: "#bdbdbd" }}>
                                Não tem uma conta?{" "}
                                <Link onClick={handleNavigateToRegister} underline="none" sx={{ fontWeight: 700, color: colors.purple }}>
                                    Registrar
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </RightPanel>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
            >
                <Alert icon={
                    snackType === 'success' ? <CheckCircleOutlineIcon
                        sx={{
                            color: "#fff",
                        }} /> :
                        <ErrorOutlineIcon
                            sx={{
                                color: "#fff",
                            }} />
                }
                    onClose={() => setSnackOpen(false)} sx={{ background: colors.horizontalGradient, color: "#fff" }}>
                    {snackMessage || "Erro no login. Verifique suas credenciais."}
                </Alert>

            </Snackbar>
        </Root>
    );
};

export default LoginPage;
