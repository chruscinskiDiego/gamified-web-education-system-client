import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
    Rating,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import InsightsIcon from "@mui/icons-material/Insights";
import { api } from "../../lib/axios";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";

interface CourseRating {
    title: string;
    id_course: string;
    avg_overall: number | null;
    avg_didactics: number | null;
    avg_material_quality: number | null;
    avg_teaching_methodology: number | null;
}

interface RatingsSection {
    per_course: CourseRating[];
    overall_average: number | null;
}

interface EngagementOverall {
    total_episodes: number;
    unique_students: number;
    total_completions_pairs: number;
    total_episode_progress_pairs: number;
    avg_completion_rate_per_student: number;
}

interface EngagementCourse {
    title: string;
    id_course: string;
    total_episodes: number;
    unique_students: number;
    total_completions_pairs: number;
    total_episode_progress_pairs: number;
    avg_completion_rate_per_student: number;
}

interface EngagementSection {
    overall: EngagementOverall;
    per_course: EngagementCourse[];
}

interface ModulesAccessCourse {
    title: string;
    id_course: string;
    total_modules: number;
    modules_accessed: number;
    percent_modules_accessed: number;
}

interface ModulesAccessSection {
    per_course: ModulesAccessCourse[];
}

interface StatisticsResponse {
    ratings: RatingsSection;
    engagement: EngagementSection;
    modules_access: ModulesAccessSection;
    teacher_id: string;
}

const gradient = "linear-gradient(135deg, #5560FF, #49A0FB)";

const metricCardStyles = {
    p: 3,
    borderRadius: 3,
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    boxShadow: "0 20px 45px -30px rgba(85,96,255,0.4)",
};

const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) => {
    if (value === null || value === undefined) return "--";
    return value.toLocaleString("pt-BR", options);
};

const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "--";
    return `${(value * 100).toFixed(1).replace(".", ",")}%`;
};

