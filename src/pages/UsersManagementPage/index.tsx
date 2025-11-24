import React, { useEffect, useMemo, useState } from "react";
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
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
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

interface AdminUser {
    id_user: string;
    name: string;
    surname: string;
    email: string;
    profile_picture_link: string | null;
    active: boolean;
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
                        {!course.active ? (
                            <Tooltip title="Ativar curso">
                                <span>
                                    <IconButton color="primary" onClick={() => actions.onActivate(course)}>
                                        <CheckCircleRoundedIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Desativar curso">
                                <span>
                                    <IconButton color="warning" onClick={() => actions.onDeactivate(course)}>
                                        <DoNotDisturbOnRoundedIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip title="Excluir curso">
                            <span>
                                <IconButton color="error" onClick={() => actions.onDelete(course)}>
                                    <DeleteForeverRoundedIcon />
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
    const [courseConfirm, setCourseConfirm] = useState<{
        open: boolean;
        action?: "activate" | "deactivate" | "delete";
        course?: CourseInfo;
    }>({
        open: false,
    });
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [adminForm, setAdminForm] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
        birth_date: "",
    });
    const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);
    const [editAdminModal, setEditAdminModal] = useState<{
        open: boolean;
        admin?: AdminUser;
        form: { name: string; surname: string; email: string; password: string; birth_date: string };
    }>({
        open: false,
        form: { name: "", surname: "", email: "", password: "", birth_date: "" },
    });
    const [confirmAdminStatus, setConfirmAdminStatus] = useState<{ open: boolean; admin?: AdminUser }>({ open: false });

    const actionButtonWidth = 208;
    const actionButtonHeight = 50;
    const actionButtonSx = {
        minHeight: actionButtonHeight,
        height: actionButtonHeight,
        minWidth: actionButtonWidth,
        width: actionButtonWidth,
        mb: 0,
    };

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

    const loadAdmins = async (showSuccess = true) => {
        setLoadingAdmins(true);

        try {
            const response = await api.get<AdminUser[]>("/user-profile/find-all-admins");

            if (response.status === 200) {
                setAdmins(response.data);

                if (showSuccess) {
                    SEGPrincipalNotificator("Lista de administradores atualizada", "success");
                }
            }
        } catch (error) {
            SEGPrincipalNotificator("Não foi possível carregar os administradores", "error");
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleCreateAdmin = async () => {
        const { name, surname, email, password, birth_date } = adminForm;

        if (!name || !surname || !email || !password || !birth_date) {
            SEGPrincipalNotificator("Preencha todos os campos para criar o administrador", "warning");
            return;
        }

        setCreatingAdmin(true);

        try {
            const payload = {
                name,
                surname,
                email,
                password,
                birth_date: new Date(birth_date).toISOString(),
            };

            const response = await api.post("/user-profile/create-admin", payload);

            if (response.status === 201 || response.status === 200) {
                SEGPrincipalNotificator("Administrador criado com sucesso", "success");
                setAdminForm({ name: "", surname: "", email: "", password: "", birth_date: "" });
                await loadAdmins(false);
            }
        } catch (error) {
            SEGPrincipalNotificator("Não foi possível criar o administrador", "error");
        } finally {
            setCreatingAdmin(false);
        }
    };

    const handleAdminStatusAction = (action: "activate" | "deactivate", admin: AdminUser) => {
        if (action === "deactivate") {
            void submitAdminDisable(admin);
            return;
        }

        const payload = { active: true };
        void submitAdminUpdate(admin, payload, "Administrador ativado");
    };

    const handleEditAdmin = (admin: AdminUser) => {
        setEditAdminModal({
            open: true,
            admin,
            form: {
                name: admin.name,
                surname: admin.surname,
                email: admin.email,
                password: "",
                birth_date: "",
            },
        });
    };

    const submitAdminUpdate = async (
        admin: AdminUser,
        payload: Partial<{ name: string; surname: string; email: string; password: string; birth_date: string; active: boolean }>,
        successMessage: string,
    ) => {
        setAdminActionLoading(admin.id_user);

        try {
            const formattedPayload = { ...payload };

            if (payload.birth_date) {
                formattedPayload.birth_date = new Date(payload.birth_date).toISOString();
            }

            await api.patch(`/user-profile/update/${admin.id_user}`, formattedPayload);
            SEGPrincipalNotificator(successMessage, "success");
            await loadAdmins(false);
        } catch (error: any) {
            const message = error?.response?.data?.message ?? "Não foi possível atualizar o administrador";
            SEGPrincipalNotificator(String(message), "error");
        } finally {
            setAdminActionLoading(null);
            setConfirmAdminStatus({ open: false });
            setEditAdminModal((prev) => ({ ...prev, open: false }));
        }
    };

    const submitAdminDisable = async (admin: AdminUser) => {
        setAdminActionLoading(admin.id_user);

        try {
            await api.patch(`/user-profile/disable/${admin.id_user}`);
            SEGPrincipalNotificator("Administrador desativado", "success");
            await loadAdmins(false);
        } catch (error: any) {
            const message = error?.response?.data?.message ?? "Não foi possível desativar o administrador";
            SEGPrincipalNotificator(String(message), "error");
        } finally {
            setAdminActionLoading(null);
            setConfirmAdminStatus({ open: false });
        }
    };

    const handleConfirmDeactivate = () => {
        if (!confirmAdminStatus.admin) return;
        handleAdminStatusAction("deactivate", confirmAdminStatus.admin);
    };

    const handleSubmitEditAdmin = async () => {
        if (!editAdminModal.admin) return;

        const { name, surname, email, password, birth_date } = editAdminModal.form;

        if (!name.trim() || !surname.trim() || !email.trim()) {
            SEGPrincipalNotificator("Preencha nome, sobrenome e e-mail para salvar", "warning");
            return;
        }

        const payload: Partial<{
            name: string;
            surname: string;
            email: string;
            password: string;
            birth_date: string;
        }> = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
        };

        if (password.trim()) {
            payload.password = password.trim();
        }

        if (birth_date) {
            payload.birth_date = birth_date;
        }

        await submitAdminUpdate(editAdminModal.admin, payload, "Administrador atualizado com sucesso");
    };

    useEffect(() => {
        if (tab === 1 && !admins.length && !loadingAdmins) {
            void loadAdmins(false);
        }
    }, [tab, admins.length, loadingAdmins]);

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

    const openCourseConfirm = (action: "activate" | "deactivate" | "delete", course: CourseInfo) => {
        setCourseConfirm({ open: true, action, course });
    };

    const confirmCourseAction = () => {
        if (!courseConfirm.action || !courseConfirm.course) return;
        handleCourseAction(courseConfirm.action, courseConfirm.course.id_course);
        setCourseConfirm({ open: false });
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
                                    alignItems="stretch"
                                    justifyContent="flex-end"
                                    flexWrap="wrap"
                                >
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
                                    <SEGButton
                                        startIcon={<LaunchRoundedIcon />}
                                        onClick={handleLoadDetails}
                                        loading={loadingDetails}
                                        sx={actionButtonSx}
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
                                    icon={<LibraryBooksRoundedIcon sx={{ color: colors.purple }} />}
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
                                    icon={<LibraryBooksRoundedIcon sx={{ color: colors.purple }} />}
                                    subtitle={`Cursos do professor ${teacherPayload.teacher.name}`}
                                />
                                <Grid container spacing={2}>
                                    {teacherPayload.courses.map((course) => (
                                        <Grid item xs={12} md={4} key={course.id_course}>
                                            <CourseCard
                                                course={course}
                                                actions={{
                                                    onActivate: (selectedCourse) => openCourseConfirm("activate", selectedCourse),
                                                    onDeactivate: (selectedCourse) => openCourseConfirm("deactivate", selectedCourse),
                                                    onDelete: (selectedCourse) => openCourseConfirm("delete", selectedCourse),
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

                    <Dialog
                        open={courseConfirm.open}
                        onClose={() => setCourseConfirm({ open: false })}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle>Confirmar ação no curso</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {courseConfirm.course
                                    ? `Deseja realmente ${
                                          courseConfirm.action === "delete"
                                              ? "excluir"
                                              : courseConfirm.action === "activate"
                                              ? "ativar"
                                              : "desativar"
                                      } o curso "${courseConfirm.course.title}" (ID: ${courseConfirm.course.id_course})?`
                                    : "Selecione um curso para continuar."}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <SEGButton colorTheme="outlined" onClick={() => setCourseConfirm({ open: false })}>
                                Cancelar
                            </SEGButton>
                            <SEGButton
                                startIcon={
                                    courseConfirm.action === "delete"
                                        ? <DeleteForeverRoundedIcon />
                                        : courseConfirm.action === "activate"
                                        ? <CheckCircleRoundedIcon />
                                        : <DoNotDisturbOnRoundedIcon />
                                }
                                onClick={confirmCourseAction}
                            >
                                Confirmar
                            </SEGButton>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {tab === 1 && (
                <GlassyPaper>
                    <SectionTitle
                        title="Usuários administradores"
                        icon={<VerifiedUserRoundedIcon sx={{ color: colors.purple }} />}
                        subtitle="Cadastre, visualize e mantenha os perfis administrativos."
                    />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 14,
                                    border: `1px solid ${alpha(colors.purple, 0.12)}`,
                                    background: alpha(colors.purple, 0.04),
                                    height: "100%",
                                }}
                            >
                                <Typography fontWeight={800} mb={1.5} color={colors.purple}>
                                    Adicionar administrador
                                </Typography>
                                <Typography variant="body2" color={colors.strongGray} mb={2}>
                                    Informe os dados do novo administrador para criar o acesso.
                                </Typography>

                                <SEGTextField
                                    label="Nome"
                                    placeholder="Digite o nome"
                                    value={adminForm.name}
                                    onChange={(event) => setAdminForm((prev) => ({ ...prev, name: event.target.value }))}
                                />
                                <SEGTextField
                                    label="Sobrenome"
                                    placeholder="Digite o sobrenome"
                                    value={adminForm.surname}
                                    onChange={(event) => setAdminForm((prev) => ({ ...prev, surname: event.target.value }))}
                                />
                                <SEGTextField
                                    label="E-mail"
                                    placeholder="email@exemplo.com"
                                    type="email"
                                    value={adminForm.email}
                                    onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))}
                                />
                                <SEGTextField
                                    label="Senha temporária"
                                    placeholder="Defina uma senha inicial"
                                    type="password"
                                    showPasswordToggle
                                    value={adminForm.password}
                                    onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
                                />
                                <SEGTextField
                                    label="Data de nascimento"
                                    type="date"
                                    value={adminForm.birth_date}
                                    onChange={(event) => setAdminForm((prev) => ({ ...prev, birth_date: event.target.value }))}
                                    InputLabelProps={{ shrink: !!adminForm.birth_date }}
                                />

                                <SEGButton
                                    startIcon={<VerifiedUserRoundedIcon />}
                                    loading={creatingAdmin}
                                    onClick={handleCreateAdmin}
                                    sx={{ width: "100%" }}
                                >
                                    Criar administrador
                                </SEGButton>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 14,
                                    border: `1px solid ${alpha(colors.purple, 0.12)}`,
                                    background: alpha(colors.white, 0.9),
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography fontWeight={800} color={colors.purple}>
                                            Administradores cadastrados
                                        </Typography>
                                        <Typography variant="body2" color={colors.strongGray}>
                                            Visualize e gerencie o status dos administradores ativos.
                                        </Typography>
                                    </Box>
                                    <SEGButton
                                        colorTheme="outlined"
                                        startIcon={<AutorenewRoundedIcon />}
                                        loading={loadingAdmins}
                                        onClick={() => loadAdmins()}
                                    >
                                        Atualizar
                                    </SEGButton>
                                </Stack>

                                <Stack spacing={2} sx={{ maxHeight: 520, overflowY: "auto", pr: 1 }}>
                                    {admins.map((admin) => (
                                        <Paper
                                            key={admin.id_user}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 12,
                                                border: `1px solid ${alpha(colors.purple, 0.08)}`,
                                                background: alpha(colors.blue, 0.04),
                                            }}
                                        >
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                                <Avatar
                                                    src={admin.profile_picture_link ?? undefined}
                                                    sx={{ width: 64, height: 64, boxShadow: "0 8px 20px rgba(93,112,246,0.28)" }}
                                                >
                                                    <VerifiedUserRoundedIcon />
                                                </Avatar>

                                                <Box flex={1} width="100%">
                                                    <Typography fontWeight={800}>{admin.name} {admin.surname}</Typography>
                                                    <Typography color={colors.strongGray} variant="body2">{admin.email}</Typography>
                                                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                                        <Chip label="Administrador" color="primary" size="small" />
                                                        <Chip
                                                            label={admin.active ? "Ativo" : "Inativo"}
                                                            color={admin.active ? "success" : "default"}
                                                            size="small"
                                                        />
                                                    </Stack>
                                                </Box>

                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={{ xs: "100%", sm: "auto" }}>
                                                    <SEGButton
                                                        colorTheme="outlined"
                                                        startIcon={<EditRoundedIcon />}
                                                        onClick={() => handleEditAdmin(admin)}
                                                        loading={adminActionLoading === admin.id_user}
                                                    >
                                                        Editar
                                                    </SEGButton>
                                                    {admin.active ? (
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            startIcon={<LockPersonRoundedIcon />}
                                                            onClick={() => setConfirmAdminStatus({ open: true, admin })}
                                                            loading={adminActionLoading === admin.id_user}
                                                        >
                                                            Desativar
                                                        </SEGButton>
                                                    ) : (
                                                        <SEGButton
                                                            colorTheme="outlined"
                                                            startIcon={<LockOpenRoundedIcon />}
                                                            onClick={() => handleAdminStatusAction("activate", admin)}
                                                            loading={adminActionLoading === admin.id_user}
                                                        >
                                                            Ativar
                                                        </SEGButton>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}

                                    {!admins.length && !loadingAdmins && (
                                        <Typography color={colors.strongGray} textAlign="center">
                                            Nenhum administrador cadastrado no momento.
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </GlassyPaper>
            )}

            <Dialog
                open={editAdminModal.open}
                onClose={() => setEditAdminModal((prev) => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Editar administrador</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={editAdminModal.form.name}
                            onChange={(event) =>
                                setEditAdminModal((prev) => ({
                                    ...prev,
                                    form: { ...prev.form, name: event.target.value },
                                }))
                            }
                        />
                        <TextField
                            label="Sobrenome"
                            fullWidth
                            value={editAdminModal.form.surname}
                            onChange={(event) =>
                                setEditAdminModal((prev) => ({
                                    ...prev,
                                    form: { ...prev.form, surname: event.target.value },
                                }))
                            }
                        />
                        <TextField
                            label="E-mail"
                            fullWidth
                            type="email"
                            value={editAdminModal.form.email}
                            onChange={(event) =>
                                setEditAdminModal((prev) => ({
                                    ...prev,
                                    form: { ...prev.form, email: event.target.value },
                                }))
                            }
                        />
                        <TextField
                            label="Senha (opcional)"
                            type="password"
                            fullWidth
                            value={editAdminModal.form.password}
                            onChange={(event) =>
                                setEditAdminModal((prev) => ({
                                    ...prev,
                                    form: { ...prev.form, password: event.target.value },
                                }))
                            }
                        />
                        <TextField
                            label="Data de nascimento (opcional)"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: !!editAdminModal.form.birth_date }}
                            value={editAdminModal.form.birth_date}
                            onChange={(event) =>
                                setEditAdminModal((prev) => ({
                                    ...prev,
                                    form: { ...prev.form, birth_date: event.target.value },
                                }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <SEGButton
                        colorTheme="outlined"
                        onClick={() => setEditAdminModal((prev) => ({ ...prev, open: false }))}
                        disabled={adminActionLoading === editAdminModal.admin?.id_user}
                    >
                        Cancelar
                    </SEGButton>
                    <SEGButton
                        startIcon={<EditRoundedIcon />}
                        onClick={handleSubmitEditAdmin}
                        loading={adminActionLoading === editAdminModal.admin?.id_user}
                    >
                        Salvar alterações
                    </SEGButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmAdminStatus.open}
                onClose={() => setConfirmAdminStatus({ open: false })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Desativar administrador</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmAdminStatus.admin
                            ? `Deseja realmente desativar ${confirmAdminStatus.admin.name} ${confirmAdminStatus.admin.surname}?`
                            : "Selecione um administrador para desativar."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <SEGButton colorTheme="outlined" onClick={() => setConfirmAdminStatus({ open: false })}>
                        Cancelar
                    </SEGButton>
                    <SEGButton
                        startIcon={<LockPersonRoundedIcon />}
                        colorTheme="outlined"
                        onClick={handleConfirmDeactivate}
                        loading={adminActionLoading === confirmAdminStatus.admin?.id_user}
                    >
                        Desativar
                    </SEGButton>
                </DialogActions>
            </Dialog>
        </PageWrapper>
    );
};

export default UsersManagementPage;
