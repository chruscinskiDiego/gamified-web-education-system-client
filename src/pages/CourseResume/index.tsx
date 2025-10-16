import React, { useEffect, useState } from "react";
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

interface CourseResumeData {
    id_course: string;
    title: string;
    description: string;
    link_thumbnail: string;
    difficulty_level: string;
    created_at: string;
    registration_state: "S" | "F" | null;
    teacher_full_name?: string | null;
    category?: string | null;
    modules_count: string;
    overall_rating: {
        avg: number | null;
        count: number;
    };
    user_rated: boolean;
    evaluations_by_user: CourseEvaluation[] | null;
}

type EvaluationMetric = {
    note: number;
    id_avaliation: number;
    comment?: string | null;
};

interface CourseEvaluationNotes {
    didatics?: EvaluationMetric;
    material_quality?: EvaluationMetric;
    teaching_methodology?: EvaluationMetric;
    commentary?: {
        id_avaliation: number;
        comment?: string;
        note?: number | string;
        [key: string]: unknown;
    };
}

interface CourseEvaluation {
    avg: number | null;
    notes: CourseEvaluationNotes;
    student_id: string;
    student_full_name: string;
    last_avaliation_id: number;
}

interface RatingFormValues {
    materialQualityNote: number;
    didaticsNote: number;
    teachingMethodologyNote: number;
    commentary: string;
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

    const getCourseResume = async () => {
        try {
            const response = await api.get(`/course/resume/${id}`);

            setCourseResume(response?.data ? response.data : null);
        } catch (error) {
            console.error("Erro ao buscar resumo do curso", error);
        }
    };

    useEffect(() => {

        if (!courseResume) getCourseResume();

        

        return;

    }, []);

    console.log('RESUMO DO CURSO: ' + JSON.stringify(courseResume));

    const buildInitialFormValues = (): RatingFormValues => ({
        materialQualityNote: courseResume?.evaluations_by_user?.[0]?.notes.material_quality?.note ?? 3,
        didaticsNote: courseResume?.evaluations_by_user?.[0]?.notes.didatics?.note ?? 3,
        teachingMethodologyNote: courseResume?.evaluations_by_user?.[0]?.notes.teaching_methodology?.note ?? 3,
        commentary:
            (courseResume?.evaluations_by_user?.[0]?.notes.commentary?.comment ??
                (typeof courseResume?.evaluations_by_user?.[0]?.notes.commentary?.note === "string"
                    ? String(courseResume.evaluations_by_user?.[0]?.notes.commentary?.note)
                    : "")) ?? "",
    });

    const [formValues, setFormValues] = useState<RatingFormValues>(() => buildInitialFormValues());

    const registrationLabel = courseResume?.registration_state === null
        ? "MATRICULAR"
        : courseResume?.registration_state === "S"
            ? "CANCELAR MATRÍCULA"
            : null;

