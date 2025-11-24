import React, { useMemo, useState } from "react";
import {
    alpha,
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import SEGButton from "../../components/SEGButton";
import SEGTextField from "../../components/SEGTextField";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import { colors } from "../../theme/colors";
import { api } from "../../lib/axios";
import { getXpInfo } from "../../services/XpService";

interface UserProfile {
    full_name: string;
    id_user: string;
    type: "S" | "T";
    profile_picture_link?: string;
    active: boolean;
}

interface CourseInfo {
    title: string;
    active: boolean;
    id_course: string;
    created_at: string;
    link_thumbnail?: string;
}

interface StudentPayload {
    student: {
        name: string;
        surname: string;
        type: "S";
        email: string;
        active: boolean;
        id_user: string;
        birth_date: string;
        created_at: string;
        profile_picture_link?: string;
        points?: number;
    };
    courses: CourseInfo[];
}

interface TeacherPayload {
    teacher: {
        name: string;
        surname: string;
        type: "T";
        email: string;
        active: boolean;
        id_user: string;
        birth_date: string;
        created_at: string;
        profile_picture_link?: string;
    };
    courses: CourseInfo[];
}

const PageWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    minHeight: "100vh",
    backgroundColor: "#f5f7ff",
    backgroundImage:
        "linear-gradient(180deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.16) 35%, rgba(255,255,255,1) 100%)",
    backgroundAttachment: "fixed",
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
    background: "linear-gradient(120deg, rgba(93,112,246,0.12), rgba(73,160,251,0.18))",
    border: `1px solid ${alpha(colors.purple, 0.22)}`,
    boxShadow: "0 12px 30px rgba(71,103,214,0.18)",
    padding: theme.spacing(3),
    borderRadius: 18,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    minHeight: 48,
    borderRadius: 12,
    background: alpha(colors.white, 0.85),
    backdropFilter: "blur(12px)",
    padding: theme.spacing(0.5),
    boxShadow: "0 10px 24px rgba(73,160,251,0.16)",
    "& .MuiTabs-indicator": {
        height: 4,
        borderRadius: 999,
        backgroundImage: colors.horizontalGradient,
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    minHeight: 44,
    textTransform: "none",
    fontWeight: 700,
    letterSpacing: 0.3,
    borderRadius: 10,
    color: colors.strongGray,
    "&.Mui-selected": {
        color: colors.purple,
    },
    "&:hover": {
        backgroundColor: alpha(colors.purple, 0.08),
    },
    marginInline: theme.spacing(0.5),
}));

const GlassyPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    border: `1px solid ${alpha(colors.purple, 0.14)}`,
    background: "linear-gradient(120deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
}));

const SectionTitle: React.FC<{ title: string; icon?: React.ReactNode; subtitle?: string }> = ({ title, icon, subtitle }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
            {icon}
            <Box>
                <Typography fontSize={18} fontWeight={800} color={colors.purple}>{title}</Typography>
                {subtitle && (
                    <Typography variant="body2" color={colors.strongGray}>{subtitle}</Typography>
                )}
            </Box>
        </Stack>
    </Stack>
);

