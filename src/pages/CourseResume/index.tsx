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

type EvaluationCriteriaKey = "didatics" | "material_quality" | "teaching_methodology";

interface EvaluationNote {
    note: number;
    comment: string | null;
    id_avaliation: number;
}

interface CourseEvaluation {
    avg: number;
    notes: Record<EvaluationCriteriaKey, EvaluationNote>;
    student_id: string;
    student_full_name: string;
    last_avaliation_id: number;
}

interface CourseResumeData {
    id_course: string;
    title: string;
    description: string;
    link_thumbnail: string;
    difficulty_level: string;
    created_at: string;
    registration_state: "S" | "F" | null;
    teacher_full_name: string;
    category?: string | null;
    modules_count: string;
    overall_rating: {
        avg: number;
        count: number;
    };
    user_rated: boolean;
    evaluations_by_user: CourseEvaluation[];
}

const evaluationCriteriaLabels: Record<EvaluationCriteriaKey, string> = {
    didatics: "Didática",
    material_quality: "Qualidade do material",
    teaching_methodology: "Metodologia de ensino",
};

const mockedCourse: CourseResumeData = {
    id_course: "376533d7-e94d-4306-a9a6-5387ccdae528",
    title: "PostgreSQL: Do básico ao Avançado!",
    description:
        "Curso PostgreSQL do Zero ao Avançado 🐘💙\n\nDomine SQL e PostgreSQL para criar bancos robustos, rápidos e seguros — do primeiro SELECT até índices, funções e particionamento. Tudo com projetos reais, labs guiados e muitas dicas de produção. 🚀\n\nPara quem é? 👩‍💻👨‍💻\n\nDevs front/back que querem consultas eficientes e modelagem limpa.\n\nAnalistas de dados/BI que precisam tirar o máximo do SQL.\n\nDBAs iniciantes e curiosos por performance, segurança e operações.\n\nPré-requisitos 📚\n\nLógica de programação básica.\n\nNoções de terminal ajudam, mas vamos passo a passo.\n\nO que você vai aprender 🎯\n\nSQL essencial: SELECT, WHERE, JOIN, GROUP BY, HAVING ✍️\n\nConsultas avançadas: CTEs, Window Functions, subqueries 🧠\n\nModelagem: normalização, chaves, tipos (UUID, JSONB, ARRAY) 🏗️\n\nPerformance: índices B-Tree/GiST/GIN/BRIN, EXPLAIN ANALYZE ⚡\n\nPL/pgSQL: funções, triggers, views materializadas 🧩\n\nSegurança: roles, permissões, Row Level Security (RLS) 🔐\n\nOperações: backup/restore, VACUUM, autovacuum, particionamento 🛠️\n\nProdução: Docker, pgAdmin/DBeaver, migrações, replicação básica ☁️\n\nPrograma do Curso (módulos) 📦\n\nFundamentos do SQL — Sintaxe, filtros, ordenação, agregações.\n\nModelagem & Tipos — PK/FK, constraints, JSONB, ENUM, DATE/TIME.\n\nJoins & Estratégias de Consulta — CTEs, subqueries, Window.\n\nÍndices e Performance — GIN/BRIN, estatísticas, EXPLAIN/ANALYZE.\n\nPL/pgSQL na Prática — Funções, triggers, erros e boas práticas.\n\nDados Semiestruturados — JSONB, filtros, índices, APIs de dados.\n\nAdmin & Segurança — Usuários, roles, RLS, backup/restore.\n\nProdução & Escala — Particionamento, manutenção, replicação e Docker.\n\nProjetos práticos 🧪\n\nE-commerce: modelagem + consultas analíticas (ticket médio, funil) 🛒\n\nAnalytics: ranking com window e materialized views 📈\n\nMini-API: endpoints alimentados por JSONB e CTEs ⚙️\n\nMetodologia de ensino 👩‍🏫\n\nAulas curtas e diretas ✅\n\nLabs com datasets reais 🧰\n\nCheatsheets e desafios com feedback 🔎\n\nSuporte em dúvidas mais comuns 🙋‍♀️🙋‍♂️\n\nFerramentas 💻\n\nPostgreSQL (Docker), psql, pgAdmin / DBeaver.\n\nScripts e migrações versionadas (ex.: docker-compose, psql -f).\n\nCertificado & Carga horária 🎓\n\nCertificado de conclusão.\n\nCarga horária sugerida: 24–32h (ajuste conforme sua grade).\n\nDiferenciais do curso ✨\n\nFoco em vida real (performance, segurança e manutenção).\n\nConteúdo do básico ao avançado, sem pular etapas.\n\nBoas práticas para times e produção desde o início.",
    link_thumbnail:
        "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com/courses/thumbnail/376533d7-e94d-4306-a9a6-5387ccdae528",
    difficulty_level: "E",
    created_at: "2025-10-16T00:15:55.840Z",
    registration_state: null,
    teacher_full_name: "Professor Diego Chruscinski de Souza",
    category: "Banco de Dados",
    modules_count: "3",
    overall_rating: {
        avg: 2.56,
        count: 9,
    },
    user_rated: true,
    evaluations_by_user: [
        {
            avg: 2,
            notes: {
                didatics: {
                    note: 2,
                    comment: null,
                    id_avaliation: 8,
                },
                material_quality: {
                    note: 2,
                    comment: null,
                    id_avaliation: 14,
                },
                teaching_methodology: {
                    note: 2,
                    comment: null,
                    id_avaliation: 8,
                },
            },
            student_id: "e0f25662-cd4f-439d-992b-82d4be8c625c",
            student_full_name: "Aluno 3 Souza",
            last_avaliation_id: 14,
        },
        {
            avg: 2,
            notes: {
                didatics: {
                    note: 2,
                    comment: "Nice!",
                    id_avaliation: 7,
                },
                material_quality: {
                    note: 2,
                    comment: null,
                    id_avaliation: 12,
                },
                teaching_methodology: {
                    note: 2,
                    comment: "Nice!",
                    id_avaliation: 7,
                },
            },
            student_id: "3245e269-fcec-409f-ae50-b8eda4614181",
            student_full_name: "Aluno 2 Souza",
            last_avaliation_id: 12,
        },
        {
            avg: 3.67,
            notes: {
                didatics: {
                    note: 5,
                    comment: "Ain dorei",
                    id_avaliation: 6,
                },
                material_quality: {
                    note: 1,
                    comment: null,
                    id_avaliation: 11,
                },
                teaching_methodology: {
                    note: 5,
                    comment: "Ain dorei",
                    id_avaliation: 6,
                },
            },
            student_id: "464218d0-36bc-4334-8ee4-8b551ba8d4d7",
            student_full_name: "Aluno 1 Souza",
            last_avaliation_id: 11,
        },
    ],
};

