import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Avatar,
    Box,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LayersIcon from "@mui/icons-material/Layers";
import CategoryIcon from "@mui/icons-material/Category";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import { colors } from "../../theme/colors";
import SEGButton from "../../components/SEGButton";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import { dateFormat } from "../../helpers/DateFormat";
import { api } from "../../lib/axios";
import { useParams } from "react-router-dom";

type EvaluationMetric = {
    note: number | null;
    id_avaliation: number | null;
};

interface CourseEvaluationCommentary {
    id_avaliation: number | null;
    comment?: string | null;
    note?: number | string | null;
    [key: string]: unknown;
}

interface CourseEvaluationNotes {
    didatics?: EvaluationMetric;
    material_quality?: EvaluationMetric;
    teaching_methodology?: EvaluationMetric;
    commentary?: CourseEvaluationCommentary | null;
}

interface CourseEvaluation {
    avg: number | null;
    notes: CourseEvaluationNotes;
    commentary?: CourseEvaluationCommentary | null;
    student_id: string | null;
    student_full_name: string | null;
    last_avaliation_id: number | null;
}

interface CourseResumeData {
    id_course: string | null;
    title: string | null;
    description: string | null;
    link_thumbnail: string | null;
    difficulty_level: string | null;
    created_at: string | null;
    registration_state: "S" | "F" | null;
    teacher_full_name?: string | null;
    teacher_profile_picture?: string | null;
    category?: string | null;
    modules_count: string | number | null;
    overall_rating: {
        avg: number | null;
        count: number;
    };
    user_rated: boolean;
    evaluations_by_user: CourseEvaluation[];
}

type CourseResumeApiResponse = Omit<CourseResumeData, "overall_rating" | "evaluations_by_user"> & {
    overall_rating?: {
        avg: number | null;
        count: number | null;
    } | null;
    evaluations_by_user?: Array<(
        Omit<CourseEvaluation, "notes" | "commentary"> & {
            notes?: {
                didatics?: EvaluationMetric | null;
                material_quality?: EvaluationMetric | null;
                teaching_methodology?: EvaluationMetric | null;
                commentary?: CourseEvaluationCommentary | null;
            } | null;
            commentary?: CourseEvaluationCommentary | null;
        }
    ) | null> | null;
};

interface RatingFormValues {
    materialQualityNote: number;
    didaticsNote: number;
    teachingMethodologyNote: number;
    commentary: string;
}

interface CreateEvaluationPayload {
    materialQualityNote: number;
    didaticsNote: number;
    teachingMethodologyNote: number;
    commentary: string;
    id_course: string;
}

interface UpdateEvaluationPayload {
    materialQualityAvaliationId: number | null | undefined;
    materialQualityNote: number;
    didaticsAvaliationId: number | null | undefined;
    didaticsNote: number;
    teachingMethodologyAvaliationId: number | null | undefined;
    teachingMethodologyNote: number;
    commentaryId: number | null | undefined;
    commentary: string;
}

interface DeleteEvaluationPayload {
    avaliations: Array<{
        avaliation_type: "didatics" | "material_quality" | "teaching_methodology" | "commentary";
        delete_avaliation_id: number;
    }>;
}

/*const courseResume: CourseResumeData = {
    id_course: "26e22b72-d358-459e-b209-ce57912df142",
    title: "Fund. de Prog.",
    description: "Um curso muito legal e interativo sobre code",
    link_thumbnail: "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//user-profile-pictures/20c55048-111a-45cf-b40a-24c34ef80579",
    difficulty_level: "E",
    created_at: "2025-10-01T15:15:50.062Z",
    registration_state: "S",
    teacher_full_name: "Diego Chruscinski de Souza",
    category: "Aulas do Jaime",
    modules_count: "12",
    overall_rating: {
        avg: 3.67,
        count: 3,
    },
    user_rated: true,
    evaluations_by_user: [
        {
            avg: 3.67,
            student_id: "f975ed4e-803f-4fe3-8482-0aeb587163ad",
            student_full_name: "Professor Diego Chruscinski de Souza",
            last_avaliation_id: 9,
            notes: {
                didatics: {
                    note: 5,
                    id_avaliation: 5,
                },
                material_quality: {
                    note: 1,
                    id_avaliation: 9,
                },
                teaching_methodology: {
                    note: 5,
                    id_avaliation: 5,
                },
                commentary: {
                    id_avaliation: 7,
                    comment: "Curso muito bom!",
                },
            },
        },
    ],
};*/