interface CourseCardProps {
    course: CourseInfo;
    onOpen?: (course: CourseInfo) => void;
    actions?: {
        onActivate: (course: CourseInfo) => void;
        onDeactivate: (course: CourseInfo) => void;
        onDelete: (course: CourseInfo) => void;
    };
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onOpen, actions }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 12,
            border: `1px solid ${alpha(colors.purple, 0.12)}`,
            background: alpha(colors.purple, 0.04),
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
        }}
    >
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
                variant="rounded"
                src={course.link_thumbnail}
                sx={{ width: 64, height: 64, borderRadius: 3, boxShadow: "0 6px 16px rgba(93,112,246,0.25)" }}
            >
                <SchoolRoundedIcon />
            </Avatar>
            <Box flex={1}>
                <Typography fontWeight={700}>{course.title}</Typography>
                <Typography variant="caption" color={colors.strongGray}>{new Date(course.created_at).toLocaleString()}</Typography>
            </Box>
            <Chip
                label={course.active ? "Ativo" : "Inativo"}
                color={course.active ? "success" : "default"}
                variant={course.active ? "filled" : "outlined"}
                size="small"
            />
        </Stack>
        {(onOpen || actions) && (
            <Stack
                direction="row"
                justifyContent={onOpen && actions ? "space-between" : onOpen ? "flex-start" : "flex-end"}
                alignItems="center"
                sx={{ mt: 1, width: "100%" }}
            >
                {onOpen && (
                    <SEGButton
                        colorTheme="outlined"
                        startIcon={<LaunchRoundedIcon />}
                        onClick={() => onOpen(course)}
                        sx={{ alignSelf: "flex-start" }}
                    >
                        Abrir curso
                    </SEGButton>
                )}
                {actions && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <Tooltip title="Ativar curso">
                            <span>
                                <IconButton color="primary" onClick={() => actions.onActivate(course)}>
                                    <PlayArrowRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Desativar curso">
                            <span>
                                <IconButton color="warning" onClick={() => actions.onDeactivate(course)}>
                                    <PauseCircleFilledRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Excluir curso">
                            <span>
                                <IconButton color="error" onClick={() => actions.onDelete(course)}>
                                    <DeleteRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                )}
            </Stack>
        )}
    </Paper>
);

