import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Container,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import SEGButton from "../../components/SEGButton";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import { colors } from "../../theme/colors";
import SEGPagination from "../../components/SEGPagination";
import type { GetCourse } from "../../interfaces/course.interfaces";
import { api } from "../../lib/axios";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import { dateFormat } from "../../helpers/DateFormat";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import { useNavigate } from "react-router-dom";


const CoursesByTeacher: React.FC = () => {

    // #region states
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm")); // mobile
    const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    const [courses, setCourses] = useState<GetCourse[]>([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState<number>(3);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const navigate = useNavigate();


    // #region fetchs
    const getTeacherCourses = async () => {

        setLoadingCourses(true);

        try {

            const response = await api.get("/course/view-by-teacher");

            setCourses(response?.data || []);

        } catch (error) {

            console.error(error);

        }
        finally {

            setLoadingCourses(false);
        }

    }

    useEffect(() => {

        if (courses.length > 0) return;

        getTeacherCourses();
    }, []);

    // #region utils

    const handleNavigateTo = (route: string) => {

        navigate(route);

    }

    const filtered = useMemo(() => {
        if (!query) return courses;
        const q = query.toLowerCase();
        return courses.filter((c) => c.title.toLowerCase().includes(q));
    }, [courses, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

    const pageItems = useMemo(() => {
        const start = (page - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, page, perPage]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    useEffect(() => {
        if (isMdUp) setPerPage(3);
        else if (isSm) setPerPage(2);
        else setPerPage(courses.length);
    }, [isMdUp, isSm, isXs, courses.length]);

    if (loadingCourses) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1300,
                    backgroundColor: "transparent",
                }}
            >
                <SEGPrincipalLoader />
            </Box>
        );
    }

    return (

        <Box sx={{ bgcolor: isXs ? "#fff" : "transparent", minHeight: isXs ? "100vh" : undefined }}>
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ color: "#5560ff", fontWeight: 800, mb: { xs: 2, md: 3 }, mt: { xs: 1, md: 2 } }}
                >
                    Meus Cursos
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        p: { xs: 2, md: 3 },
                        bgcolor: "#ececec",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: { xs: "auto", md: "calc(100vh - 220px)" },
                        overflow: { xs: "visible", md: "hidden" },
                    }}
                >
                    {/* novo curso + pesquisa */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <SEGButton
                            colorTheme="gradient"
                            onClick={() => handleNavigateTo("/new-course")}
                            startIcon={<AddCircleIcon />}
                            sx={{
                                mt: 1,
                                px: 3,
                                py: 1,
                                fontWeight: 700,
                                minWidth: 100,
                                height: 50,
                                maxWidth: 180,
                                alignSelf: { xs: "flex-start", sm: "center" },
                            }}
                        >
                            Novo Curso
                        </SEGButton>

                        <TextField
                            size="small"
                            placeholder="Pesquisar"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            sx={{ width: { xs: "100%", sm: 200 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    <Box sx={{ flex: 1, overflowY: { xs: "visible", md: "auto" }, pr: 1 }}>
                        <Stack spacing={2}>
                            {pageItems.map((c) => (
                                <Paper
                                    key={c.id_course}
                                    sx={{
                                        p: { xs: 1, sm: 1.2 },
                                        borderRadius: 2,
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: "center",
                                        bgcolor: "#fff",
                                        gap: 2,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                        minHeight: { xs: 120, sm: 96 },
                                    }}
                                >
                                    {/* thumbnail*/}
                                    <Box
                                        sx={{
                                            width: { xs: "100%", sm: 120 },
                                            height: { xs: 120, sm: 76 },
                                            borderRadius: 2,
                                            backgroundColor: "#c65f5f",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {c.link_thumbnail ? (
                                            <img
                                                src={c.link_thumbnail}
                                                alt={c.title}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                                            />
                                        ) : (
                                            <Box sx={{ textAlign: "center" }}>
                                                <ImageIcon sx={{ fontSize: { xs: 44, sm: 30 }, opacity: 0.9 }} />
                                                <Typography variant="caption">IMAGEM VIA LINK</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* título + descrição */}
                                    <Box sx={{ width: { xs: "100%", sm: 380 }, pr: { xs: 0, sm: 2 } }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ color: "#2f8dff", fontWeight: 800, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.1 }}
                                        >
                                            {c.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 0.6,
                                                color: "#666",
                                                display: "-webkit-box",
                                                WebkitLineClamp: { xs: 3, sm: 2 },
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {c.description}
                                        </Typography>
                                    </Box>

                                    {!isXs && <Box sx={{ borderLeft: `3px solid ${colors.weakGray}`, height: 72, mx: 2, borderRadius: 10 }} />}

                                    {/* area de informações*/}
                                    {!isXs && (
                                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, minWidth: 260, mr: 2 }}>
                                            <Box>
                                                <Typography variant="body2" display="flex" fontWeight="bold">
                                                    Ativo:
                                                    <Typography variant="body2" display="inline" sx={{
                                                        background: c.active ? '#08f1a0ff' : '#f67171ff',
                                                        px: 0.5,
                                                        ml: 0.2,
                                                        borderRadius: 2
                                                    }}> {c.active ? "Sim" : "Não"}
                                                    </Typography>
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    display="flex"
                                                    sx={{ mt: 1 }}>
                                                    Nro. de Módulos:
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            ml: 0.2
                                                        }}>
                                                        {c.module_count}
                                                    </Typography>
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    display="flex"
                                                >Dificuldade:
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            ml: 0.2
                                                        }}>{mapDifficulty(c.difficulty_level)}
                                                    </Typography>
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    display="flex"
                                                    sx={{ mt: 1 }}>
                                                    Criado em: <Typography
                                                        variant="body2"
                                                        sx={{
                                                            ml: 0.2
                                                        }}>{c.created_at ? dateFormat(c.created_at) : "--/--/----"}
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* separador vertical para sm+ */}
                                    {!isXs && <Box sx={{ borderLeft: `3px solid ${colors.weakGray}`, height: 72, mr: 2, borderRadius: 10 }} />}

                                    {/* botão detalhes: escondido em mobile*/}
                                    {!isXs && (
                                        <Box sx={{ width: { xs: "100%", sm: "auto" }, display: "flex", margin: "auto" }}>
                                            <SEGButton
                                                colorTheme="purple"
                                                startIcon={<EditSquareIcon />}
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: "none",
                                                    mt: 1.5,
                                                    py: 0.9,
                                                    px: 2,
                                                    minWidth: 110,
                                                    maxWidth: 180,
                                                    fontWeight: 700,
                                                    boxShadow: "none",
                                                }}
                                                onClick={() => handleNavigateTo(`/course-management/${c.id_course}`)}
                                            >
                                                EDITAR
                                            </SEGButton>
                                        </Box>
                                    )}
                                </Paper>
                            ))}

                            {pageItems.length === 0 && (
                                <Paper sx={{ p: 4, textAlign: "center" }}>
                                    <Typography>Nenhum curso cadastrado.</Typography>
                                </Paper>
                            )}
                        </Stack>
                    </Box>

                    {!isXs && (
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", py: 1 }}>
                            <SEGPagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => setPage(v)}
                                color="primary"
                                shape="rounded"
                                boundaryCount={1}
                                sx={{
                                    background: colors.purple,
                                    color: 'white'
                                }}
                            />
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default CoursesByTeacher;
