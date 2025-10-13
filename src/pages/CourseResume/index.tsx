import React from "react";
import {
    Avatar,
    Box,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LayersIcon from "@mui/icons-material/Layers";
import CategoryIcon from "@mui/icons-material/Category";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { colors } from "../../theme/colors";
import SEGButton from "../../components/SEGButton";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import { dateFormat } from "../../helpers/DateFormat";

interface CourseResumeData {
    id_course: string;
    title: string;
    description: string;
    link_thumbnail: string;
    difficulty_level: string;
    created_at: string;
    registration_state: "S" | "F" | null;
    teacher_full_name: string;
    category: string;
    modules_count: string;
}

const mockedCourse: CourseResumeData = {
    id_course: "26e22b72-d358-459e-b209-ce57912df142",
    title: "Fund. de Prog.",
    description: "Um curso muito legal e interativo sobre code",
    link_thumbnail: "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//user-profile-pictures/20c55048-111a-45cf-b40a-24c34ef80579",
    difficulty_level: "E",
    created_at: "2025-10-01T15:15:50.062Z",
    registration_state: null,
    teacher_full_name: "Diego Chruscinski de Souza",
    category: "Aulas do Jaime",
    modules_count: "0",
};

const CoursesResume: React.FC = () => {

    const registrationLabel = mockedCourse.registration_state === null
        ? "MATRICULAR"
        : mockedCourse.registration_state === "S"
            ? "CANCELAR MATRÍCULA"
            : null;

    const renderRegistrationButton = () => {
        if (!registrationLabel) return null;

        const colorTheme = mockedCourse.registration_state === "S" ? "outlined" : "gradient";

        return (
            <SEGButton
                colorTheme={colorTheme}
                onClick={() => console.info(`${registrationLabel} clicado`)}
                sx={{ maxWidth: { xs: "100%", sm: 260 } }}
            >
                {registrationLabel}
            </SEGButton>
        );
    };

    const detailItems = [
        {
            label: "ID do curso",
            icon: <FingerprintIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: mockedCourse.id_course,
        },
        {
            label: "Professor responsável",
            icon: <PersonOutlineIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: mockedCourse.teacher_full_name,
        },
        {
            label: "Categoria",
            icon: <CategoryIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: mockedCourse.category,
        },
        {
            label: "Data de criação",
            icon: <CalendarMonthIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: dateFormat(mockedCourse.created_at),
        },
        {
            label: "Quantidade de módulos",
            icon: <LayersIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: mockedCourse.modules_count,
        },
        {
            label: "Status da matrícula",
            icon: <EmojiEventsIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: mockedCourse.registration_state === null
                ? "Não matriculado"
                : mockedCourse.registration_state === "S"
                    ? "Cursando"
                    : "Concluído",
        },
    ];

    return (
        <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "calc(100vh - 64px)", pb: 8 }}>
            <Box
                sx={{
                    background: colors.horizontalGradient,
                    color: "#fff",
                    py: { xs: 6, md: 8 },
                    borderTopLeftRadius: { xs: 32, md: 60 },
                    borderTopRightRadius: { xs: 32, md: 60 },
                    borderBottomLeftRadius: { xs: 32, md: 60 },
                    borderBottomRightRadius: { xs: 32, md: 60 },
                    boxShadow: "0 18px 45px rgba(93, 112, 246, 0.25)",
                    mb: { xs: 6, md: 10 },
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Stack spacing={3}>
                                <Chip
                                    label={`Dificuldade: ${mapDifficulty(mockedCourse.difficulty_level)}`}
                                    sx={{
                                        alignSelf: "flex-start",
                                        bgcolor: "rgba(255,255,255,0.15)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        px: 1.5,
                                        py: 0.75,
                                        fontSize: "0.85rem",
                                    }}
                                />
                                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "0.6px" }}>
                                    {mockedCourse.title}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
                                    {mockedCourse.description}
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.2)",
                                                color: "#fff",
                                                width: 56,
                                                height: 56,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {mockedCourse.teacher_full_name
                                                .split(" ")
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("")}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                Professor responsável
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {mockedCourse.teacher_full_name}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {renderRegistrationButton()}
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    position: "relative",
                                    p: 1.5,
                                    background: "rgba(255,255,255,0.12)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={mockedCourse.link_thumbnail}
                                    alt={`Thumb do curso ${mockedCourse.title}`}
                                    sx={{
                                        width: "100%",
                                        height: { xs: 260, md: 320 },
                                        objectFit: "cover",
                                        borderRadius: 4,
                                        boxShadow: "0 24px 45px rgba(0,0,0,0.25)",
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 3, md: 4 },
                                bgcolor: "#fff",
                                boxShadow: "0 16px 40px rgba(93, 112, 246, 0.08)",
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Sobre o curso
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.7 }}>
                                {mockedCourse.description}
                            </Typography>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="caption" sx={{ color: colors.strongGray }}>
                                Link da thumbnail
                            </Typography>
                            <Typography
                                component="a"
                                href={mockedCourse.link_thumbnail}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: "inline-block",
                                    mt: 1,
                                    color: colors.purple,
                                    textDecoration: "none",
                                    wordBreak: "break-all",
                                    fontWeight: 600,
                                }}
                            >
                                {mockedCourse.link_thumbnail}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 3, md: 4 },
                                bgcolor: "#fff",
                                boxShadow: "0 16px 40px rgba(73, 160, 251, 0.12)",
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                Informações gerais
                            </Typography>
                            <Stack spacing={2.5}>
                                {detailItems.map((item) => (
                                    <Stack key={item.label} direction="row" spacing={2} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "12px",
                                                background: "rgba(73,160,251,0.12)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: colors.strongGray, textTransform: "uppercase" }}>
                                                {item.label}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: "#1d1d1d" }}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CoursesResume;
