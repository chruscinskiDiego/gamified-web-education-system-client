import type React from "react";
import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Grid,
    LinearProgress,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import SEGButton from "../../components/SEGButton";
import { api } from "../../lib/axios";
import { colors } from "../../theme/colors";
import { mapDifficulty } from "../../helpers/DifficultyLevel";

type RawRegisteredCourse = Record<string, unknown>;

interface RegisteredCourse {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    difficultyLevel: string | null;
    modulesCompleted: number | null;
    modulesTotal: number | null;
    progressPercentage: number | null;
    teacherName: string | null;
    lastAccess: string | null;
}

const isRecord = (value: unknown): value is RawRegisteredCourse => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const extractArray = (payload: unknown): RawRegisteredCourse[] => {
    if (Array.isArray(payload)) {
        return payload.filter(isRecord);
    }

    if (isRecord(payload)) {
        const possibleKeys = ["courses", "registered_courses", "data", "items", "results"];

        for (const key of possibleKeys) {
            const entry = payload[key];

            if (Array.isArray(entry)) {
                return entry.filter(isRecord);
            }
        }
    }

    return [];
};

const parseNullableNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
};

const pickString = (record: RawRegisteredCourse, keys: string[]): string | null => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string") {
            const trimmed = value.trim();

            if (trimmed.length > 0) {
                return trimmed;
            }
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }

    return null;
};

const pickRecord = (record: RawRegisteredCourse, keys: string[]): RawRegisteredCourse | null => {
    for (const key of keys) {
        const value = record[key];

        if (isRecord(value)) {
            return value;
        }
    }

    return null;
};

const normalizeRegisteredCourse = (rawCourse: RawRegisteredCourse): RegisteredCourse | null => {
    const courseData = pickRecord(rawCourse, ["course", "course_data", "courseInfo", "data"]) ?? rawCourse;

    if (!isRecord(courseData)) {
        return null;
    }

    const courseId = pickString(courseData, ["id_course", "id", "course_id"]);
    const fallbackId = pickString(rawCourse, ["id_course", "id", "course_id"]);
    const id = courseId ?? fallbackId;

    if (!id) {
        return null;
    }

    const title = pickString(courseData, ["title", "name"]) ?? "Curso sem título";
    const description = pickString(courseData, ["description", "resume", "summary"]) ?? "";
    const thumbnail =
        (typeof courseData["link_thumbnail"] === "string" && courseData["link_thumbnail"].trim() !== ""
            ? (courseData["link_thumbnail"] as string)
            : null) ??
        (typeof courseData["thumbnail"] === "string" && courseData["thumbnail"].trim() !== ""
            ? (courseData["thumbnail"] as string)
            : null) ??
        (typeof rawCourse["link_thumbnail"] === "string" && rawCourse["link_thumbnail"].trim() !== ""
            ? (rawCourse["link_thumbnail"] as string)
            : null) ??
        (typeof rawCourse["thumbnail"] === "string" && rawCourse["thumbnail"].trim() !== ""
            ? (rawCourse["thumbnail"] as string)
            : null) ??
        null;

    const difficultyLevel =
        pickString(courseData, ["difficulty_level", "difficulty"]) ??
        pickString(rawCourse, ["difficulty_level", "difficulty"]) ??
        null;

    const modulesCompleted =
        parseNullableNumber(rawCourse["modules_completed"]) ??
        parseNullableNumber(rawCourse["completed_modules"]) ??
        parseNullableNumber(rawCourse["modules_done"]) ??
        parseNullableNumber(courseData["modules_completed"]) ??
        null;

    const modulesTotal =
        parseNullableNumber(rawCourse["modules_total"]) ??
        parseNullableNumber(rawCourse["total_modules"]) ??
        parseNullableNumber(courseData["module_count"]) ??
        parseNullableNumber(courseData["modules_total"]) ??
        null;

    let progressPercentage =
        parseNullableNumber(rawCourse["progress_percentage"]) ??
        parseNullableNumber(rawCourse["progress_percent"]) ??
        parseNullableNumber(rawCourse["progress"]) ??
        parseNullableNumber(rawCourse["completion_percentage"]) ??
        parseNullableNumber(courseData["progress_percentage"]) ??
        null;

    if (progressPercentage != null) {
        if (progressPercentage <= 1) {
            progressPercentage *= 100;
        }

        progressPercentage = Math.min(Math.max(progressPercentage, 0), 100);
    } else if (modulesCompleted != null && modulesTotal && modulesTotal > 0) {
        progressPercentage = Math.min(Math.max((modulesCompleted / modulesTotal) * 100, 0), 100);
    }

    const teacherName =
        pickString(rawCourse, ["teacher_name", "teacher", "instructor_name"]) ??
        pickString(courseData, ["teacher_name", "teacher", "instructor_name"]) ??
        null;

    const lastAccess =
        pickString(rawCourse, ["last_access", "last_access_at", "last_accessed_at", "updated_at"]) ??
        null;

    return {
        id,
        title,
        description,
        thumbnail,
        difficultyLevel,
        modulesCompleted,
        modulesTotal,
        progressPercentage,
        teacherName,
        lastAccess,
    };
};

