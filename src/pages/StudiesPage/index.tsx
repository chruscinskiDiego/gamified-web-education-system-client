import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import SEGButton from "../../components/SEGButton";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import { colors } from "../../theme/colors";
import { mapDifficulty } from "../../helpers/DifficultyLevel";

interface RegisteredCourse {
    title: string;
    id_course: string;
    link_thumbnail: string | null;
    difficulty_level: string;
}

const StudiesPage: React.FC = () => {
    const [courses, setCourses] = useState<RegisteredCourse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const getRegisteredCourses = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await api.get<RegisteredCourse[]>("/course/user-registered");
            if (response.status === 200) {
                setCourses(response.data ?? []);
                return;
            }

            setCourses([]);
            setErrorMessage("Não foi possível carregar os cursos. Tente novamente mais tarde.");
        } catch (error) {
            console.error("Erro ao buscar cursos registrados", error);
            setCourses([]);
            setErrorMessage("Não foi possível carregar os cursos. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getRegisteredCourses();
    }, [getRegisteredCourses]);

    const hasCourses = useMemo(() => courses.length > 0, [courses]);

    const handleNavigateToCourse = useCallback(
        (courseId: string) => {
            if (!courseId) return;
            navigate(`/course/${courseId}`);
        },
        [navigate],
    );

    return (
        <Box sx={{ backgroundColor: "#ffffffff", minHeight: "calc(100vh - 64px)", pb: { xs: 6, md: 10 } }}>
            <Box
                sx={{
                    background: colors.horizontalGradient,
                    color: "#fff",
                    py: { xs: 6, md: 8 },
                    borderRadius: { xs: 36, md: 60 },
                    boxShadow: "0 18px 45px rgba(93, 112, 246, 0.25)",
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={2} alignItems={{ xs: "flex-start", md: "center" }} textAlign={{ xs: "left", md: "center" }}>
                        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
                            Sua jornada de aprendizado
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            Meus Estudos
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: 520, opacity: 0.9 }}>
                            Acompanhe os cursos em que você está matriculado e continue evoluindo com um clique.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -7 }, position: "relative" }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 5,
                        p: { xs: 3, md: 5 },
                        minHeight: 320,
                        backgroundColor: "#fff",
                        boxShadow: "0 22px 60px rgba(93, 112, 246, 0.12)",
                    }}
                >
                    {isLoading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <SEGPrincipalLoader />
                            <Typography variant="body2" sx={{ mt: 2, color: colors.strongGray }}>
                                Carregando seus cursos...
                            </Typography>
                        </Stack>
                    ) : errorMessage ? (
                        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Ops!
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ maxWidth: 360 }}>
                                {errorMessage}
                            </Typography>
                            <SEGButton
                                colorTheme="gradient"
                                onClick={getRegisteredCourses}
                                fullWidth={false}
                                sx={{ mt: 1, px: 4 }}
                            >
                                Tentar novamente
                            </SEGButton>
                        </Stack>
                    ) : !hasCourses ? (
                        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.purple }}>
                                Nenhum curso encontrado
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ maxWidth: 360 }}>
                                Você ainda não está matriculado em cursos. Explore o catálogo e inicie sua jornada agora mesmo!
                            </Typography>
                            <SEGButton
                                colorTheme="gradient"
                                onClick={() => navigate("/")}
                                fullWidth={false}
                                sx={{ mt: 1, px: 4 }}
                            >
                                Explorar cursos
                            </SEGButton>
                        </Stack>
                    ) : (
                        <Stack spacing={4}>
                            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.purple }}>
                                    Cursos matriculados
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                    {courses.length === 1
                                        ? "Você está matriculado em 1 curso"
                                        : `Você está matriculado em ${courses.length} cursos`}
                                </Typography>
                            </Stack>

                            <Grid container spacing={{ xs: 3, md: 4 }}>
                                {courses.map((course) => {
                                    const hasThumbnail = Boolean(course.link_thumbnail);

                                    return (
                                        <Grid item xs={12} sm={6} lg={4} key={course.id_course}>
                                            <Paper
                                                elevation={0}
                                                onClick={() => handleNavigateToCourse(course.id_course)}
                                                sx={{
                                                    height: "100%",
                                                    borderRadius: 4,
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    cursor: "pointer",
                                                    border: "1px solid rgba(93,112,246,0.18)",
                                                    boxShadow: "0 18px 40px rgba(93, 112, 246, 0.12)",
                                                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                                    backgroundColor: "#fdfdff",
                                                    "&:hover": {
                                                        transform: "translateY(-6px)",
                                                        boxShadow: "0 28px 50px rgba(93, 112, 246, 0.2)",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        height: 180,
                                                        background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.18) 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {hasThumbnail ? (
                                                        <Box
                                                            component="img"
                                                            src={course.link_thumbnail ?? undefined}
                                                            alt={`Thumb do curso ${course.title}`}
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Stack spacing={1} alignItems="center">
                                                            <ImageIcon sx={{ fontSize: 48, color: "rgba(93,112,246,0.6)" }} />
                                                            <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.5)" }}>
                                                                Sem imagem disponível
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Box>

                                                <Box
                                                    sx={{
                                                        p: { xs: 3, md: 3.5 },
                                                        flexGrow: 1,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 2.2,
                                                    }}
                                                >
                                                    <Stack spacing={1.2} sx={{ flexGrow: 1 }}>
                                                        <Chip
                                                            label={`Dificuldade: ${mapDifficulty(course.difficulty_level)}`}
                                                            sx={{
                                                                alignSelf: "flex-start",
                                                                bgcolor: "rgba(93,112,246,0.12)",
                                                                color: colors.purple,
                                                                fontWeight: 600,
                                                                px: 1.5,
                                                            }}
                                                        />
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1c1c1c" }}>
                                                            {course.title}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                                            Continue de onde parou e conquiste novas habilidades neste curso.
                                                        </Typography>
                                                    </Stack>

                                                    <SEGButton
                                                        colorTheme="gradient"
                                                        fullWidth
                                                        onClick={() => handleNavigateToCourse(course.id_course)}
                                                        sx={{ mt: "auto" }}
                                                    >
                                                        Acessar curso
                                                    </SEGButton>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Stack>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default StudiesPage;