const CoursesResume: React.FC = () => {

    const [ratingDialogMode, setRatingDialogMode] = useState<"create" | "edit" | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseResume, setCourseResume] = useState<CourseResumeData | null>(null);
    const { id } = useParams();
    const descriptionPaperRef = useRef<HTMLDivElement | null>(null);
    const descriptionTitleRef = useRef<HTMLHeadingElement | null>(null);
    const generalInfoPaperRef = useRef<HTMLDivElement | null>(null);
    const [descriptionContentMaxHeight, setDescriptionContentMaxHeight] = useState<number | null>(null);

    const updateDescriptionContentHeight = useCallback(() => {
        if (typeof window === "undefined") return;

        const isMdUp = window.matchMedia("(min-width:900px)").matches;
        if (!isMdUp) {
            setDescriptionContentMaxHeight(null);
            return;
        }

        const generalInfoElement = generalInfoPaperRef.current;
        const descriptionPaperElement = descriptionPaperRef.current;
        const descriptionTitleElement = descriptionTitleRef.current;

        if (!generalInfoElement || !descriptionPaperElement) {
            setDescriptionContentMaxHeight(null);
            return;
        }

        const generalInfoHeight = generalInfoElement.offsetHeight;
        const { paddingTop, paddingBottom } = window.getComputedStyle(descriptionPaperElement);
        const verticalPadding = (parseFloat(paddingTop) || 0) + (parseFloat(paddingBottom) || 0);
        let titleHeight = 0;

        if (descriptionTitleElement) {
            const { marginTop, marginBottom } = window.getComputedStyle(descriptionTitleElement);
            titleHeight =
                descriptionTitleElement.offsetHeight +
                (parseFloat(marginTop) || 0) +
                (parseFloat(marginBottom) || 0);
        }

        const availableHeight = generalInfoHeight - verticalPadding - titleHeight;

        setDescriptionContentMaxHeight(availableHeight > 0 ? availableHeight : null);
    }, []);

    useEffect(() => {
        updateDescriptionContentHeight();

        if (typeof window === "undefined") return;

        const handleResize = () => updateDescriptionContentHeight();
        window.addEventListener("resize", handleResize);

        const generalInfoElement = generalInfoPaperRef.current;
        let resizeObserver: ResizeObserver | null = null;

        if (generalInfoElement && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                updateDescriptionContentHeight();
            });
            resizeObserver.observe(generalInfoElement);
        }

        return () => {
            window.removeEventListener("resize", handleResize);
            resizeObserver?.disconnect();
        };
    }, [updateDescriptionContentHeight, courseResume]);

    const sanitizeCourseResume = (data: CourseResumeApiResponse | null | undefined): CourseResumeData | null => {
        if (!data) return null;

        const evaluations = Array.isArray(data.evaluations_by_user)
            ? data.evaluations_by_user.filter((evaluation): evaluation is CourseEvaluation => Boolean(evaluation))
            : [];

        return {
            id_course: data.id_course ?? null,
            title: data.title ?? null,
            description: data.description ?? null,
            link_thumbnail: data.link_thumbnail ?? null,
            difficulty_level: data.difficulty_level ?? null,
            created_at: data.created_at ?? null,
            registration_state: data.registration_state ?? null,
            teacher_full_name: data.teacher_full_name ?? null,
            teacher_profile_picture: data.teacher_profile_picture ?? null,
            category: data.category ?? null,
            modules_count: data.modules_count ?? null,
            overall_rating: {
                avg: data.overall_rating?.avg ?? null,
                count: data.overall_rating?.count ?? 0,
            },
            user_rated: Boolean(data.user_rated),
            evaluations_by_user: evaluations.map((evaluation) => {
                const commentary = evaluation?.notes?.commentary ?? evaluation?.commentary ?? null;

                const notes: CourseEvaluationNotes = evaluation?.notes
                    ? {
                        didatics: evaluation.notes.didatics ?? undefined,
                        material_quality: evaluation.notes.material_quality ?? undefined,
                        teaching_methodology: evaluation.notes.teaching_methodology ?? undefined,
                        commentary,
                    }
                    : commentary
                        ? { commentary }
                        : {};

                return {
                    avg: evaluation?.avg ?? null,
                    notes,
                    commentary,
                    student_id: evaluation?.student_id ?? null,
                    student_full_name: evaluation?.student_full_name ?? null,
                    last_avaliation_id: evaluation?.last_avaliation_id ?? null,
                };
            }),
        };
    };

    const getCourseResume = async () => {
        if (!id) return;

        try {
            const response = await api.get<CourseResumeApiResponse>(`/course/resume/${id}`);
            setCourseResume(sanitizeCourseResume(response?.data));
        } catch (error) {
            console.error("Erro ao buscar resumo do curso", error);
            setCourseResume(null);
        }
    };

    useEffect(() => {
        getCourseResume();
    }, [id]);

    const createCourseEvaluation = async (payload: CreateEvaluationPayload) => {
        await api.post("/course/avaliation", payload);
    };

    const updateCourseEvaluation = async (payload: UpdateEvaluationPayload) => {
        await api.put("/course/avaliation", payload);
    };

    const deleteCourseEvaluation = async (payload: DeleteEvaluationPayload) => {
        await api.delete("/course/avaliation", { data: payload });
    };

    const buildInitialFormValues = (): RatingFormValues => {
        const evaluation = courseResume?.evaluations_by_user?.[0];
        const commentary = evaluation?.notes?.commentary ?? evaluation?.commentary ?? null;

        const trimmedComment = commentary?.comment?.trim();

        return {
            materialQualityNote: evaluation?.notes?.material_quality?.note ?? 3,
            didaticsNote: evaluation?.notes?.didatics?.note ?? 3,
            teachingMethodologyNote: evaluation?.notes?.teaching_methodology?.note ?? 3,
            commentary:
                (trimmedComment && trimmedComment.length > 0
                    ? trimmedComment
                    : typeof commentary?.note === "string"
                        ? commentary.note
                        : "") ?? "",
        };
    };

    const [formValues, setFormValues] = useState<RatingFormValues>(() => buildInitialFormValues());

    useEffect(() => {
        if (ratingDialogMode === "edit") {
            setFormValues(buildInitialFormValues());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseResume]);

    const registrationLabel = courseResume?.registration_state === null
        ? "MATRICULAR"
        : courseResume?.registration_state === "S"
            ? "CANCELAR MATRÍCULA"
            : null;

    const isUserEnrolled = courseResume?.registration_state === "S" || courseResume?.registration_state === "F";
    const userEvaluation = courseResume?.evaluations_by_user?.[0] ?? null;
    const teacherNameRaw = courseResume?.teacher_full_name?.trim();
    const teacherProfilePicture = courseResume?.teacher_profile_picture;
    const teacherName = teacherNameRaw && teacherNameRaw.length > 0 ? teacherNameRaw : "Professor não informado";
    const teacherInitials = teacherName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? "")
        .join("") || "?";
    const overallRatingAvg = courseResume?.overall_rating?.avg ?? null;
    const overallRatingCount = courseResume?.overall_rating?.count ?? 0;
    const thumbnailUrl = courseResume?.link_thumbnail?.trim() ?? "";
    const hasThumbnail = thumbnailUrl.length > 0;

    type EvaluationMetricKey = "material_quality" | "didatics" | "teaching_methodology";

    const evaluationCriteria: Array<{
        key: EvaluationMetricKey;
        label: string;
    }> = [
            { key: "material_quality", label: "Qualidade do Material" },
            { key: "didatics", label: "Didática do Professor" },
            { key: "teaching_methodology", label: "Metodologia de Ensino" },
        ];

    const handleOpenCreateDialog = () => {
        setFormValues({
            materialQualityNote: 3,
            didaticsNote: 3,
            teachingMethodologyNote: 3,
            commentary: "",
        });
        setRatingDialogMode("create");
    };

    const handleOpenEditDialog = () => {
        setFormValues(buildInitialFormValues());
        setRatingDialogMode("edit");
    };

    const handleCloseRatingDialog = () => {
        setRatingDialogMode(null);
    };

    const handleSubmitRating = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!ratingDialogMode) return;

        try {
            if (ratingDialogMode === "create" && courseResume?.id_course) {
                const payload: CreateEvaluationPayload = {
                    materialQualityNote: formValues.materialQualityNote,
                    didaticsNote: formValues.didaticsNote,
                    teachingMethodologyNote: formValues.teachingMethodologyNote,
                    commentary: formValues.commentary,
                    id_course: courseResume.id_course,
                };

                await createCourseEvaluation(payload);
            } else if (ratingDialogMode === "edit" && userEvaluation) {
                const userCommentary = userEvaluation.notes?.commentary ?? userEvaluation.commentary ?? null;
                const payload: UpdateEvaluationPayload = {
                    materialQualityAvaliationId: userEvaluation.notes.material_quality?.id_avaliation ?? null,
                    materialQualityNote: formValues.materialQualityNote,
                    didaticsAvaliationId: userEvaluation.notes.didatics?.id_avaliation ?? null,
                    didaticsNote: formValues.didaticsNote,
                    teachingMethodologyAvaliationId: userEvaluation.notes.teaching_methodology?.id_avaliation ?? null,
                    teachingMethodologyNote: formValues.teachingMethodologyNote,
                    commentaryId: userCommentary?.id_avaliation ?? null,
                    commentary: formValues.commentary,
                };

                await updateCourseEvaluation(payload);
            }

            await getCourseResume();
        } catch (error) {
            console.error("Erro ao enviar avaliação do curso", error);
        } finally {
            handleCloseRatingDialog();
        }
    };

    const handleConfirmDelete = async () => {
        if (!userEvaluation) {
            setDeleteDialogOpen(false);
            return;
        }

        const userCommentary = userEvaluation.notes?.commentary ?? userEvaluation.commentary ?? null;

        const payload: DeleteEvaluationPayload = {
            avaliations: [
                userEvaluation.notes.didatics?.id_avaliation != null && {
                    avaliation_type: "didatics" as const,
                    delete_avaliation_id: userEvaluation.notes.didatics.id_avaliation,
                },
                userEvaluation.notes.material_quality?.id_avaliation != null && {
                    avaliation_type: "material_quality" as const,
                    delete_avaliation_id: userEvaluation.notes.material_quality.id_avaliation,
                },
                userEvaluation.notes.teaching_methodology?.id_avaliation != null && {
                    avaliation_type: "teaching_methodology" as const,
                    delete_avaliation_id: userEvaluation.notes.teaching_methodology.id_avaliation,
                },
                userCommentary?.id_avaliation != null && {
                    avaliation_type: "commentary" as const,
                    delete_avaliation_id: userCommentary.id_avaliation,
                },
            ].filter((avaliation): avaliation is DeleteEvaluationPayload["avaliations"][number] => Boolean(avaliation)),
        };

        try {
            if (payload.avaliations.length > 0) {
                await deleteCourseEvaluation(payload);
                await getCourseResume();
            }
        } catch (error) {
            console.error("Erro ao excluir avaliação do curso", error);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const renderRegistrationButton = () => {
        if (!registrationLabel) return null;

        const colorTheme = courseResume?.registration_state === "S" ? "purple" : "gradient";

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

    const resolveDetailValue = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) return "Não informado";
        if (typeof value === "string" && value.trim().length === 0) return "Não informado";
        return value;
    };

    const detailItems = [
        {
            label: "ID do curso",
            icon: <FingerprintIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: resolveDetailValue(courseResume?.id_course ?? null),
        },
        {
            label: "Professor responsável",
            icon: <PersonOutlineIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: resolveDetailValue(courseResume?.teacher_full_name ?? null),
        },
        {
            label: "Categoria",
            icon: <CategoryIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: resolveDetailValue(courseResume?.category ?? null),
        },
        {
            label: "Data de criação",
            icon: <CalendarMonthIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.created_at ? dateFormat(courseResume.created_at) : "Não informado",
        },
        {
            label: "Quantidade de módulos",
            icon: <LayersIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: resolveDetailValue(courseResume?.modules_count ?? null),
        },
        {
            label: "Status da matrícula",
            icon: <EmojiEventsIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.registration_state === null
                ? "Não matriculado"
                : courseResume?.registration_state === "S"
                    ? "Cursando"
                    : courseResume?.registration_state === "F"
                        ? "Concluído"
                        : "Não informado",
        },
    ];

    console.log('teacher avatar url: ' + teacherProfilePicture);

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
                                    label={`Dificuldade: ${mapDifficulty(courseResume?.difficulty_level ?? "")}`}
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
                                    {courseResume?.title?.trim() && courseResume.title.trim().length > 0
                                        ? courseResume.title
                                        : "Curso sem título"}
                                </Typography>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        gap: { xs: 2, sm: 3 },
                                        bgcolor: "rgba(255,255,255,0.12)",
                                        px: { xs: 2.5, sm: 3 },
                                        py: { xs: 2, sm: 2.5 },
                                        borderRadius: 3,
                                        backdropFilter: "blur(12px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        color: "#fff",
                                    }}
                                >
                                    <Stack>
                                        <Typography variant="overline" sx={{ opacity: 0.7 }}>
                                            Nota geral dos estudantes
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="flex-end">
                                            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                                {overallRatingAvg !== null && overallRatingAvg !== undefined
                                                    ? overallRatingAvg.toFixed(2)
                                                    : "--"}
                                            </Typography>
                                            <Rating
                                                value={overallRatingAvg ?? 0}
                                                precision={0.1}
                                                readOnly
                                                sx={{
                                                    color: "#ffdf6d",
                                                    "& .MuiRating-iconFilled": { color: "#ffdf6d" },
                                                }}
                                                emptyIcon={<StarIcon fontSize="inherit" sx={{ opacity: 0.4 }} />}
                                            />
                                        </Stack>
                                    </Stack>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                        {overallRatingCount > 0
                                            ? `${overallRatingCount} ${overallRatingCount > 1 ? "avaliações registradas" : "avaliação registrada"}`
                                            : "Ainda não há avaliações registradas"}
                                    </Typography>
                                </Paper>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={teacherProfilePicture || undefined}
                                            alt={teacherName}
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.2)",
                                                color: "#fff",
                                                width: 56,
                                                height: 56,
                                                fontWeight: 700,
                                            }}
                                            imgProps={{
                                                referrerPolicy: "no-referrer",
                                                crossOrigin: "anonymous",
                                                onError: (e) => {
                                                    // Se a imagem falhar, limpa o src para renderizar o fallback (iniciais)
                                                    (e.currentTarget as HTMLImageElement).src = "";
                                                },
                                            }}
                                        >
                                            {teacherInitials}
                                        </Avatar>

                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                Professor responsável
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {teacherName}
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
                                {hasThumbnail ? (
                                    <Box
                                        component="img"
                                        src={thumbnailUrl}
                                        alt={`Thumb do curso ${courseResume?.title ?? "sem título"}`}
                                        sx={{
                                            width: "100%",
                                            height: { xs: 260, md: 320 },
                                            objectFit: "cover",
                                            borderRadius: 4,
                                            boxShadow: "0 24px 45px rgba(0,0,0,0.25)",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: { xs: 260, md: 320 },
                                            borderRadius: 4,
                                            background: "rgba(255,255,255,0.08)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            px: 3,
                                        }}
                                    >
                                        Thumbnail não disponível
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7} sx={{ display: { md: "flex" } }}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 3, md: 4 },
                                bgcolor: "#fff",
                                boxShadow: "0 16px 40px rgba(93, 112, 246, 0.08)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                            ref={descriptionPaperRef}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, mb: { xs: 2, md: 3 } }}
                                ref={descriptionTitleRef}
                            >
                                Sobre o curso
                            </Typography>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: { xs: "visible", md: "auto" },
                                    pr: { md: 1 },
                                    scrollbarWidth: "thin",
                                    scrollbarColor: `${colors.purple} transparent`,
                                    "&::-webkit-scrollbar": {
                                        width: 6,
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: "transparent",
                                        borderRadius: 999,
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: colors.purple,
                                        borderRadius: 999,
                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        backgroundColor: "#4c60e8",
                                    },
                                    ...(descriptionContentMaxHeight
                                        ? { maxHeight: { md: `${descriptionContentMaxHeight}px` } }
                                        : {}),
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#555",
                                        lineHeight: 1.7,
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {courseResume?.description?.trim()
                                        ? courseResume.description
                                        : "Descrição não disponível."}
                                </Typography>
                            </Box>

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
                            ref={generalInfoPaperRef}
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
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 3, md: 4 },
                                bgcolor: "#fff",
                                boxShadow: "0 16px 40px rgba(93, 112, 246, 0.08)",
                            }}
                        >
                            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Avaliações do curso
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.strongGray, mt: 0.5 }}>
                                        Confira o que os estudantes acharam deste conteúdo.
                                    </Typography>
                                </Box>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    {isUserEnrolled ? (
                                        courseResume?.user_rated ? (
                                            <>
                                                <SEGButton colorTheme="blue" sx={{ maxWidth: 240, maxHeight: 55 }} onClick={handleOpenEditDialog}>
                                                    Editar avaliação
                                                </SEGButton>
                                                <SEGButton
                                                    colorTheme="outlined"
                                                    sx={{ maxWidth: 240, mb: 0, maxHeight: 55 }}
                                                    onClick={() => setDeleteDialogOpen(true)}
                                                >
                                                    Excluir avaliação
                                                </SEGButton>
                                            </>
                                        ) : (
                                            <SEGButton colorTheme="gradient" sx={{ maxWidth: 260 }} onClick={handleOpenCreateDialog}>
                                                Avaliar curso
                                            </SEGButton>
                                        )
                                    ) : (
                                        <SEGButton colorTheme="outlined" disabled sx={{ maxWidth: 260, mb: 0 }}>
                                            Matricule-se para avaliar
                                        </SEGButton>
                                    )}
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            {courseResume?.evaluations_by_user && courseResume.evaluations_by_user.length > 0 ? (
                                <Stack spacing={3}>
                                    {courseResume.evaluations_by_user.map((evaluation, index) => {
                                        const studentName = evaluation.student_full_name?.trim() ?? "Estudante";
                                        const studentInitials = studentName
                                            .split(" ")
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((n) => n[0]?.toUpperCase() ?? "")
                                            .join("") || "?";
                                        const evaluationAverage = evaluation.avg ?? null;
                                        const chipLabel = evaluation.last_avaliation_id != null
                                            ? `Última avaliação #${evaluation.last_avaliation_id}`
                                            : "Última avaliação";

                                        return (
                                            <Paper
                                                key={`${evaluation.student_id ?? "student"}-${evaluation.last_avaliation_id ?? index}`}
                                                elevation={0}
                                                sx={{
                                                    borderRadius: 3,
                                                    p: { xs: 2.5, md: 3 },
                                                    bgcolor: "#f9f9ff",
                                                    border: "1px solid rgba(93,112,246,0.08)",
                                                }}
                                            >
                                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ bgcolor: colors.blue, color: "#fff" }}>
                                                            {studentInitials}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                {studentName}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Rating
                                                                    value={evaluationAverage ?? 0}
                                                                    precision={0.1}
                                                                    readOnly
                                                                    size="small"
                                                                />
                                                                <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                                                    {evaluationAverage !== null && evaluationAverage !== undefined
                                                                        ? evaluationAverage.toFixed(2)
                                                                        : "--"}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                    <Chip
                                                        label={chipLabel}
                                                        sx={{
                                                            alignSelf: { xs: "flex-start", sm: "center" },
                                                            bgcolor: "rgba(93,112,246,0.12)",
                                                            color: colors.blue,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Stack>

                                                <Divider sx={{ my: 2.5 }} />

                                                <Grid container spacing={2.5}>
                                                    {evaluationCriteria.map(({ key, label }) => {
                                                        const metric = evaluation.notes?.[key];
                                                        if (!metric || metric.note == null) return null;
                                                        return (
                                                            <Grid item xs={12} md={4} key={key as string}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2.5,
                                                                        bgcolor: "#fff",
                                                                        border: "1px solid rgba(93,112,246,0.06)",
                                                                    }}
                                                                >
                                                                    <Typography variant="overline" sx={{ color: colors.strongGray }}>
                                                                        {label}
                                                                    </Typography>
                                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                                                        <Rating value={metric.note ?? 0} readOnly size="small" />
                                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                            {(metric.note ?? 0).toFixed(1)}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Paper>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>

                                                {(() => {
                                                    const commentaryRaw = evaluation.notes?.commentary ?? evaluation.commentary ?? null;
                                                    const commentText = commentaryRaw?.comment?.trim() ?? "";
                                                    const commentaryNoteText = typeof commentaryRaw?.note === "string"
                                                        ? commentaryRaw.note.trim()
                                                        : "";
                                                    const commentaryText = commentText || commentaryNoteText;
                                                    if (!commentaryText) return null;

                                                    return (
                                                        <Box sx={{ mt: 3 }}>
                                                            <Typography variant="overline" sx={{ color: colors.strongGray }}>
                                                                Comentário sobre o curso
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.7, color: "#4b4b4b" }}>
                                                                {commentaryText}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })()}
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        py: 6,
                                        bgcolor: "rgba(93,112,246,0.04)",
                                        borderRadius: 3,
                                    }}
                                >
                                    <StarIcon sx={{ fontSize: 40, color: colors.blue, mb: 1 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Ainda não há avaliações registradas
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.strongGray, maxWidth: 420 }}>
                                        Seja o primeiro a compartilhar sua experiência com este curso assim que estiver matriculado.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Dialog
                open={Boolean(ratingDialogMode)}
                onClose={handleCloseRatingDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1.5 }}>
                    {ratingDialogMode === "edit" ? "Editar avaliação" : "Avaliar curso"}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmitRating}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography variant="body2" sx={{ color: colors.strongGray }}>
                            Compartilhe sua experiência com a comunidade atribuindo notas para cada aspecto do curso.
                        </Typography>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Qualidade do Material
                                </Typography>
                                <Rating
                                    value={formValues.materialQualityNote}
                                    onChange={(_, value) =>
                                        setFormValues((prev) => ({ ...prev, materialQualityNote: value ?? prev.materialQualityNote }))
                                    }
                                />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Didática do Professor
                                </Typography>
                                <Rating
                                    value={formValues.didaticsNote}
                                    onChange={(_, value) =>
                                        setFormValues((prev) => ({ ...prev, didaticsNote: value ?? prev.didaticsNote }))
                                    }
                                />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Metodologia de Ensino
                                </Typography>
                                <Rating
                                    value={formValues.teachingMethodologyNote}
                                    onChange={(_, value) =>
                                        setFormValues((prev) => ({ ...prev, teachingMethodologyNote: value ?? prev.teachingMethodologyNote }))
                                    }
                                />
                            </Box>
                            <TextField
                                label="Comentário sobre o curso"
                                value={formValues.commentary}
                                onChange={(event) =>
                                    setFormValues((prev) => ({ ...prev, commentary: event.target.value }))
                                }
                                multiline
                                minRows={4}
                                placeholder="Conte para outros estudantes como foi sua experiência"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <SEGButton
                            colorTheme="outlined"
                            onClick={handleCloseRatingDialog}
                            sx={{ maxWidth: 180, mb: 0 }}
                            type="button"
                        >
                            Cancelar
                        </SEGButton>
                        <SEGButton colorTheme="gradient" sx={{ maxWidth: 220, mb: 0 }} type="submit">
                            {ratingDialogMode === "edit" ? "Salvar alterações" : "Enviar avaliação"}
                        </SEGButton>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Excluir avaliação</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: colors.strongGray }}>
                        Tem certeza de que deseja excluir sua avaliação? Essa ação não poderá ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <SEGButton
                        colorTheme="outlined"
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ maxWidth: 180, mb: 0 }}
                    >
                        Cancelar
                    </SEGButton>
                    <SEGButton colorTheme="purple" sx={{ maxWidth: 220, mb: 0 }} onClick={handleConfirmDelete}>
                        Excluir
                    </SEGButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CoursesResume;
