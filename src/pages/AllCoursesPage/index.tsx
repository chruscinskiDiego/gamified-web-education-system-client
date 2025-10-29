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
    OutlinedInput,
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
import CategoryIcon from "@mui/icons-material/Category";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import GradeIcon from "@mui/icons-material/Grade";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { CourseCard } from "../../components/CourseCard";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import SEGPagination from "../../components/SEGPagination";
import { alpha } from "@mui/material/styles";

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

    const filterControlStyles = useMemo(
        () => ({
            "& .MuiInputLabel-root": {
                fontWeight: 600,
                color: alpha(theme.palette.text.primary, 0.6),
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: "#4d67f6",
            },
            "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                background: alpha("#ffffff", 0.92),
                boxShadow: "0 16px 32px rgba(77, 103, 246, 0.12)",
                transition: "all .2s ease",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha("#4d67f6", 0.6),
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha("#4d67f6", 0.9),
                boxShadow: "0 0 0 3px rgba(77, 103, 246, 0.18)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
            },
        }),
        [theme],
    );

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
                const idMatches = course.id_course?.toLowerCase().includes(normalizedSearch);
                return titleMatches || descriptionMatches || idMatches;
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
                <Grid container spacing={3} justifyContent="center">
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
            <Grid container spacing={3} justifyContent="center">
                {paginatedCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id_course}>
                        <CourseCard
                            course={{
                                title: course.title,
                                id_course: course.id_course,
                                link_thumbnail: course.link_thumbnail,
                                difficulty_level: course.difficulty_level,
                                avaliation_average: course.avaliation_average,
                                category_name: course.category?.name ?? null,
                            }}
                            onClick={() => handleNavigateToCourse(course.id_course)}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ background: "white", minHeight: "calc(100vh - 64px)" }}>
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
                            position: "relative",
                            overflow: "hidden",
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.18) 100%)",
                            border: `1px solid ${alpha("#4d67f6", 0.16)}`,
                            boxShadow: "0px 24px 60px rgba(57, 88, 201, 0.25)",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                width: 180,
                                height: 180,
                                borderRadius: "50%",
                                background: alpha("#ffffff", 0.2),
                                top: -60,
                                right: -40,
                                filter: "blur(0px)",
                            }}
                        />
                        <Stack spacing={3} position="relative">
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                spacing={2}
                                alignItems={{ xs: "flex-start", md: "center" }}
                            >
                                <Stack spacing={0.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FilterAltOutlinedIcon sx={{ color: "#4d67f6" }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                                            Refine sua busca
                                        </Typography>
                                    </Stack>
                                    <Typography sx={{ color: alpha("#000", 0.6), maxWidth: 520 }}>
                                        Combine filtros inteligentes para encontrar exatamente o curso que você procura.
                                    </Typography>
                                </Stack>

                                <Chip
                                    icon={<StarIcon sx={{ fontSize: 18 }} />}
                                    label={`${filteredCourses.length} cursos disponíveis`}
                                    sx={{
                                        fontWeight: 700,
                                        color: "#ffffff",
                                        background: "linear-gradient(120deg, #4d67f6 0%, #49a0fb 100%)",
                                        height: 40,
                                        borderRadius: 20,
                                        px: 1.5,
                                    }}
                                />
                            </Stack>

                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                alignItems={{ xs: "stretch", md: "center" }}
                            >
                                <TextField
                                    fullWidth
                                    label="Buscar por curso ou ID"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Procure por título, ID ou palavras-chave"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        ...filterControlStyles,
                                    }}
                                />

                                <FormControl fullWidth sx={filterControlStyles}>
                                    <InputLabel id="sort-by-label">Ordenar</InputLabel>
                                    <Select
                                        labelId="sort-by-label"
                                        label="Ordenar"
                                        value={sortBy}
                                        onChange={(event: SelectChangeEvent<string>) => setSortBy(event.target.value)}
                                        input={
                                            <OutlinedInput
                                                label="Ordenar"
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <TuneIcon color="action" />
                                                    </InputAdornment>
                                                }
                                            />
                                        }
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
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth sx={filterControlStyles}>
                                        <InputLabel id="category-filter-label">Categoria</InputLabel>
                                        <Select
                                            labelId="category-filter-label"
                                            label="Categoria"
                                            value={selectedCategory}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedCategory(event.target.value)}
                                            input={
                                                <OutlinedInput
                                                    label="Categoria"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <CategoryIcon color="action" />
                                                        </InputAdornment>
                                                    }
                                                />
                                            }
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

                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth sx={filterControlStyles}>
                                        <InputLabel id="difficulty-filter-label">Dificuldade</InputLabel>
                                        <Select
                                            labelId="difficulty-filter-label"
                                            label="Dificuldade"
                                            value={selectedDifficulty}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedDifficulty(event.target.value)}
                                            input={
                                                <OutlinedInput
                                                    label="Dificuldade"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <SignalCellularAltIcon color="action" />
                                                        </InputAdornment>
                                                    }
                                                />
                                            }
                                        >
                                            {difficulties.map((difficulty) => (
                                                <MenuItem key={difficulty.value} value={difficulty.value}>
                                                    {difficulty.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth sx={filterControlStyles}>
                                        <InputLabel id="rating-filter-label">Avaliações</InputLabel>
                                        <Select
                                            labelId="rating-filter-label"
                                            label="Avaliações"
                                            value={selectedRating}
                                            onChange={(event: SelectChangeEvent<string>) => setSelectedRating(event.target.value)}
                                            input={
                                                <OutlinedInput
                                                    label="Avaliações"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <GradeIcon color="action" />
                                                        </InputAdornment>
                                                    }
                                                />
                                            }
                                        >
                                            {ratingOptions.map((rating) => (
                                                <MenuItem key={rating.value} value={rating.value}>
                                                    {rating.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                    <SEGPagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
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