const StatisticsByTeacherPage: React.FC = () => {
    const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    useEffect(() => {
        const getStatistics = async () => {
            setLoading(true);
            setErrorMessage(null);

            try {
                const response = await api.get<StatisticsResponse>("/course/statistics");

                if (response.status === 200) {
                    setStatistics(response.data);
                } else {
                    setStatistics(null);
                }
            } catch (error) {
                console.error(error);
                setStatistics(null);
                setErrorMessage("Não foi possível carregar as estatísticas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        getStatistics();
    }, []);

    const coursesOptions = useMemo(() => {
        if (!statistics) return [] as { value: string; label: string }[];

        const map = new Map<string, string>();

        const merge = <T extends { id_course: string; title: string }>(items: T[] | undefined) => {
            items?.forEach((item) => {
                if (item.id_course && item.title) {
                    map.set(item.id_course, item.title);
                }
            });
        };

        merge(statistics.ratings?.per_course);
        merge(statistics.engagement?.per_course);
        merge(statistics.modules_access?.per_course);

        return Array.from(map.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [statistics]);

    useEffect(() => {
        if (!selectedCourseId && coursesOptions.length > 0) {
            setSelectedCourseId(coursesOptions[0].value);
        }
    }, [coursesOptions, selectedCourseId]);

    const modulesSummary = useMemo(() => {
        if (!statistics) {
            return { totalModules: 0, totalAccessed: 0, percent: 0 };
        }

        const totals = statistics.modules_access.per_course.reduce(
            (acc, current) => {
                acc.totalModules += current.total_modules;
                acc.totalAccessed += current.modules_accessed;
                return acc;
            },
            { totalModules: 0, totalAccessed: 0 }
        );

        const percent = totals.totalModules > 0 ? totals.totalAccessed / totals.totalModules : 0;

        return { ...totals, percent };
    }, [statistics]);

    const selectedCourseData = useMemo(() => {
        if (!statistics || !selectedCourseId) return null;

        const rating = statistics.ratings.per_course.find((item) => item.id_course === selectedCourseId);
        const engagement = statistics.engagement.per_course.find((item) => item.id_course === selectedCourseId);
        const modules = statistics.modules_access.per_course.find((item) => item.id_course === selectedCourseId);

        return { rating, engagement, modules };
    }, [statistics, selectedCourseId]);

    const handleCourseChange = (event: any) => {
        setSelectedCourseId(event.target.value);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f5f7fb",
                }}
            >
                <SEGPrincipalLoader />
            </Box>
        );
    }

    if (!statistics) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f5f7fb",
                    px: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: 480,
                        width: "100%",
                        p: 4,
                        textAlign: "center",
                        borderRadius: 4,
                        backgroundColor: "#fff",
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Nenhuma estatística disponível
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Assim que seus cursos receberem acessos e avaliações, os dados aparecerão aqui.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    const overallEngagement = statistics.engagement.overall;

    return (
        <Box sx={{ bgcolor: "white", minHeight: "100vh", py: { xs: 3} }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            background: gradient,
                            color: "#fff",
                            p: { xs: 3, md: 4 },
                            boxShadow: "0 24px 60px -30px rgba(73,160,251,0.6)",
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                Painel de Estatísticas dos Cursos
                            </Typography>
                            <Typography variant="body1" sx={{ maxWidth: 620, opacity: 0.92 }}>
                                Acompanhe o desempenho das suas turmas com indicadores atualizados de avaliações, engajamento e acesso aos módulos.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                                <Chip
                                    icon={<InsightsIcon sx={{ color: "inherit !important" }} />}
                                    label={`Média Geral: ${formatNumber(statistics.ratings.overall_average, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    sx={{
                                        bgcolor: alpha("#fff", 0.2),
                                        color: "#fff",
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: 14,
                                    }}
                                />
                                <Chip
                                    icon={<GroupsIcon sx={{ color: "inherit !important" }} />}
                                    label={`Estudantes únicos: ${formatNumber(overallEngagement.unique_students)}`}
                                    sx={{
                                        bgcolor: alpha("#fff", 0.2),
                                        color: "#fff",
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: 14,
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: alpha("#ff4d4f", 0.1), border: "1px solid", borderColor: alpha("#ff4d4f", 0.4) }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Ops! Algo deu errado
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {errorMessage}
                            </Typography>
                        </Paper>
                    )}

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Paper elevation={0} sx={metricCardStyles}>
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <AutoGraphIcon sx={{ color: "#5560FF", fontSize: 32 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Média Geral
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#222" }}>
                                        {formatNumber(statistics.ratings.overall_average, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                    <Rating
                                        precision={0.1}
                                        value={statistics.ratings.overall_average ?? 0}
                                        readOnly
                                        sx={{ color: "#FFB400" }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Avaliação geral considerando todos os cursos publicados.
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Paper elevation={0} sx={metricCardStyles}>
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <GroupsIcon sx={{ color: "#5560FF", fontSize: 32 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Estudantes únicos
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#222" }}>
                                        {formatNumber(overallEngagement.unique_students)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Número total de estudantes que acessaram ao menos um episódio dos seus cursos.
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Paper elevation={0} sx={metricCardStyles}>
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <CheckCircleIcon sx={{ color: "#5560FF", fontSize: 32 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Taxa média de conclusão
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#222" }}>
                                        {formatPercent(overallEngagement.avg_completion_rate_per_student)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Percentual médio de episódios concluídos por estudante.
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Paper elevation={0} sx={metricCardStyles}>
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <ViewModuleIcon sx={{ color: "#5560FF", fontSize: 32 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Módulos acessados
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#222" }}>
                                        {formatPercent(modulesSummary.percent)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {`Total de ${formatNumber(modulesSummary.totalAccessed)} módulos acessados de ${formatNumber(modulesSummary.totalModules)} disponíveis.`}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            backgroundColor: "#fff",
                            boxShadow: "0 32px 60px -40px rgba(34,47,62,0.35)",
                        }}
                    >
                        <Stack spacing={3}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                spacing={2}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                        Visão detalhada por curso
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Compare avaliações, engajamento e acesso aos módulos individualmente.
                                    </Typography>
                                </Box>

                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel id="course-selector-label">Curso</InputLabel>
                                    <Select
                                        labelId="course-selector-label"
                                        value={selectedCourseId}
                                        label="Curso"
                                        onChange={handleCourseChange}
                                    >
                                        {coursesOptions.map((course) => (
                                            <MenuItem key={course.value} value={course.value}>
                                                {course.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Divider />

                            {coursesOptions.length === 0 && (
                                <Typography variant="body1">
                                    Ainda não há cursos cadastrados para apresentar estatísticas.
                                </Typography>
                            )}

                            {coursesOptions.length > 0 && !selectedCourseData && (
                                <Typography variant="body2" color="text.secondary">
                                    Selecione um curso para visualizar os detalhes.
                                </Typography>
                            )}

                            {selectedCourseData && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                height: "100%",
                                                backgroundColor: alpha("#5560FF", 0.05),
                                                border: "1px solid",
                                                borderColor: alpha("#5560FF", 0.1),
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <AutoGraphIcon sx={{ color: "#5560FF" }} />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                        Avaliações do curso
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    {selectedCourseData.rating?.title ?? "Sem título"}
                                                </Typography>

                                                <Stack spacing={2}>
                                                    {[{
                                                        label: "Avaliação geral",
                                                        value: selectedCourseData.rating?.avg_overall,
                                                    }, {
                                                        label: "Didática",
                                                        value: selectedCourseData.rating?.avg_didactics,
                                                    }, {
                                                        label: "Qualidade do material",
                                                        value: selectedCourseData.rating?.avg_material_quality,
                                                    }, {
                                                        label: "Metodologia",
                                                        value: selectedCourseData.rating?.avg_teaching_methodology,
                                                    }].map((metric) => {
                                                        const barValue = metric.value ? (metric.value / 5) * 100 : 0;
                                                        return (
                                                            <Box key={metric.label}>
                                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {metric.label}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {metric.value !== null && metric.value !== undefined
                                                                            ? metric.value.toFixed(2).replace(".", ",")
                                                                            : "Sem avaliações"}
                                                                    </Typography>
                                                                </Stack>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={barValue}
                                                                    sx={{
                                                                        height: 10,
                                                                        borderRadius: 5,
                                                                        bgcolor: alpha("#5560FF", 0.12),
                                                                        "& .MuiLinearProgress-bar": {
                                                                            borderRadius: 5,
                                                                            background: gradient,
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                height: "100%",
                                                backgroundColor: alpha("#00C48C", 0.05),
                                                border: "1px solid",
                                                borderColor: alpha("#00C48C", 0.1),
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <CheckCircleIcon sx={{ color: "#00A86B" }} />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                        Engajamento
                                                    </Typography>
                                                </Stack>

                                                <Grid container spacing={2}>
                                                    {[{
                                                        label: "Estudantes",
                                                        value: selectedCourseData.engagement?.unique_students ?? 0,
                                                    }, {
                                                        label: "Episódios",
                                                        value: selectedCourseData.engagement?.total_episodes ?? 0,
                                                    }, {
                                                        label: "Conclusões",
                                                        value: selectedCourseData.engagement?.total_completions_pairs ?? 0,
                                                    }, {
                                                        label: "Taxa média",
                                                        value: selectedCourseData.engagement?.avg_completion_rate_per_student,
                                                        isPercent: true,
                                                    }].map((item) => (
                                                        <Grid key={item.label} item xs={6}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    backgroundColor: alpha("#00A86B", 0.08),
                                                                }}
                                                            >
                                                                <Typography variant="caption" sx={{ textTransform: "uppercase", color: alpha("#004D40", 0.7), fontWeight: 600 }}>
                                                                    {item.label}
                                                                </Typography>
                                                                <Typography variant="h6" sx={{ fontWeight: 800, color: "#004D40" }}>
                                                                    {item.isPercent
                                                                        ? formatPercent(item.value as number | null | undefined)
                                                                        : formatNumber(item.value as number)}
                                                                </Typography>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: alpha("#5560FF", 0.05),
                                                border: "1px solid",
                                                borderColor: alpha("#5560FF", 0.1),
                                            }}
                                        >
                                            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
                                                <Stack spacing={1} sx={{ minWidth: 220 }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <ViewModuleIcon sx={{ color: "#5560FF" }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                            Acesso aos módulos
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Monitoramento de módulos liberados e efetivamente acessados pelos alunos.
                                                    </Typography>
                                                </Stack>

                                                <Box sx={{ flex: 1, width: "100%" }}>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Progresso de acesso
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedCourseData.modules?.percent_modules_accessed !== undefined
                                                                ? `${selectedCourseData.modules.percent_modules_accessed.toFixed(1).replace(".", ",")}%`
                                                                : "--"}
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(100, Math.max(0, selectedCourseData.modules?.percent_modules_accessed ?? 0))}
                                                        sx={{
                                                            height: 12,
                                                            borderRadius: 6,
                                                            bgcolor: alpha("#5560FF", 0.12),
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 6,
                                                                background: gradient,
                                                            },
                                                        }}
                                                    />
                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                                                        <Chip
                                                            label={`${formatNumber(selectedCourseData.modules?.modules_accessed)} módulos acessados`}
                                                            sx={{ bgcolor: alpha("#5560FF", 0.12), color: "#222", fontWeight: 600 }}
                                                        />
                                                        <Chip
                                                            label={`${formatNumber(selectedCourseData.modules?.total_modules)} módulos disponíveis`}
                                                            sx={{ bgcolor: alpha("#5560FF", 0.12), color: "#222", fontWeight: 600 }}
                                                        />
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
};

export default StatisticsByTeacherPage;