const CoursesResume: React.FC = () => {

    const handleCreateEvaluation = () => {
        console.info("Criar avaliação clicado");
    };

    const handleEditEvaluation = (avaliationId: number) => {
        console.info(`Editar avaliação ${avaliationId} clicado`);
    };

    const handleDeleteEvaluation = (avaliationId: number) => {
        console.info(`Excluir avaliação ${avaliationId} clicado`);
    };

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
        {
            label: "Avaliação geral",
            icon: <EmojiEventsIcon fontSize="small" sx={{ color: colors.blue }} />,
            value: `${mockedCourse.overall_rating.avg.toFixed(2)} (${mockedCourse.overall_rating.count} avaliações)`,
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
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 400, opacity: 0.95, whiteSpace: "pre-line" }}
                                >
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
                            <Typography sx={{ color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>
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
                                {detailItems
                                    .filter((item) => !!item.value)
                                    .map((item) => (
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

            <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 8 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, md: 4 },
                        bgcolor: "#fff",
                        boxShadow: "0 16px 40px rgba(73, 160, 251, 0.12)",
                    }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Avaliações dos alunos
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                Média geral {mockedCourse.overall_rating.avg.toFixed(2)} baseada em {mockedCourse.overall_rating.count} avaliações.
                            </Typography>
                        </Box>
                        <SEGButton colorTheme="gradient" onClick={handleCreateEvaluation} sx={{ width: { xs: "100%", sm: "auto" } }}>
                            Adicionar avaliação
                        </SEGButton>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={3}>
                        {mockedCourse.evaluations_by_user.map((evaluation) => (
                            <Paper
                                key={evaluation.student_id}
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    p: { xs: 2.5, md: 3 },
                                    bgcolor: "rgba(246, 248, 255, 0.8)",
                                }}
                            >
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", md: "center" }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            {evaluation.student_full_name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                            Média do aluno: {evaluation.avg.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                        <SEGButton
                                            colorTheme="outlined"
                                            onClick={() => handleEditEvaluation(evaluation.last_avaliation_id)}
                                            sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}
                                        >
                                            Editar avaliação
                                        </SEGButton>
                                        <SEGButton
                                            colorTheme="outlined"
                                            onClick={() => handleDeleteEvaluation(evaluation.last_avaliation_id)}
                                            sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }}
                                        >
                                            Excluir
                                        </SEGButton>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 2.5 }} />

                                <Grid container spacing={2.5}>
                                    {(Object.entries(evaluation.notes) as [EvaluationCriteriaKey, EvaluationNote][]).map(
                                        ([criterion, note]) => (
                                            <Grid item xs={12} md={4} key={`${evaluation.student_id}-${criterion}`}>
                                                <Stack spacing={1.5}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.blue }}>
                                                        {evaluationCriteriaLabels[criterion]}
                                                    </Typography>
                                                    <Chip
                                                        label={`Nota ${note.note.toFixed(1)}`}
                                                        sx={{
                                                            alignSelf: "flex-start",
                                                            bgcolor: "rgba(73,160,251,0.15)",
                                                            color: colors.blue,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    {note.comment && (
                                                        <Typography variant="body2" sx={{ color: "#333", fontStyle: "italic" }}>
                                                            “{note.comment}”
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Grid>
                                        ),
                                    )}
                                </Grid>
                            </Paper>
                        ))}
                        {mockedCourse.evaluations_by_user.length === 0 && (
                            <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                Nenhuma avaliação registrada para este curso até o momento.
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default CoursesResume;
