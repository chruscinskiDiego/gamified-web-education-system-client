import React, { useRef, useState } from "react";
import {
    Box,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Switch,
    Snackbar,
    Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { styled } from "@mui/material/styles";
import logoSeg from "../../assets/logo-seg.png";
import SEGButton from "../../components/SEGButton";
import SEGTextField from "../../components/SEGTextField";
import { colors } from "../../theme/colors";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from "react-router-dom";
import type { ISignUp } from "../../interfaces/user.interfaces";
import { signUp } from "../../services/AuthService";


const Root = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    height: "100vh",
    display: "flex",
    alignItems: "stretch",
    background: theme.palette.background.default,
    overflow: "hidden",
}));

const LeftPanel = styled(Box)(({ theme }) => ({
    flex: 1.1,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg,#44c9ff 0%, #6b3df8 100%)",
    padding: "clamp(16px, 4vw, 48px)",
    [theme.breakpoints.down("md")]: {
        display: "none",
    },
    "@media (max-height:820px)": {
        padding: "clamp(12px, 3vw, 32px)",
    },
    "@media (max-height:720px)": {
        padding: "8px",
    },
}));

const RightPanel = styled(Box)(() => ({
    flex: 1,
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(12px, 3vw, 48px)",
    overflow: "hidden",
    "@media (max-height:820px)": {
        padding: "clamp(8px, 2vw, 24px)",
    },
}));

const Card = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: 520,
    padding: "clamp(16px, 3.5vw, 48px)",
    boxSizing: "border-box",
    maxHeight: "calc(100vh - 48px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
        padding: "12px",
        maxWidth: "95%",
    },
    "@media (max-height:820px)": {
        padding: "12px",
        maxHeight: "calc(100vh - 28px)",
    },
    "@media (max-height:720px)": {
        padding: "8px",
        maxHeight: "calc(100vh - 12px)",
    },
}));

const CornerDots = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(3),
    left: theme.spacing(4),
    display: "flex",
    gap: theme.spacing(1.2),
    zIndex: 2,
    [theme.breakpoints.down("sm")]: {
        display: "none",
    },
}));

const BottomDots = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(4),
    display: "flex",
    gap: theme.spacing(1.2),
    zIndex: 2,
    [theme.breakpoints.down("sm")]: {
        display: "none",
    },
}));

const TopRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
}));

