import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Container,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useTheme,
    type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { CourseCard } from "../../components/CourseCard";
import { mapDifficulty } from "../../helpers/DifficultyLevel";

type AllCoursesApiResponse = {
    title: string;
    category: {
        name: string;
        id_category: number | null;
    } | null;
    id_course: string;
    created_at: string | null;
    description: string | null;
    link_thumbnail: string | null;
    difficulty_level: "E" | "M" | "H" | string;
    avaliation_average: number | null;
};

const COURSES_PER_PAGE = 12;

const difficulties = [
    { value: "all", label: "Todas as dificuldades" },
    { value: "E", label: mapDifficulty("E") },
    { value: "M", label: mapDifficulty("M") },
    { value: "H", label: mapDifficulty("H") },
];

const ratingOptions = [
    { value: "all", label: "Qualquer avaliação" },
    { value: "4.5", label: "4.5+" },
    { value: "4", label: "4.0+" },
    { value: "3.5", label: "3.5+" },
    { value: "3", label: "3.0+" },
];

const sortOptions = [
    { value: "relevance", label: "Mais relevantes" },
    { value: "rating", label: "Maior avaliação" },
    { value: "newest", label: "Mais recentes" },
    { value: "alphabetical", label: "Ordem alfabética" },
];

const AllCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<AllCoursesApiResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
    const [selectedRating, setSelectedRating] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("relevance");
    const [page, setPage] = useState<number>(1);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const theme = useTheme();

    const getCourses = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const response = await api.get<AllCoursesApiResponse[]>("/course/view-all");
            setCourses(response.data ?? []);
        } catch (error) {
            console.error("Erro ao buscar cursos", error);
            setErrorMessage("Não foi possível carregar os cursos. Tente novamente mais tarde.");
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCourses();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedDifficulty, selectedRating, sortBy]);

    const categories = useMemo(() => {
        const uniqueCategories = new Map<string, string>();

        courses.forEach((course) => {
            const category = course.category;
            if (!category?.name) return;

            const key = category.id_category != null ? String(category.id_category) : category.name;

            if (!uniqueCategories.has(key)) {
                uniqueCategories.set(key, category.name);
            }
        });

        return Array.from(uniqueCategories.entries()).map(([value, label]) => ({ value, label }));
    }, [courses]);

    const filteredCourses = useMemo(() => {
        const normalizedCourses = [...courses];

        const result = normalizedCourses
            .filter((course) => {
                if (!searchTerm.trim()) return true;
                const normalizedSearch = searchTerm.trim().toLowerCase();
                const titleMatches = course.title?.toLowerCase().includes(normalizedSearch);
                const descriptionMatches = course.description?.toLowerCase().includes(normalizedSearch);
                return titleMatches || descriptionMatches;
            })
            .filter((course) => {
                if (selectedCategory === "all") return true;
                const categoryKey = course.category?.id_category != null
                    ? String(course.category.id_category)
                    : course.category?.name ?? "";
                return categoryKey === selectedCategory;
            })
            .filter((course) => {
                if (selectedDifficulty === "all") return true;
                return (course.difficulty_level ?? "M") === selectedDifficulty;
            })
            .filter((course) => {
                if (selectedRating === "all") return true;
                const minimum = Number(selectedRating);
                const courseRating = course.avaliation_average ?? 0;
                return courseRating >= minimum;
            });

        const sorted = result.sort((a, b) => {
            const ratingA = a.avaliation_average ?? 0;
            const ratingB = b.avaliation_average ?? 0;
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

            switch (sortBy) {
                case "rating":
                case "relevance":
                    if (ratingB !== ratingA) {
                        return ratingB - ratingA;
                    }
                    return dateB - dateA;
                case "newest":
                    if (dateB !== dateA) {
                        return dateB - dateA;
                    }
                    return ratingB - ratingA;
                case "alphabetical":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [courses, searchTerm, selectedCategory, selectedDifficulty, selectedRating, sortBy]);

    const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE) || 1;

    const paginatedCourses = useMemo(() => {
        const startIndex = (page - 1) * COURSES_PER_PAGE;
        return filteredCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);
    }, [filteredCourses, page]);

    const handleNavigateToCourse = (courseId: string) => {
        navigate(`/course/resume/${courseId}`);
    };

    const renderCoursesGrid = () => {
        if (isLoading) {
            return (
                <Grid container spacing={3}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            );
        }

        if (errorMessage) {
            return (
                <Box
                    sx={{
                        py: { xs: 6, md: 8 },
                        textAlign: "center",
                        color: theme.palette.grey[600],
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Algo não saiu como esperado
                    </Typography>
                    <Typography variant="body2" sx={{ maxWidth: 420, mx: "auto" }}>
                        {errorMessage}
                    </Typography>
                </Box>
            );
        }

        if (filteredCourses.length === 0) {
            return (
                <Box
                    sx={{
                        py: { xs: 6, md: 8 },
                        textAlign: "center",
                        color: theme.palette.grey[500],
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Nenhum curso encontrado
                    </Typography>
                    <Typography variant="body2" sx={{ maxWidth: 420, mx: "auto" }}>
                        Ajuste os filtros ou pesquise por outro termo para encontrar novos cursos.
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={3}>
                {paginatedCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id_course}>
                        <CourseCard
                            course={{
                                title: course.title,
                                id_course: course.id_course,
                                link_thumbnail: course.link_thumbnail,
                                difficulty_level: course.difficulty_level,
                                avaliation_average: course.avaliation_average,
                            }}
                            onClick={() => handleNavigateToCourse(course.id_course)}
                        />
                        {course.category?.name && (
                            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                                <Chip
                                    icon={<TuneIcon sx={{ fontSize: 16 }} />}
                                    label={course.category.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: "rgba(77, 103, 246, 0.08)",
                                        color: "#5560ff",
                                        fontWeight: 600,
                                    }}
                                />
                                {course.avaliation_average != null && (
                                    <Chip
                                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                                        label={`${course.avaliation_average.toFixed(1)} / 5`}
                                        size="small"
                                        sx={{
                                            backgroundColor: "rgba(255, 180, 0, 0.16)",
                                            color: "#b58500",
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Stack>
                        )}
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ background: "#f7f8fe", minHeight: "calc(100vh - 64px)" }}>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#4d67f6" }}>
                            Catálogo de cursos
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.grey[600], maxWidth: 560 }}>
                            Descubra novos conteúdos, filtre por categoria, dificuldade ou avaliações e encontre o curso perfeito
                            para a sua jornada de estudos.
                        </Typography>
                    </Stack>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            background: "#ffffff",
                            boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                        }}
                    >
                        <Stack spacing={3}>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                alignItems={{ xs: "stretch", md: "center" }}
                            >
                                <TextField
                                    fullWidth
                                    label="Buscar por curso"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Procure por título ou palavras-chave"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <FormControl fullWidth>
                                    <InputLabel id="sort-by-label">Ordenar</InputLabel>
                                    <Select
                                        labelId="sort-by-label"
                                        label="Ordenar"
                                        value={sortBy}
                                        onChange={(event: SelectChangeEvent<string>) => setSortBy(event.target.value)}
                                    >
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="category-filter-label">Categoria</InputLabel>
                                        <Select
                                            labelId="category-filter-label"
                                            label="Categoria"
                                            value={selectedCategory}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedCategory(event.target.value)}
                                        >
                                            <MenuItem value="all">Todas as categorias</MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="difficulty-filter-label">Dificuldade</InputLabel>
                                        <Select
                                            labelId="difficulty-filter-label"
                                            label="Dificuldade"
                                            value={selectedDifficulty}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedDifficulty(event.target.value)}
                                        >
                                            {difficulties.map((difficulty) => (
                                                <MenuItem key={difficulty.value} value={difficulty.value}>
                                                    {difficulty.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="rating-filter-label">Avaliações</InputLabel>
                                        <Select
                                            labelId="rating-filter-label"
                                            label="Avaliações"
                                            value={selectedRating}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedRating(event.target.value)}
                                        >
                                            {ratingOptions.map((rating) => (
                                                <MenuItem key={rating.value} value={rating.value}>
                                                    {rating.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                                        sx={{ height: "100%" }}
                                    >
                                        <Chip
                                            label={`${filteredCourses.length} cursos`}
                                            color="primary"
                                            sx={{
                                                fontWeight: 700,
                                                background: "rgba(77, 103, 246, 0.12)",
                                                color: "#5560ff",
                                            }}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            background: "#ffffff",
                            boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                        }}
                    >
                        <Stack spacing={4}>
                            {renderCoursesGrid()}

                            {!isLoading && !errorMessage && filteredCourses.length > 0 && (
                                <Stack direction="row" justifyContent="center">
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        color="primary"
                                        onChange={(_, value) => setPage(value)}
                                    />
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
};

export default AllCoursesPage;