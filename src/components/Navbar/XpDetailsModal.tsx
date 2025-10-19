import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Pagination,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import LinearProgress from "@mui/material/LinearProgress";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import type { getXpInfo } from "../../services/XpService";
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export interface Goal {
    id_goal: number;
    description: string;
    completed: boolean;
    created_at: string;
}

type XpInfo = ReturnType<typeof getXpInfo>;

interface XpDetailsModalProps {
    open: boolean;
    onClose: () => void;
    loadingXp: boolean;
    xpInfo: XpInfo | null;
    totalXp: number;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any>; },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const mockGoals: Goal[] = [
    {
        id_goal: 1,
        description: "desafio teste teste",
        completed: false,
        created_at: "2025-10-19T02:33:43.658Z",
    },
    {
        id_goal: 2,
        description: "desafio teste teste",
        completed: false,
        created_at: "2025-10-19T02:33:44.773Z",
    },
    {
        id_goal: 3,
        description: "desafio teste teste",
        completed: false,
        created_at: "2025-10-19T02:33:45.522Z",
    },
];

const XpDetailsModal: React.FC<XpDetailsModalProps> = ({
    open,
    onClose,
    loadingXp,
    xpInfo,
    totalXp,
}) => {
    const theme = useTheme();
    const [goals, setGoals] = useState<Goal[]>(mockGoals);
    const [page, setPage] = useState(1);
    const [newGoalDescription, setNewGoalDescription] = useState("");
    const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
    const [editingDescription, setEditingDescription] = useState("");
    const rowsPerPage = 4;

    const totalPages = Math.max(1, Math.ceil(goals.length / rowsPerPage));

    const paginatedGoals = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return goals.slice(startIndex, startIndex + rowsPerPage);
    }, [goals, page]);

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const resetEditingState = () => {
        setEditingGoalId(null);
        setEditingDescription("");
    };

    const handleCreateGoal = () => {
        const trimmed = newGoalDescription.trim();
        if (!trimmed) return;

        // TODO: Substituir por requisição real para criar meta
        setGoals((prev) => [
            {
                id_goal: Date.now(),
                description: trimmed,
                completed: false,
                created_at: new Date().toISOString(),
            },
            ...prev,
        ]);
        setNewGoalDescription("");
        setPage(1);
    };

    const handleToggleGoal = (goalId: number) => {
        // TODO: Substituir por requisição real para atualizar meta
        setGoals((prev) =>
            prev.map((goal) =>
                goal.id_goal === goalId
                    ? { ...goal, completed: !goal.completed }
                    : goal,
            ),
        );
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoalId(goal.id_goal);
        setEditingDescription(goal.description);
    };

    const handleCancelEdit = () => {
        resetEditingState();
    };

    const handleSaveGoal = (goalId: number) => {
        const trimmed = editingDescription.trim();
        if (!trimmed) return;

        // TODO: Substituir por requisição real para atualizar meta
        setGoals((prev) =>
            prev.map((goal) =>
                goal.id_goal === goalId
                    ? { ...goal, description: trimmed }
                    : goal,
            ),
        );
        resetEditingState();
    };

    const handleDeleteGoal = (goalId: number) => {
        // TODO: Substituir por requisição real para remover meta
        setGoals((prev) => {
            const updatedGoals = prev.filter((goal) => goal.id_goal !== goalId);
            const newTotalPages = Math.max(1, Math.ceil(updatedGoals.length / rowsPerPage));
            setPage((current) => Math.min(current, newTotalPages));
            return updatedGoals;
        });
    };

    const renderGoalStatusChip = (completed: boolean) => (
        <Chip
            size="small"
            icon={completed ? <TaskAltRoundedIcon /> : <PendingActionsRoundedIcon />}
            label={completed ? "Concluída" : "Em andamento"}
            color={completed ? "success" : "default"}
            sx={{
                backgroundColor: completed
                    ? theme.palette.success.light
                    : theme.palette.action.hover,
                color: completed
                    ? theme.palette.success.contrastText
                    : theme.palette.text.primary,
                fontWeight: 600,
            }}
        />
    );

    const xpRangeText = xpInfo
        ? `${xpInfo.start} XP • ${xpInfo.end} XP`
        : "";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: theme.palette.mode === "dark"
                        ? "linear-gradient(145deg, rgba(29,26,68,0.92) 0%, rgba(16,17,40,0.95) 100%)"
                        : "linear-gradient(145deg, rgba(248,249,255,0.96) 0%, rgba(231,233,255,0.98) 100%)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: 3,
                    pb: 1,
                    gap: 2,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                        Progresso de XP
                    </Typography>
                    {xpInfo && (
                        <Chip
                            label={`Nível ${xpInfo.level}`}
                            color="primary"
                            sx={{
                                fontWeight: 700,
                                borderRadius: 999,
                                textTransform: "uppercase",
                                letterSpacing: 0.4,
                            }}
                        />
                    )}
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 0, pb: 4 }}>
                <Stack spacing={4}>
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: "linear-gradient(135deg, rgba(94,84,242,0.95) 0%, rgba(94,198,255,0.9) 100%)",
                            color: "#fff",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                            Total acumulado
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
                            {loadingXp ? "--" : `${totalXp} XP`}
                        </Typography>
                        <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.85 }}>
                                    Progresso atual
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {loadingXp ? "--" : `${xpInfo?.progress ?? 0}%`}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant={loadingXp || !xpInfo ? "indeterminate" : "determinate"}
                                value={xpInfo?.progress ?? 0}
                                sx={{
                                    height: 10,
                                    borderRadius: 999,
                                    backgroundColor: "rgba(255,255,255,0.35)",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 999,
                                        background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)",
                                    },
                                }}
                            />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.85 }}>
                                    Faixa do nível
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {loadingXp ? "--" : xpRangeText}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.85 }}>
                                    XP para o próximo nível
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {loadingXp ? "--" : `${xpInfo?.xpToNext ?? 0} XP`}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Box>
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                    Minhas metas
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Acompanhe e organize suas metas pessoais de evolução.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                placeholder="Descreva uma nova meta"
                                value={newGoalDescription}
                                onChange={(event) => setNewGoalDescription(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PendingActionsRoundedIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddRoundedIcon />}
                                onClick={handleCreateGoal}
                                sx={{
                                    minWidth: { xs: "100%", sm: 160 },
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Adicionar meta
                            </Button>
                        </Stack>

                        <Stack spacing={2}>
                            {paginatedGoals.map((goal) => {
                                const isEditing = editingGoalId === goal.id_goal;
                                const createdAtLabel = dateFormatter.format(new Date(goal.created_at));
                                return (
                                    <Box
                                        key={goal.id_goal}
                                        sx={{
                                            borderRadius: 2.5,
                                            p: 2,
                                            backgroundColor: theme.palette.mode === "dark"
                                                ? "rgba(255,255,255,0.05)"
                                                : "rgba(33, 33, 80, 0.04)",
                                            border: `1px solid ${theme.palette.divider}`,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                                            <Stack spacing={1} flex={1}>
                                                {isEditing ? (
                                                    <TextField
                                                        fullWidth
                                                        value={editingDescription}
                                                        onChange={(event) => setEditingDescription(event.target.value)}
                                                        multiline
                                                        minRows={2}
                                                    />
                                                ) : (
                                                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                                        {goal.description}
                                                    </Typography>
                                                )}
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {renderGoalStatusChip(goal.completed)}
                                                    <Typography variant="caption" color="text.secondary">
                                                        Criada em {createdAtLabel}
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {isEditing ? (
                                                    <>
                                                        <Tooltip title="Salvar">
                                                            <IconButton color="primary" onClick={() => handleSaveGoal(goal.id_goal)}>
                                                                <CheckRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancelar">
                                                            <IconButton color="inherit" onClick={handleCancelEdit}>
                                                                <CloseRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tooltip title={goal.completed ? "Marcar como pendente" : "Marcar como concluída"}>
                                                            <IconButton color="success" onClick={() => handleToggleGoal(goal.id_goal)}>
                                                                <CheckRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar">
                                                            <IconButton color="primary" onClick={() => handleEditGoal(goal)}>
                                                                <EditRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir">
                                                            <IconButton color="error" onClick={() => handleDeleteGoal(goal.id_goal)}>
                                                                <DeleteRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                {goals.length} {goals.length === 1 ? "meta" : "metas"}
                            </Typography>
                            <Pagination
                                count={totalPages}
                                page={page}
                                color="primary"
                                onChange={handleChangePage}
                                shape="rounded"
                                siblingCount={0}
                            />
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default XpDetailsModal;