const StudiesPage: React.FC = () => {

    const [courses, setCourses] = useState<RegisteredCourse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const getRegisteredCourses = async () => {
            setIsLoading(true);

            try {
                const response = await api.get("/course/user-registered");
                const normalizedCourses = extractArray(response.data)
                    .map((course) => normalizeRegisteredCourse(course))
                    .filter((course): course is RegisteredCourse => course !== null);

                setCourses(normalizedCourses);
            } catch (error) {
                console.error("Erro ao buscar cursos registrados", error);
                setCourses([]);
            } finally {
                setIsLoading(false);
            }
        };

        getRegisteredCourses();
    }, []);

    const handleAccessCourse = (courseId: string) => {
        navigate(`/course/${courseId}`);
    };

    return (
        <Box sx={{ background: "#f8f9ff", minHeight: "calc(100vh - 64px)" }}>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.blue }}>
                            Meus estudos
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.grey[600], maxWidth: 560 }}>
                            Continue seu aprendizado nos cursos em que você já está matriculado. Retorne para onde
                            parou e acompanhe o seu progresso.
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            borderRadius: 4,
                            background: "#ffffff",
                            boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                            p: { xs: 2.5, md: 4 },
                            minHeight: 320,
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    py: { xs: 6, md: 8 },
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : courses.length === 0 ? (
                            <Box
                                sx={{
                                    py: { xs: 6, md: 8 },
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    color: theme.palette.grey[500],
                                }}
                            >
                                <SchoolIcon sx={{ fontSize: 56, mb: 2, color: theme.palette.grey[400] }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    Você ainda não está matriculado em nenhum curso
                                </Typography>
                                <Typography variant="body2" sx={{ maxWidth: 360 }}>
                                    Assim que você se inscrever em um curso, ele aparecerá aqui para que possa continuar
                                    os estudos.
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {courses.map((course) => (
                                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                height: "100%",
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                display: "flex",
                                                flexDirection: "column",
                                                background: "#ffffff",
                                                boxShadow: "0px 12px 32px rgba(33, 33, 52, 0.12)",
                                            }}
                                        >
                                            {course.thumbnail ? (
                                                <CardMedia
                                                    component="img"
                                                    height="156"
                                                    image={course.thumbnail}
                                                    alt={`Imagem de capa do curso ${course.title}`}
                                                    sx={{ objectFit: "cover" }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        height: 156,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: theme.palette.grey[100],
                                                        color: theme.palette.grey[400],
                                                    }}
                                                >
                                                    <SchoolIcon fontSize="large" />
                                                </Box>
                                            )}

                                            <CardContent
                                                sx={{
                                                    flexGrow: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 2,
                                                    p: 3,
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        {course.difficultyLevel && (
                                                            <Chip
                                                                label={mapDifficulty(course.difficultyLevel)}
                                                                size="small"
                                                                sx={{
                                                                    background: "rgba(77, 103, 246, 0.12)",
                                                                    color: "#5560ff",
                                                                    fontWeight: 600,
                                                                    letterSpacing: 0.2,
                                                                }}
                                                            />
                                                        )}
                                                        {course.teacherName && (
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: theme.palette.grey[600],
                                                                    fontWeight: 600,
                                                                    textTransform: "uppercase",
                                                                }}
                                                            >
                                                                {course.teacherName}
                                                            </Typography>
                                                        )}
                                                    </Stack>

                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: theme.palette.text.primary,
                                                            lineHeight: 1.3,
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {course.title}
                                                    </Typography>

                                                    {course.description && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: theme.palette.grey[600],
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {course.description}
                                                        </Typography>
                                                    )}

                                                    {course.lastAccess && (
                                                        <Typography variant="caption" sx={{ color: theme.palette.grey[500] }}>
                                                            Último acesso: {course.lastAccess}
                                                        </Typography>
                                                    )}
                                                </Stack>

                                                <Stack spacing={1.5}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Progresso
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.blue }}>
                                                            {course.progressPercentage != null
                                                                ? `${Math.round(course.progressPercentage)}%`
                                                                : "—"}
                                                        </Typography>
                                                    </Stack>

                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={course.progressPercentage ?? 0}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 999,
                                                            backgroundColor: theme.palette.grey[200],
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 999,
                                                            },
                                                        }}
                                                    />

                                                    {course.modulesCompleted != null && course.modulesTotal != null && (
                                                        <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
                                                            {`${Math.round(course.modulesCompleted)} de ${Math.round(course.modulesTotal)} módulos concluídos`}
                                                        </Typography>
                                                    )}
                                                </Stack>

                                                <SEGButton
                                                    colorTheme="blue"
                                                    sx={{ mt: "auto", mb: 0 }}
                                                    onClick={() => handleAccessCourse(course.id)}
                                                >
                                                    Acessar curso
                                                </SEGButton>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default StudiesPage;