export const RegisterPage: React.FC = () => {

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [isStudent, setIsStudent] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoadingSignup, setIsLoadingSignup] = useState(false);

    const [errors, setErrors] = useState<{ [k: string]: string | null }>({});
    const [snackMessage, setSnackMessage] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackType, setSnackType] = useState<'success' | 'warning' | null>(null);

    const nameRef = useRef<HTMLInputElement | null>(null);
    const surnameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const birthRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const validateEmail = (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const validate = () => {
        const e: { [k: string]: string | null } = {};

        if (!name.trim()) e.name = "Por favor, informe seu nome.";
        else e.name = null;

        if (!surname.trim()) e.surname = "Por favor, informe seu sobrenome.";
        else e.surname = null;

        if (!email.trim()) e.email = "Por favor, informe um e-mail.";
        else if (!validateEmail(email)) e.email = "E-mail inválido.";
        else e.email = null;

        if (!password) e.password = "Por favor, informe a senha.";
        else if (password.length < 8)
            e.password = "Senha muito curta (mínimo 8 caracteres).";
        else e.password = null;

        if (!birthDate) e.birthDate = "Informe a data de nascimento.";
        else e.birthDate = null;

        setErrors(e);
        return e;
    };

    const focusFirstError = (eObj: { [k: string]: string | null }) => {
        if (eObj.name) return nameRef.current?.focus();
        if (eObj.surname) return surnameRef.current?.focus();
        if (eObj.email) return emailRef.current?.focus();
        if (eObj.password) return passwordRef.current?.focus();
        if (eObj.birthDate) return birthRef.current?.focus();
    };

    const handleTogglePassword = () => {
        setShowPassword((s) => !s);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = validate();
        const hasError = Object.values(result).some((v) => v);
        if (hasError) {
            focusFirstError(result);
            setSnackOpen(true);
            return;
        }

        const signupData: ISignUp = {
            name,
            surname,
            email,
            password,
            birth_date: birthDate,
            type: isStudent ? 'S' : 'T',
        };

        try {

            setIsLoadingSignup(true);

            const response = await signUp(signupData);

            if (response.status === 201) {
                handleSetSnackSucess("Cadastro realizado com sucesso!");

                // setTimeout(() => {
                navigate("/signin");
                //}, 1500);

            } else {
                handleSetSnackWarning("Erro ao cadastrar. Tente novamente.");
            }
        } catch (err) {
            handleSetSnackWarning("Erro ao cadastrar. Tente novamente.");
        } finally {
            setIsLoadingSignup(false);
        }
    };

    const handleNavigateToLogin = () => {
        navigate("/sigin");
    }

    const handleBlurField = (field: string) => {
        // valida apenas o campo quando sair do foco (melhora UX)
        const e = { ...errors };
        if (field === "name") {
            e.name = name.trim() ? null : "Por favor, informe seu nome.";
        } else if (field === "surname") {
            e.surname = surname.trim() ? null : "Por favor, informe seu sobrenome.";
        } else if (field === "email") {
            if (!email.trim()) e.email = "Por favor, informe um e-mail.";
            else if (!validateEmail(email)) e.email = "E-mail inválido.";
            else e.email = null;
        } else if (field === "password") {
            if (!password) e.password = "Por favor, informe a senha.";
            else if (password.length < 6) e.password = "Senha muito curta (mínimo 6).";
            else e.password = null;
        } else if (field === "birthDate") {
            e.birthDate = birthDate ? null : "Informe a data de nascimento.";
        }
        setErrors(e);
    };

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
                        maxWidth: "80%",
                        height: "auto",
                        objectFit: "contain",
                        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
                        "@media (max-height:820px)": {
                            maxWidth: "65%",
                        },
                        "@media (max-height:720px)": {
                            maxWidth: "55%",
                        },
                    }}
                />

                <Typography
                    variant="h6"
                    sx={{
                        color: "#fff",
                        fontWeight: 700,
                        mt: 3,
                        textAlign: "center",
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        fontSize: "clamp(14px, 1.6vw, 18px)",
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
                        <TopRow>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: colors.blue,
                                    fontWeight: 800,
                                    mb: 0,
                                    fontSize: "clamp(22px, 3.4vw, 36px)",
                                }}
                            >
                                Cadastro
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" sx={{ color: "#9e9e9e", fontWeight: 700 }}>
                                    {isStudent ? "Aluno" : "Professor"}
                                </Typography>
                                <Switch
                                    checked={isStudent}
                                    onChange={() => setIsStudent((s) => !s)}
                                    inputProps={{ "aria-label": "toggle aluno" }}
                                    sx={{
                                        transformOrigin: "center",
                                        "@media (max-height:720px)": { transform: "scale(0.9)" },
                                    }}
                                />
                            </Box>
                        </TopRow>

                        <Typography variant="subtitle2">Nome</Typography>
                        <SEGTextField
                            inputRef={nameRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlurField("name")}
                            placeholder="Nome"
                            fullWidth
                            InputProps={{ disableUnderline: true }}
                            error={!!errors.name}
                            helperText={errors.name ?? ""}
                        />

                        <Typography variant="subtitle2">Sobrenome</Typography>
                        <SEGTextField
                            inputRef={surnameRef}
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            onBlur={() => handleBlurField("surname")}
                            placeholder="Sobrenome"
                            fullWidth
                            InputProps={{ disableUnderline: true }}
                            error={!!errors.surname}
                            helperText={errors.surname ?? ""}
                        />

                        <Typography variant="subtitle2">E-mail</Typography>
                        <SEGTextField
                            inputRef={emailRef}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlurField("email")}
                            placeholder="seu@email.com"
                            fullWidth
                            InputProps={{ disableUnderline: true }}
                            error={!!errors.email}
                            helperText={errors.email ?? ""}
                        />

                        <Typography variant="subtitle2">Senha</Typography>
                        <SEGTextField
                            inputRef={passwordRef}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlurField("password")}
                            placeholder="••••••••"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            size="small"
                                            aria-label="mostrar senha"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                disableUnderline: true,
                            }}
                            error={!!errors.password}
                            helperText={errors.password ?? ""}
                        />

                        <Typography variant="subtitle2">Data de nascimento</Typography>
                        <SEGTextField
                            inputRef={birthRef}
                            value={birthDate}
                            required
                            onChange={(e) => setBirthDate(e.target.value)}
                            onBlur={() => handleBlurField("birthDate")}
                            placeholder="Data de nascimento"
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{ disableUnderline: true }}
                            sx={{
                                mb: 2,
                                "& .MuiInputBase-root": { height: 40 },
                                "& .MuiInputBase-input": {
                                    padding: "8px 12px",
                                    fontSize: "0.95rem",
                                },
                            }}
                            error={!!errors.birthDate}
                            helperText={errors.birthDate ?? ""}
                        />

                        <SEGButton
                            loading={isLoadingSignup}
                            type="submit"
                            colorTheme="gradient"
                            sx={{
                                mt: 1,
                                height: 44,
                                fontSize: "0.95rem",
                                "@media (max-height:720px)": { height: 40, fontSize: "0.9rem" },
                            }}
                        >
                            ENVIAR
                        </SEGButton>

                        <Box textAlign="center" mt={1.5}>
                            <Typography variant="body2" sx={{ color: "#bdbdbd", fontSize: "0.9rem" }}>
                                Já tem conta?{" "}
                                <Link onClick={handleNavigateToLogin} underline="none" sx={{ fontWeight: 700, color: colors.purple }}>
                                    Login
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
                    {snackMessage || "Informação inválida. Verifique os campos!"}
                </Alert>

            </Snackbar>
        </Root>
    );
};

export default RegisterPage;