    const isUserEnrolled = courseResume?.registration_state === "S" || courseResume?.registration_state === "F";
    const userEvaluation = courseResume?.evaluations_by_user?.[0] ?? null;
    const teacherName = courseResume?.teacher_full_name ?? "Professor não informado";
    const teacherInitials = teacherName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? "")
        .join("") || "?";

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

    type CreateEvaluationPayload = {
        materialQualityNote: number;
        didaticsNote: number;
        teachingMethodologyNote: number;
        commentary: string;
        id_course: string;
    };

    type UpdateEvaluationPayload = {
        materialQualityAvaliationId?: number;
        materialQualityNote: number;
        didaticsAvaliationId?: number;
        didaticsNote: number;
        teachingMethodologyAvaliationId?: number;
        teachingMethodologyNote: number;
        commentaryId?: number;
        commentary: string;
    };

    type DeleteEvaluationPayload = {
        avaliations: Array<{ avaliation_type: string; delete_avaliation_id: number }>;
    };

    const handleCreateEvaluation = async (payload: CreateEvaluationPayload) => {
        try {
            await api.post("/course/avaliation", payload);
            await getCourseResume();
        } catch (error) {
            console.error("Erro ao criar avaliação", error);
        }
    };

    const handleEditEvaluation = async (payload: UpdateEvaluationPayload) => {
        try {
            await api.put("/course/avaliation", payload);
            await getCourseResume();
        } catch (error) {
            console.error("Erro ao editar avaliação", error);
        }
    };

    const handleDeleteEvaluation = async (payload: DeleteEvaluationPayload) => {
        try {
            await api.request({
                url: "/course/avaliation",
                method: "delete",
                data: payload,
            });
            await getCourseResume();
        } catch (error) {
            console.error("Erro ao excluir avaliação", error);
        }
    };

    const handleSubmitRating = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!ratingDialogMode) return;

        if (ratingDialogMode === "create") {
            if (!courseResume?.id_course) {
                console.error("Curso não identificado para criação de avaliação");
                return;
            }
            const payload: CreateEvaluationPayload = {
                materialQualityNote: formValues.materialQualityNote,
                didaticsNote: formValues.didaticsNote,
                teachingMethodologyNote: formValues.teachingMethodologyNote,
                commentary: formValues.commentary,
                id_course: courseResume.id_course,
            };
            await handleCreateEvaluation(payload);
        } else if (ratingDialogMode === "edit" && userEvaluation) {
            const payload: UpdateEvaluationPayload = {
                materialQualityAvaliationId: userEvaluation.notes.material_quality?.id_avaliation,
                materialQualityNote: formValues.materialQualityNote,
                didaticsAvaliationId: userEvaluation.notes.didatics?.id_avaliation,
                didaticsNote: formValues.didaticsNote,
                teachingMethodologyAvaliationId: userEvaluation.notes.teaching_methodology?.id_avaliation,
                teachingMethodologyNote: formValues.teachingMethodologyNote,
                commentaryId: userEvaluation.notes.commentary?.id_avaliation,
                commentary: formValues.commentary,
            };
            await handleEditEvaluation(payload);
        }

        handleCloseRatingDialog();
    };

    const handleConfirmDelete = async () => {
        if (!userEvaluation) {
            setDeleteDialogOpen(false);
            return;
        }

        const payload: DeleteEvaluationPayload = {
            avaliations: [
                userEvaluation.notes.didatics && {
                    avaliation_type: "didatics" as const,
                    delete_avaliation_id: userEvaluation.notes.didatics.id_avaliation,
                },
                userEvaluation.notes.material_quality && {
                    avaliation_type: "material_quality" as const,
                    delete_avaliation_id: userEvaluation.notes.material_quality.id_avaliation,
                },
                userEvaluation.notes.teaching_methodology && {
                    avaliation_type: "teaching_methodology" as const,
                    delete_avaliation_id: userEvaluation.notes.teaching_methodology.id_avaliation,
                },
                userEvaluation.notes.commentary && {
                    avaliation_type: "commentary" as const,
                    delete_avaliation_id: userEvaluation.notes.commentary.id_avaliation,
                },
            ].filter(Boolean) as Array<{ avaliation_type: string; delete_avaliation_id: number }>,
        };

        await handleDeleteEvaluation(payload);
        setDeleteDialogOpen(false);
    };

    const renderRegistrationButton = () => {
        if (!registrationLabel) return null;

        const colorTheme = courseResume?.registration_state === "S" ? "outlined" : "gradient";

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
            value: courseResume?.id_course,
        },
        {
            label: "Professor responsável",
            icon: <PersonOutlineIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.teacher_full_name ?? "Não informado",
        },
        {
            label: "Categoria",
            icon: <CategoryIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.category ?? "Não informado",
        },
        {
            label: "Data de criação",
            icon: <CalendarMonthIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: dateFormat(courseResume?.created_at || new Date().toISOString()),
        },
        {
            label: "Quantidade de módulos",
            icon: <LayersIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.modules_count,
        },
        {
            label: "Status da matrícula",
            icon: <EmojiEventsIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: courseResume?.registration_state === null
                ? "Não matriculado"
                : courseResume?.registration_state === "S"
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
                                    label={`Dificuldade: ${mapDifficulty(courseResume?.difficulty_level || '')}`}
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
                                    {courseResume?.title}
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
                                                {courseResume?.overall_rating.avg?.toFixed(2) ?? ""}
                                            </Typography>
                                            <Rating
                                                value={courseResume?.overall_rating.avg ?? 0}
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
                                            {(courseResume?.overall_rating?.count ?? 0) > 0
                                                ? `${courseResume?.overall_rating?.count ?? 0} ${(courseResume?.overall_rating?.count ?? 0) > 1 ? "avaliações registradas" : "avaliação registrada"}`
                                                : ""}
                                        </Typography>
                                </Paper>
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
                                <Box
                                    component="img"
                                    src={courseResume?.link_thumbnail}
                                    alt={`Thumb do curso ${courseResume?.title}`}
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
                            <Typography
                                variant="body1"
                                sx={{ color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}
                            >
                                {courseResume?.description}
                            </Typography>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="caption" sx={{ color: colors.strongGray }}>
                                Link da thumbnail
                            </Typography>
                            <Typography
                                component="a"
                                href={courseResume?.link_thumbnail}
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
                                {courseResume?.link_thumbnail}
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
                                        courseResume.user_rated ? (
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
                                    {courseResume.evaluations_by_user.map((evaluation) => (
                                        <Paper
                                            key={`${evaluation.student_id}-${evaluation.last_avaliation_id}`}
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
                                                        {evaluation.student_full_name
                                                            .split(" ")
                                                            .slice(0, 2)
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                            {evaluation.student_full_name}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Rating
                                                                value={evaluation.avg ?? 0}
                                                                precision={0.1}
                                                                readOnly
                                                                size="small"
                                                            />
                                                            <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                                                {evaluation.avg ? evaluation.avg.toFixed(2) : "--"}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                                <Chip
                                                    label={`Última avaliação #${evaluation.last_avaliation_id}`}
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
                                                    const metric = evaluation.notes[key];
                                                    if (!metric) return null;
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
                                                                    <Rating value={metric.note} readOnly size="small" />
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                        {metric.note.toFixed(1)}
                                                                    </Typography>
                                                                </Stack>
                                                                {metric.comment && (
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            mt: 1,
                                                                            color: colors.strongGray,
                                                                            whiteSpace: "pre-line",
                                                                        }}
                                                                    >
                                                                        {metric.comment}
                                                                    </Typography>
                                                                )}
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>

                                            {(() => {
                                                const commentaryRaw = evaluation.notes.commentary;
                                                const commentaryText = typeof commentaryRaw?.note === "string"
                                                    ? commentaryRaw.note
                                                    : commentaryRaw?.comment ?? "";
                                                if (!commentaryText) return null;

                                                return (
                                                    <Box sx={{ mt: 3 }}>
                                                        <Typography variant="overline" sx={{ color: colors.strongGray }}>
                                                            Comentário sobre o curso
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{ mt: 1, lineHeight: 1.7, color: "#4b4b4b", whiteSpace: "pre-line" }}
                                                        >
                                                            {commentaryText}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
                                        </Paper>
                                    ))}
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