const UsersManagementPage: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [searchProperty, setSearchProperty] = useState("email");
    const [searchValue, setSearchValue] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [studentPayload, setStudentPayload] = useState<StudentPayload | null>(null);
    const [teacherPayload, setTeacherPayload] = useState<TeacherPayload | null>(null);
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [targetCourseId, setTargetCourseId] = useState("");

    const actionButtonSx = { minHeight: 46, minWidth: 180 };

    const handleSearchUser = async () => {
        if (!searchValue.trim()) {
            SEGPrincipalNotificator("Informe um valor para buscar o usuário", "warning");
            return;
        }

        setLoadingSearch(true);
        setSelectedUser(null);
        setStudentPayload(null);
        setTeacherPayload(null);

        try {
            const response = await api.post<UserProfile>("/adm/find-user-profile", {
                property: searchProperty,
                value: searchValue.trim(),
            });

            if (response.status === 200) {
                setSelectedUser(response.data);
                SEGPrincipalNotificator("Usuário localizado", "success");
            }
        } catch (error) {
            SEGPrincipalNotificator("Não foi possível localizar o usuário", "error");
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleLoadDetails = async () => {
        if (!selectedUser) return;
        setLoadingDetails(true);
        setStudentPayload(null);
        setTeacherPayload(null);

        try {
            const response = await api.post<StudentPayload | TeacherPayload>("/adm/find-user-data", {
                id: selectedUser.id_user,
                type: selectedUser.type,
            });

            if (response.status === 200) {
                if (selectedUser.type === "S") {
                    setStudentPayload(response.data as StudentPayload);
                } else {
                    setTeacherPayload(response.data as TeacherPayload);
                }

                SEGPrincipalNotificator("Dados carregados", "success");
            }
        } catch (error) {
            SEGPrincipalNotificator("Não foi possível carregar os dados do usuário", "error");
        } finally {
            setLoadingDetails(false);
        }
    };

    const xpInfo = useMemo(() => {
        const xp = studentPayload?.student.points ?? 0;
        return getXpInfo(xp);
    }, [studentPayload?.student.points]);

    const handleStatusAction = (action: "activate" | "deactivate" | "delete") => {
        if (!selectedUser) return;
        const actionLabels: Record<typeof action, string> = {
            activate: "ativado",
            deactivate: "desativado",
            delete: "excluído",
        };
        SEGPrincipalNotificator(`Ação de ${actionLabels[action]} registrada para ${selectedUser.full_name}.`, "info");
    };

    const handleCourseAction = (action: "activate" | "deactivate" | "delete", courseId?: string) => {
        const selectedCourseId = courseId ?? targetCourseId.trim();

        if (!selectedCourseId) {
            SEGPrincipalNotificator("Informe o ID do curso", "warning");
            return;
        }

        const actionLabels: Record<typeof action, string> = {
            activate: "ativação",
            deactivate: "desativação",
            delete: "exclusão",
        };

        SEGPrincipalNotificator(`Ação de ${actionLabels[action]} solicitada para o curso ${selectedCourseId}.`, "info");
    };

    const handleEnrollment = () => {
        if (!targetCourseId.trim()) {
            SEGPrincipalNotificator("Informe o ID do curso para matricular", "warning");
            return;
        }
        SEGPrincipalNotificator(`Matrícula solicitada no curso ${targetCourseId}.`, "success");
        setEnrollModalOpen(false);
        setTargetCourseId("");
    };

    return (
        <PageWrapper>
            <HeaderCard>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <PersonSearchRoundedIcon sx={{ fontSize: 42, color: colors.purple }} />
                        <Box>
                            <Typography fontWeight={800} fontSize={26}>Gestão de Usuários</Typography>
                            <Typography color={colors.strongGray}>
                                Inspire-se no visual do painel de gamificação e administre alunos, professores e administradores.
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip color="primary" variant="filled" label="Área Administrativa" icon={<SupervisorAccountRoundedIcon />} />
                </Stack>
                <Box mt={3}>
                    <StyledTabs value={tab} onChange={(_, value) => setTab(value)}>
                        <StyledTab icon={<Groups2RoundedIcon />} iconPosition="start" label="Usuários comuns" />
                        <StyledTab icon={<VerifiedUserRoundedIcon />} iconPosition="start" label="Administradores" />
                    </StyledTabs>
                </Box>
            </HeaderCard>

            {tab === 0 && (
                <>
                    <GlassyPaper>
                        <SectionTitle
                            title="Localizar usuário"
                            icon={<ManageSearchRoundedIcon sx={{ color: colors.purple }} />}
                            subtitle="Busque por e-mail ou ID para abrir o perfil."
                        />
                        <Grid container spacing={2} alignItems="flex-end">
                            <Grid item xs={12} md={3}>
                                <SEGTextField
                                    select
                                    label="Propriedade"
                                    placeholder="Selecione a propriedade"
                                    fullWidth
                                    value={searchProperty}
                                    onChange={(event) => setSearchProperty(event.target.value)}
                                    startIcon={<SearchRoundedIcon color="primary" />}
                                    sx={{ mb: 0 }}
                                >
                                    <MenuItem value="email">E-mail</MenuItem>
                                    <MenuItem value="id">ID</MenuItem>
                                </SEGTextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <SEGTextField
                                    label="Valor"
                                    placeholder="Digite o e-mail ou ID"
                                    fullWidth
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    sx={{ mb: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <SEGButton
                                    startIcon={<PersonSearchRoundedIcon />}
                                    loading={loadingSearch}
                                    onClick={handleSearchUser}
                                    sx={{ width: "100%", height: "100%", minHeight: 56 }}
                                >
                                    Buscar usuário
                                </SEGButton>
                            </Grid>
                        </Grid>
                    </GlassyPaper>

                    {selectedUser && (
                        <GlassyPaper>
                            <SectionTitle
                                title="Resultado da busca"
                                icon={<InfoOutlinedIcon sx={{ color: colors.purple }} />}
                                subtitle="Visualize e acesse o perfil detalhado do usuário."
                            />
                            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
                                <Avatar
                                    src={selectedUser.profile_picture_link}
                                    sx={{ width: 96, height: 96, boxShadow: "0 12px 30px rgba(93,112,246,0.35)" }}
                                />
                                <Box flex={1}>
                                    <Typography variant="h6" fontWeight={800}>{selectedUser.full_name}</Typography>
                                    <Typography color={colors.strongGray}>{selectedUser.id_user}</Typography>
                                    <Stack direction="row" spacing={1} mt={1.5}>
                                        <Chip label={selectedUser.type === "S" ? "Aluno" : "Professor"} color="primary" />
                                        <Chip label={selectedUser.active ? "Ativo" : "Inativo"} color={selectedUser.active ? "success" : "default"} />
                                    </Stack>
                                </Box>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1.25}
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    flexWrap="wrap"
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        {!selectedUser.active && (
                                            <Tooltip title="Ativar">
                                                <span>
                                                    <SEGButton
                                                        colorTheme="outlined"
                                                        startIcon={<LockOpenRoundedIcon />}
                                                        onClick={() => handleStatusAction("activate")}
                                                        sx={actionButtonSx}
                                                    >
                                                        Ativar
                                                    </SEGButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                        {selectedUser.active && (
                                            <Tooltip title="Desativar">
                                                <span>
                                                    <SEGButton
                                                        colorTheme="outlined"
                                                        startIcon={<LockPersonRoundedIcon />}
                                                        onClick={() => handleStatusAction("deactivate")}
                                                        sx={actionButtonSx}
                                                    >
                                                        Desativar
                                                    </SEGButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Excluir">
                                            <span>
                                                <SEGButton
                                                    colorTheme="outlined"
                                                    startIcon={<DeleteRoundedIcon />}
                                                    onClick={() => handleStatusAction("delete")}
                                                    sx={actionButtonSx}
                                                >
                                                    Excluir
                                                </SEGButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                    <SEGButton
                                        startIcon={<LaunchRoundedIcon />}
                                        onClick={handleLoadDetails}
                                        loading={loadingDetails}
                                        sx={{ ...actionButtonSx, px: 3 }}
                                    >
                                        Ver detalhes
                                    </SEGButton>
                                </Stack>
                            </Stack>
                        </GlassyPaper>
                    )}

                    {studentPayload && (
                        <>
                            <GlassyPaper>
                                <SectionTitle
                                    title="Perfil do aluno"
                                    icon={<SchoolRoundedIcon sx={{ color: colors.purple }} />}
                                    subtitle="Informações do aluno selecionado."
                                />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 14,
                                                border: `1px solid ${alpha(colors.purple, 0.14)}`,
                                                background: alpha(colors.blue, 0.06),
                                            }}
                                        >
                                            <Stack spacing={2} alignItems="center">
                                                <Avatar
                                                    src={studentPayload.student.profile_picture_link}
                                                    sx={{ width: 90, height: 90, boxShadow: "0 12px 32px rgba(93,112,246,0.32)" }}
                                                />
                                                <Typography fontWeight={800}>{studentPayload.student.name} {studentPayload.student.surname}</Typography>
                                                <Typography color={colors.strongGray}>{studentPayload.student.email}</Typography>
                                                <Divider flexItem />
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label="Aluno" color="primary" size="small" />
                                                    <Chip label={studentPayload.student.active ? "Ativo" : "Inativo"} color={studentPayload.student.active ? "success" : "default"} size="small" />
                                                </Stack>
                                                <Stack spacing={1} width="100%">
                                                    <Typography variant="body2" color={colors.strongGray}>Nasc.: {new Date(studentPayload.student.birth_date).toLocaleDateString()}</Typography>
                                                    <Typography variant="body2" color={colors.strongGray}>Criado em: {new Date(studentPayload.student.created_at).toLocaleString()}</Typography>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 14,
                                                border: `1px solid ${alpha(colors.purple, 0.1)}`,
                                                background: alpha(colors.purple, 0.04),
                                                height: "100%",
                                            }}
                                        >
                                                <SectionTitle title="Ações" subtitle="Gerencie status, matrícula e XP." />
                                                <Stack spacing={2}>
                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                                        {studentPayload.student.active ? (
                                                            <SEGButton
                                                                colorTheme="outlined"
                                                                startIcon={<LockPersonRoundedIcon />}
                                                                onClick={() => handleStatusAction("deactivate")}
                                                            >
                                                                Desativar conta
                                                            </SEGButton>
                                                        ) : (
                                                            <SEGButton
                                                                colorTheme="outlined"
                                                                startIcon={<LockOpenRoundedIcon />}
                                                                onClick={() => handleStatusAction("activate")}
                                                            >
                                                                Ativar conta
                                                            </SEGButton>
                                                        )}
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            startIcon={<DeleteRoundedIcon />}
                                                        onClick={() => handleStatusAction("delete")}
                                                    >
                                                        Excluir usuário
                                                    </SEGButton>
                                                </Stack>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                                    <SEGButton
                                                        startIcon={<PlaylistAddRoundedIcon />}
                                                        onClick={() => { setEnrollModalOpen(true); setTargetCourseId(""); }}
                                                    >
                                                        Matricular em curso (ID)
                                                    </SEGButton>
                                                    <SEGButton
                                                        colorTheme="white"
                                                        startIcon={<InfoOutlinedIcon />}
                                                        onClick={() => SEGPrincipalNotificator("XP detalhado disponível", "info")}
                                                    >
                                                        Ver estatísticas de XP
                                                    </SEGButton>
                                                </Stack>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 12,
                                                        border: `1px solid ${alpha(colors.purple, 0.1)}`,
                                                        background: alpha(colors.white, 0.8),
                                                    }}
                                                >
                                                    <Typography fontWeight={700} gutterBottom>Resumo de XP</Typography>
                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                                        <Box flex={1}>
                                                            <Typography variant="h3" fontWeight={800} color={colors.purple}>{studentPayload.student.points ?? 0} XP</Typography>
                                                            <Typography color={colors.strongGray}>Nível {xpInfo.level} • Próximo nível em {xpInfo.xpToNext} XP</Typography>
                                                        </Box>
                                                        <Box flex={1}>
                                                            <Box
                                                                sx={{
                                                                    height: 10,
                                                                    borderRadius: 99,
                                                                    background: alpha(colors.purple, 0.1),
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                <Box sx={{ width: `${xpInfo.progress}%`, height: "100%", background: colors.horizontalGradient }} />
                                                            </Box>
                                                            <Typography variant="body2" mt={1} color={colors.strongGray}>Progresso no nível: {xpInfo.progress}%</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </GlassyPaper>

                            <GlassyPaper>
                                <SectionTitle
                                    title="Cursos matriculados"
                                    icon={<PlayArrowRoundedIcon sx={{ color: colors.purple }} />}
                                    subtitle="Todos os cursos em que o aluno está matriculado."
                                />
                                <Grid container spacing={2}>
                                    {studentPayload.courses.map((course) => (
                                        <Grid item xs={12} md={4} key={course.id_course}>
                                            <CourseCard course={course} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </GlassyPaper>
                        </>
                    )}

                    {teacherPayload && (
                        <>
                            <GlassyPaper>
                                <SectionTitle
                                    title="Perfil do professor"
                                    icon={<Groups2RoundedIcon sx={{ color: colors.purple }} />}
                                    subtitle="Dados do docente e ações administrativas."
                                />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 14,
                                                border: `1px solid ${alpha(colors.purple, 0.14)}`,
                                                background: alpha(colors.blue, 0.06),
                                            }}
                                        >
                                            <Stack spacing={2} alignItems="center">
                                                <Avatar
                                                    src={teacherPayload.teacher.profile_picture_link}
                                                    sx={{ width: 90, height: 90, boxShadow: "0 12px 32px rgba(93,112,246,0.32)" }}
                                                />
                                                <Typography fontWeight={800}>{teacherPayload.teacher.name} {teacherPayload.teacher.surname}</Typography>
                                                <Typography color={colors.strongGray}>{teacherPayload.teacher.email}</Typography>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label="Professor" color="primary" size="small" />
                                                    <Chip label={teacherPayload.teacher.active ? "Ativo" : "Inativo"} color={teacherPayload.teacher.active ? "success" : "default"} size="small" />
                                                </Stack>
                                                <Stack spacing={1} width="100%">
                                                    <Typography variant="body2" color={colors.strongGray}>Nasc.: {new Date(teacherPayload.teacher.birth_date).toLocaleDateString()}</Typography>
                                                    <Typography variant="body2" color={colors.strongGray}>Criado em: {new Date(teacherPayload.teacher.created_at).toLocaleString()}</Typography>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 14,
                                                border: `1px solid ${alpha(colors.purple, 0.1)}`,
                                                background: alpha(colors.purple, 0.04),
                                                height: "100%",
                                            }}
                                        >
                                            <SectionTitle title="Ações do professor" subtitle="Controle de conta e cursos." />
                                            <Stack spacing={2}>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                                    {teacherPayload.teacher.active ? (
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            startIcon={<LockPersonRoundedIcon />}
                                                            onClick={() => handleStatusAction("deactivate")}
                                                        >
                                                            Desativar conta
                                                        </SEGButton>
                                                    ) : (
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            startIcon={<LockOpenRoundedIcon />}
                                                            onClick={() => handleStatusAction("activate")}
                                                        >
                                                            Ativar conta
                                                        </SEGButton>
                                                    )}
                                                    <SEGButton
                                                        colorTheme="outlined"
                                                        startIcon={<DeleteRoundedIcon />}
                                                        onClick={() => handleStatusAction("delete")}
                                                    >
                                                        Excluir usuário
                                                    </SEGButton>
                                                </Stack>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 12,
                                                        border: `1px solid ${alpha(colors.purple, 0.1)}`,
                                                        background: alpha(colors.blue, 0.06),
                                                    }}
                                                >
                                                    <Typography fontWeight={700} gutterBottom>Estatísticas dos cursos do professor</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={4}>
                                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 10, textAlign: "center", background: alpha(colors.white, 0.9) }}>
                                                                <Typography variant="h4" fontWeight={800}>{teacherPayload.courses.length}</Typography>
                                                                <Typography variant="body2" color={colors.strongGray}>Cursos criados</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={12} sm={4}>
                                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 10, textAlign: "center", background: alpha(colors.white, 0.9) }}>
                                                                <Typography variant="h4" fontWeight={800}>{teacherPayload.courses.filter((c) => c.active).length}</Typography>
                                                                <Typography variant="body2" color={colors.strongGray}>Cursos ativos</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={12} sm={4}>
                                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 10, textAlign: "center", background: alpha(colors.white, 0.9) }}>
                                                                <Typography variant="h4" fontWeight={800}>{teacherPayload.courses.filter((c) => !c.active).length}</Typography>
                                                                <Typography variant="body2" color={colors.strongGray}>Cursos inativos</Typography>
                                                            </Paper>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </GlassyPaper>

                            <GlassyPaper>
                                <SectionTitle
                                    title="Cursos criados"
                                    icon={<PlayArrowRoundedIcon sx={{ color: colors.purple }} />}
                                    subtitle={`Cursos do professor ${teacherPayload.teacher.name}`}
                                />
                                <Grid container spacing={2}>
                                    {teacherPayload.courses.map((course) => (
                                        <Grid item xs={12} md={4} key={course.id_course}>
                                            <CourseCard
                                                course={course}
                                                actions={{
                                                    onActivate: (selectedCourse) => handleCourseAction("activate", selectedCourse.id_course),
                                                    onDeactivate: (selectedCourse) => handleCourseAction("deactivate", selectedCourse.id_course),
                                                    onDelete: (selectedCourse) => handleCourseAction("delete", selectedCourse.id_course),
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </GlassyPaper>
                        </>
                    )}

                    <Dialog open={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Matricular aluno em curso</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Informe o ID do curso para matricular o aluno selecionado. Você pode copiar o ID direto da listagem de cursos.
                            </DialogContentText>
                            <TextField
                                fullWidth
                                label="ID do curso"
                                margin="dense"
                                value={targetCourseId}
                                onChange={(event) => setTargetCourseId(event.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <SEGButton colorTheme="outlined" onClick={() => setEnrollModalOpen(false)}>Cancelar</SEGButton>
                            <SEGButton startIcon={<PlaylistAddRoundedIcon />} onClick={handleEnrollment}>Confirmar matrícula</SEGButton>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {tab === 1 && (
                <GlassyPaper>
                    <SectionTitle
                        title="Usuários administradores"
                        icon={<VerifiedUserRoundedIcon sx={{ color: colors.purple }} />}
                        subtitle="Área em construção: em breve será possível gerenciar também os administradores."
                    />
                    <Typography color={colors.strongGray}>
                        Estruture ações, filtros e cartões seguindo a mesma identidade visual quando os requisitos forem definidos.
                    </Typography>
                </GlassyPaper>
            )}
        </PageWrapper>
    );
};

export default UsersManagementPage;
