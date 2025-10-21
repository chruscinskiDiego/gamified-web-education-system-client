import React, { useEffect, useState } from "react";
import {
    alpha,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Switch,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import { colors } from "../../theme/colors";
import { api } from "../../lib/axios";

export enum InsigniaRarity {
    COMMON = "COMMON",
    RARE = "RARE",
    LEGENDARY = "LEGENDARY",
}

interface Insignia {
    id_insignia: number;
    name: string;
    description: string;
    rarity: InsigniaRarity;
}

interface Challenge {
    id_challenge: number;
    title: string;
    description: string;
    type: "D" | "X";
    quantity: number;
    active: boolean;
    insignia: Insignia;
}

interface InsigniaFormValues {
    name: string;
    description: string;
    rarity: InsigniaRarity;
}

interface ChallengeFormValues {
    title: string;
    description: string;
    type: "D" | "X";
    quantity: number;
    id_insignia: number | "";
    active: boolean;
}

const rarityLabels: Record<InsigniaRarity, string> = {
    [InsigniaRarity.COMMON]: "Comum",
    [InsigniaRarity.RARE]: "Rara",
    [InsigniaRarity.LEGENDARY]: "Lendária",
};

const rarityIcons: Record<InsigniaRarity, React.ReactNode> = {
    [InsigniaRarity.COMMON]: <EmojiEventsIcon sx={{ fontSize: 34 }} />,
    [InsigniaRarity.RARE]: <MilitaryTechIcon sx={{ fontSize: 34 }} />,
    [InsigniaRarity.LEGENDARY]: <WorkspacePremiumIcon sx={{ fontSize: 34 }} />,
};

const rarityStyles: Record<InsigniaRarity, { background: string; shadow: string; border: string; chip: string; text: string }> = {
    [InsigniaRarity.COMMON]: {
        background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.18) 100%)",
        shadow: "0 16px 35px rgba(73,160,251,0.18)",
        border: "1px solid rgba(93,112,246,0.35)",
        chip: alpha("#49A0FB", 0.18),
        text: "#2B3A67",
    },
    [InsigniaRarity.RARE]: {
        background: "linear-gradient(135deg, rgba(122,92,255,0.22) 0%, rgba(107,70,193,0.45) 100%)",
        shadow: "0 18px 40px rgba(122,92,255,0.32)",
        border: "1px solid rgba(122,92,255,0.5)",
        chip: alpha("#7A5CFF", 0.25),
        text: "#f5f4ff",
    },
    [InsigniaRarity.LEGENDARY]: {
        background: "linear-gradient(135deg, #f7c14b 0%, #f59b42 45%, #f56565 100%)",
        shadow: "0 18px 42px rgba(245,101,101,0.45)",
        border: "1px solid rgba(244,165,96,0.9)",
        chip: alpha("#F6AD55", 0.3),
        text: "#3b2613",
    },
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
    minHeight: 48,
    borderRadius: 12,
    background: alpha(colors.white, 0.72),
    backdropFilter: "blur(12px)",
    padding: theme.spacing(0.5),
    "& .MuiTabs-indicator": {
        height: 4,
        borderRadius: 999,
        backgroundImage: colors.horizontalGradient,
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    minHeight: 44,
    textTransform: "none",
    fontWeight: 600,
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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
}));

type DeleteTarget =
    | { type: "insignia"; id: number; label: string }
    | { type: "challenge"; id: number; label: string };

const InsigniaCard: React.FC<{
    insignia: Insignia;
    onEdit: (insignia: Insignia) => void;
    onDelete: (insignia: Insignia) => void;
}> = ({ insignia, onEdit, onDelete }) => {
    const theme = rarityStyles[insignia.rarity];

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                borderRadius: 4,
                p: 3,
                height: "100%",
                background: theme.background,
                boxShadow: theme.shadow,
                border: theme.border,
                color: theme.text,
                overflow: "hidden",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: alpha(colors.white, 0.18),
                            boxShadow: `0 6px 16px ${alpha("#000", 0.18)}`,
                            color: theme.text,
                        }}
                    >
                        {rarityIcons[insignia.rarity]}
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                            {insignia.name}
                        </Typography>
                        <Chip
                            label={rarityLabels[insignia.rarity]}
                            size="small"
                            sx={{
                                mt: 1,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: 0.6,
                                backgroundColor: theme.chip,
                                color: theme.text,
                            }}
                        />
                    </Box>
                </Box>
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(insignia)} sx={{ color: theme.text }}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton onClick={() => onDelete(insignia)} sx={{ color: theme.text }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                {insignia.description}
            </Typography>
        </Paper>
    );
};

const ChallengeCard: React.FC<{
    challenge: Challenge;
    onEdit: (challenge: Challenge) => void;
    onDelete: (challenge: Challenge) => void;
}> = ({ challenge, onEdit, onDelete }) => {
    const insigniaTheme = rarityStyles[challenge.insignia?.rarity ?? InsigniaRarity.COMMON];
    const typeLabel = challenge.type === "D" ? "Diário" : "Por Pontos";

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                p: 3,
                height: "100%",
                background: "linear-gradient(135deg, rgba(93,112,246,0.08) 0%, rgba(73,160,251,0.18) 100%)",
                border: `1px solid ${alpha(colors.purple, 0.18)}`,
                boxShadow: "0 16px 40px rgba(93,112,246,0.18)",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Typography variant="subtitle2" sx={{ color: colors.strongGray, letterSpacing: 0.6, textTransform: "uppercase" }}>
                        Desafio
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {challenge.title}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(challenge)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton onClick={() => onDelete(challenge)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.5 }}>
                <Chip label={`Tipo: ${typeLabel}`} size="small" sx={{ backgroundColor: alpha(colors.purple, 0.1), fontWeight: 600 }} />
                <Chip label={`Quantidade: ${challenge.quantity}`} size="small" sx={{ backgroundColor: alpha(colors.blue, 0.12), fontWeight: 600 }} />
                <Chip
                    label={challenge.active ? "Ativo" : "Inativo"}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor: challenge.active ? alpha("#22c55e", 0.15) : alpha("#f87171", 0.15),
                        color: challenge.active ? "#15803d" : "#b91c1c",
                    }}
                />
            </Box>

            <Typography variant="body2" sx={{ color: alpha("#1f2937", 0.82), mt: 2, lineHeight: 1.6 }}>
                {challenge.description}
            </Typography>

            {challenge.insignia && (
                <Box
                    sx={{
                        mt: 3,
                        borderRadius: 3,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        background: insigniaTheme.background,
                        border: insigniaTheme.border,
                        boxShadow: insigniaTheme.shadow,
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(colors.white, 0.22),
                            color: insigniaTheme.text,
                        }}
                    >
                        {rarityIcons[challenge.insignia.rarity]}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: insigniaTheme.text }}>
                            {challenge.insignia.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: insigniaTheme.text }}>
                            {challenge.insignia.description}
                        </Typography>
                    </Box>
                    <Chip
                        label={rarityLabels[challenge.insignia.rarity]}
                        size="small"
                        sx={{
                            marginLeft: "auto",
                            fontWeight: 600,
                            backgroundColor: insigniaTheme.chip,
                            color: insigniaTheme.text,
                        }}
                    />
                </Box>
            )}
        </Paper>
    );
};

const InsigniaFormDialog: React.FC<{
    open: boolean;
    mode: "create" | "edit";
    initialData?: Insignia | null;
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: InsigniaFormValues) => void;
}> = ({ open, mode, initialData, loading, onClose, onSubmit }) => {
    const [values, setValues] = useState<InsigniaFormValues>({
        name: "",
        description: "",
        rarity: InsigniaRarity.COMMON,
    });
    const [errors, setErrors] = useState<Record<keyof InsigniaFormValues, string | undefined>>({
        name: undefined,
        description: undefined,
        rarity: undefined,
    });

    useEffect(() => {
        if (!open) return;

        setValues({
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            rarity: initialData?.rarity ?? InsigniaRarity.COMMON,
        });
        setErrors({ name: undefined, description: undefined, rarity: undefined });
    }, [open, initialData]);

    const validate = () => {
        const newErrors: Record<keyof InsigniaFormValues, string | undefined> = {
            name: undefined,
            description: undefined,
            rarity: undefined,
        };

        if (!values.name.trim()) newErrors.name = "O nome da Insígnia não pode ser vazio!";
        else if (values.name.trim().length < 3) newErrors.name = "O tamanho mínimo para o nome da Insígnia é 3!";
        else if (values.name.trim().length > 255) newErrors.name = "O tamanho máximo para o nome da Insígnia é 255!";

        if (!values.description.trim()) newErrors.description = "A descrição da Insígnia não pode ser vazio!";
        else if (values.description.trim().length < 3) newErrors.description = "O tamanho mínimo para a descrição da Insígnia é 3!";
        else if (values.description.trim().length > 255) newErrors.description = "O tamanho máximo para a descrição da Insígnia é 255!";

        if (!values.rarity) newErrors.rarity = "Selecione uma raridade";

        setErrors(newErrors);

        return !Object.values(newErrors).some(Boolean);
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({
            name: values.name.trim(),
            description: values.description.trim(),
            rarity: values.rarity,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{mode === "create" ? "Nova Insígnia" : "Editar Insígnia"}</DialogTitle>
            <DialogContent dividers>
                <SEGTextField
                    label="Nome"
                    value={values.name}
                    onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                />
                <SEGTextField
                    label="Descrição"
                    multiline
                    minRows={3}
                    value={values.description}
                    onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                />
                <SEGTextField
                    select
                    label="Raridade"
                    value={values.rarity}
                    onChange={(event) =>
                        setValues((prev) => ({ ...prev, rarity: event.target.value as InsigniaRarity }))
                    }
                    error={Boolean(errors.rarity)}
                    helperText={errors.rarity}
                >
                    {Object.values(InsigniaRarity).map((rarity) => (
                        <MenuItem key={rarity} value={rarity}>
                            {rarityLabels[rarity]}
                        </MenuItem>
                    ))}
                </SEGTextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <SEGButton colorTheme="outlined" onClick={onClose} disabled={loading}>
                    Cancelar
                </SEGButton>
                <SEGButton onClick={handleSubmit} loading={loading}>
                    {mode === "create" ? "Cadastrar" : "Salvar alterações"}
                </SEGButton>
            </DialogActions>
        </Dialog>
    );
};

const ChallengeFormDialog: React.FC<{
    open: boolean;
    mode: "create" | "edit";
    initialData?: Challenge | null;
    insignias: Insignia[];
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: ChallengeFormValues) => void;
}> = ({ open, mode, initialData, insignias, loading, onClose, onSubmit }) => {
    const [values, setValues] = useState<ChallengeFormValues>({
        title: "",
        description: "",
        type: "X",
        quantity: 1,
        id_insignia: "",
        active: true,
    });
    const [errors, setErrors] = useState<Record<keyof ChallengeFormValues, string | undefined>>({
        title: undefined,
        description: undefined,
        type: undefined,
        quantity: undefined,
        id_insignia: undefined,
        active: undefined,
    });

    useEffect(() => {
        if (!open) return;

        setValues({
            title: initialData?.title ?? "",
            description: initialData?.description ?? "",
            type: initialData?.type ?? "X",
            quantity: initialData?.quantity ?? 1,
            id_insignia: initialData?.insignia?.id_insignia ?? "",
            active: initialData?.active ?? true,
        });
        setErrors({
            title: undefined,
            description: undefined,
            type: undefined,
            quantity: undefined,
            id_insignia: undefined,
            active: undefined,
        });
    }, [open, initialData]);

    const validate = () => {
        const newErrors: Record<keyof ChallengeFormValues, string | undefined> = {
            title: undefined,
            description: undefined,
            type: undefined,
            quantity: undefined,
            id_insignia: undefined,
            active: undefined,
        };

        if (!values.title.trim()) newErrors.title = "O título do desafio não pode estar vazio!";
        else if (values.title.trim().length < 2) newErrors.title = "O tamanho mínimo do título do desafio é 2 caracteres!";
        else if (values.title.trim().length > 255) newErrors.title = "O tamanho máximo do título do desafio é 255 caracteres!";

        if (!values.description.trim()) newErrors.description = "O título do desafio não pode estar vazio!";
        else if (values.description.trim().length < 10) newErrors.description = "O tamanho mínimo da descrição do desafio é 10 caracteres!";

        if (!values.type) newErrors.type = "Informe o tipo do desafio";
        else if (!["D", "X"].includes(values.type)) newErrors.type = "O tipo do desafio deve ser \"D\" (Diário) ou \"X\" (Por Pontos)";

        if (!values.quantity) newErrors.quantity = "A quantidade não pode estar vazia!";
        else if (!Number.isInteger(values.quantity)) newErrors.quantity = "A quantidade deve ser um número inteiro!";
        else if (values.quantity < 1) newErrors.quantity = "A quantidade mínima é 1!";

        if (!values.id_insignia) newErrors.id_insignia = "Selecione uma insígnia";

        setErrors(newErrors);

        return !Object.values(newErrors).some(Boolean);
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({
            title: values.title.trim(),
            description: values.description.trim(),
            type: values.type,
            quantity: values.quantity,
            id_insignia: values.id_insignia,
            active: values.active,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{mode === "create" ? "Novo Desafio" : "Editar Desafio"}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <SEGTextField
                            label="Título"
                            value={values.title}
                            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
                            error={Boolean(errors.title)}
                            helperText={errors.title}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SEGTextField
                            select
                            label="Tipo"
                            value={values.type}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, type: event.target.value as "D" | "X" }))
                            }
                            error={Boolean(errors.type)}
                            helperText={errors.type}
                        >
                            <MenuItem value="D">Diário</MenuItem>
                            <MenuItem value="X">Por Pontos</MenuItem>
                        </SEGTextField>
                    </Grid>
                    <Grid item xs={12}>
                        <SEGTextField
                            label="Descrição"
                            multiline
                            minRows={4}
                            value={values.description}
                            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
                            error={Boolean(errors.description)}
                            helperText={errors.description}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SEGTextField
                            type="number"
                            label="Quantidade"
                            value={values.quantity}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                            }
                            error={Boolean(errors.quantity)}
                            helperText={errors.quantity}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SEGTextField
                            select
                            label="Insígnia"
                            value={values.id_insignia}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, id_insignia: Number(event.target.value) }))
                            }
                            error={Boolean(errors.id_insignia)}
                            helperText={errors.id_insignia}
                        >
                            {insignias.map((insignia) => (
                                <MenuItem key={insignia.id_insignia} value={insignia.id_insignia}>
                                    {insignia.name}
                                </MenuItem>
                            ))}
                        </SEGTextField>
                    </Grid>
                    {mode === "edit" && (
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.active}
                                        onChange={(event) =>
                                            setValues((prev) => ({ ...prev, active: event.target.checked }))
                                        }
                                    />
                                }
                                label="Desafio ativo"
                                sx={{ ml: 1 }}
                            />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <SEGButton colorTheme="outlined" onClick={onClose} disabled={loading}>
                    Cancelar
                </SEGButton>
                <SEGButton onClick={handleSubmit} loading={loading}>
                    {mode === "create" ? "Cadastrar" : "Salvar alterações"}
                </SEGButton>
            </DialogActions>
        </Dialog>
    );
};

const GamificationRegisters: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const [insignias, setInsignias] = useState<Insignia[]>([]);
    const [loadingInsignias, setLoadingInsignias] = useState<boolean>(false);

    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState<boolean>(false);

    const [insigniaDialog, setInsigniaDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        data?: Insignia | null;
    }>({ open: false, mode: "create" });
    const [challengeDialog, setChallengeDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        data?: Challenge | null;
    }>({ open: false, mode: "create" });

    const [savingInsignia, setSavingInsignia] = useState<boolean>(false);
    const [savingChallenge, setSavingChallenge] = useState<boolean>(false);

    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchInsignias = async () => {
        setLoadingInsignias(true);
        try {
            const response = await api.get("/insignia/view-all");
            const data: Insignia[] = Array.isArray(response.data) ? response.data : [];
            setInsignias(data);
        } catch (error) {
            console.error(error);
            SEGPrincipalNotificator("Não foi possível carregar as insígnias", "error", "Erro!");
        } finally {
            setLoadingInsignias(false);
        }
    };

    const fetchChallenges = async () => {
        setLoadingChallenges(true);
        try {
            const response = await api.get("/challenge/view-all");
            const data: Challenge[] = Array.isArray(response.data) ? response.data : [];
            setChallenges(data);
        } catch (error) {
            console.error(error);
            SEGPrincipalNotificator("Não foi possível carregar os desafios", "error", "Erro!");
        } finally {
            setLoadingChallenges(false);
        }
    };

    useEffect(() => {
        fetchInsignias();
        fetchChallenges();
    }, []);

    const handleOpenCreateInsignia = () => {
        setInsigniaDialog({ open: true, mode: "create" });
    };

    const handleOpenEditInsignia = (insignia: Insignia) => {
        setInsigniaDialog({ open: true, mode: "edit", data: insignia });
    };

    const handleCloseInsigniaDialog = () => {
        setInsigniaDialog((prev) => ({ ...prev, open: false }));
    };

    const handleSubmitInsignia = async (values: InsigniaFormValues) => {
        try {
            setSavingInsignia(true);
            if (insigniaDialog.mode === "create") {
                await api.post("/insignia/create", values);
                SEGPrincipalNotificator("Insígnia criada com sucesso!", "success", "Sucesso!");
            } else if (insigniaDialog.data) {
                await api.patch(`/insignia/update/${insigniaDialog.data.id_insignia}`, values);
                SEGPrincipalNotificator("Insígnia atualizada com sucesso!", "success", "Sucesso!");
            }
            await fetchInsignias();
            await fetchChallenges();
            handleCloseInsigniaDialog();
        } catch (error) {
            console.error(error);
            SEGPrincipalNotificator("Não foi possível salvar a insígnia", "error", "Erro!");
        } finally {
            setSavingInsignia(false);
        }
    };

    const handleOpenCreateChallenge = () => {
        setChallengeDialog({ open: true, mode: "create" });
    };

    const handleOpenEditChallenge = (challenge: Challenge) => {
        setChallengeDialog({ open: true, mode: "edit", data: challenge });
    };

    const handleCloseChallengeDialog = () => {
        setChallengeDialog((prev) => ({ ...prev, open: false }));
    };

    const handleSubmitChallenge = async (values: ChallengeFormValues) => {
        try {
            setSavingChallenge(true);
            if (challengeDialog.mode === "create") {
                const payload = {
                    title: values.title,
                    description: values.description,
                    type: values.type,
                    quantity: values.quantity,
                    id_insignia: values.id_insignia,
                };
                await api.post("/challenge/create", payload);
                SEGPrincipalNotificator("Desafio criado com sucesso!", "success", "Sucesso!");
            } else if (challengeDialog.data) {
                const payload = {
                    title: values.title,
                    description: values.description,
                    type: values.type,
                    quantity: values.quantity,
                    id_insignia: values.id_insignia,
                    active: values.active,
                };
                await api.patch(`/challenge/update/${challengeDialog.data.id_challenge}`, payload);
                SEGPrincipalNotificator("Desafio atualizado com sucesso!", "success", "Sucesso!");
            }
            await fetchChallenges();
            handleCloseChallengeDialog();
        } catch (error) {
            console.error(error);
            SEGPrincipalNotificator("Não foi possível salvar o desafio", "error", "Erro!");
        } finally {
            setSavingChallenge(false);
        }
    };

    const handleOpenDelete = (target: DeleteTarget) => {
        setDeleteTarget(target);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            if (deleteTarget.type === "insignia") {
                await api.delete(`/insignia/delete/${deleteTarget.id}`);
                SEGPrincipalNotificator("Insígnia removida com sucesso!", "success", "Sucesso!");
                await fetchInsignias();
                await fetchChallenges();
            } else {
                await api.delete(`/challenge/delete/${deleteTarget.id}`);
                SEGPrincipalNotificator("Desafio removido com sucesso!", "success", "Sucesso!");
                await fetchChallenges();
            }
            setDeleteTarget(null);
        } catch (error) {
            console.error(error);
            SEGPrincipalNotificator("Não foi possível remover o registro", "error", "Erro!");
        } finally {
            setDeleting(false);
        }
    };

    const renderInsigniaEmptyState = () => (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                p: 5,
                textAlign: "center",
                background: alpha(colors.purple, 0.05),
                border: `1px dashed ${alpha(colors.purple, 0.25)}`,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Nenhuma insígnia cadastrada ainda
            </Typography>
            <Typography variant="body2" sx={{ color: colors.strongGray, maxWidth: 420, mx: "auto", mb: 3 }}>
                Comece criando insígnias para gamificar sua plataforma e recompensar conquistas especiais dos alunos.
            </Typography>
            <SEGButton startIcon={<AddIcon />} onClick={handleOpenCreateInsignia}>
                Criar primeira insígnia
            </SEGButton>
        </Paper>
    );

    const renderChallengeEmptyState = () => (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                p: 5,
                textAlign: "center",
                background: alpha(colors.blue, 0.05),
                border: `1px dashed ${alpha(colors.blue, 0.25)}`,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Nenhum desafio cadastrado ainda
            </Typography>
            <Typography variant="body2" sx={{ color: colors.strongGray, maxWidth: 420, mx: "auto", mb: 3 }}>
                Crie desafios envolventes e associe insígnias para incentivar seus alunos a continuarem aprendendo.
            </Typography>
            <SEGButton startIcon={<AddIcon />} onClick={handleOpenCreateChallenge}>
                Criar primeiro desafio
            </SEGButton>
        </Paper>
    );

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, rgba(93,112,246,0.12) 0%, rgba(73,160,251,0.08) 50%, rgba(255,255,255,0.85) 100%)",
                py: { xs: 4, md: 8 },
                px: { xs: 2, md: 6 },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 1200,
                    mx: "auto",
                    borderRadius: 6,
                    p: { xs: 3, md: 6 },
                    background: alpha(colors.white, 0.92),
                    boxShadow: "0 28px 80px rgba(93,112,246,0.22)",
                    border: `1px solid ${alpha(colors.purple, 0.12)}`,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: "radial-gradient(circle at top right, rgba(93,112,246,0.18), transparent 45%)",
                    }}
                />
                <Box sx={{ position: "relative" }}>
                    <SectionHeader>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.6 }}>
                            Registros de Gamificação
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.strongGray, maxWidth: 640 }}>
                            Gerencie insígnias e desafios com um visual moderno e gamificado. Crie, edite e organize recompensas
                            para motivar os estudantes em suas jornadas de aprendizado.
                        </Typography>
                    </SectionHeader>

                    <StyledTabs value={tabIndex} onChange={(_, value) => setTabIndex(value)}>
                        <StyledTab label="Insígnias" />
                        <StyledTab label="Desafios" />
                    </StyledTabs>

                    <Divider sx={{ my: 4 }} />

                    {tabIndex === 0 && (
                        <Box>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                                <SEGButton startIcon={<AddIcon />} onClick={handleOpenCreateInsignia}>
                                    Nova Insígnia
                                </SEGButton>
                            </Box>
                            {loadingInsignias ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : insignias.length === 0 ? (
                                renderInsigniaEmptyState()
                            ) : (
                                <Grid container spacing={3}>
                                    {insignias.map((insignia) => (
                                        <Grid item xs={12} md={6} lg={4} key={insignia.id_insignia}>
                                            <InsigniaCard
                                                insignia={insignia}
                                                onEdit={handleOpenEditInsignia}
                                                onDelete={(current) =>
                                                    handleOpenDelete({
                                                        type: "insignia",
                                                        id: current.id_insignia,
                                                        label: current.name,
                                                    })
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {tabIndex === 1 && (
                        <Box>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                                <SEGButton
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenCreateChallenge}
                                    disabled={insignias.length === 0}
                                    colorTheme={insignias.length === 0 ? "outlined" : "gradient"}
                                >
                                    Novo Desafio
                                </SEGButton>
                            </Box>
                            {insignias.length === 0 && !loadingInsignias && (
                                <Typography variant="body2" sx={{ color: colors.strongGray, mb: 3 }}>
                                    Cadastre pelo menos uma insígnia para poder associá-la aos desafios.
                                </Typography>
                            )}
                            {loadingChallenges ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : challenges.length === 0 ? (
                                renderChallengeEmptyState()
                            ) : (
                                <Grid container spacing={3}>
                                    {challenges.map((challenge) => (
                                        <Grid item xs={12} md={6} key={challenge.id_challenge}>
                                            <ChallengeCard
                                                challenge={challenge}
                                                onEdit={handleOpenEditChallenge}
                                                onDelete={(current) =>
                                                    handleOpenDelete({
                                                        type: "challenge",
                                                        id: current.id_challenge,
                                                        label: current.title,
                                                    })
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            <InsigniaFormDialog
                open={insigniaDialog.open}
                mode={insigniaDialog.mode}
                initialData={insigniaDialog.data}
                loading={savingInsignia}
                onClose={handleCloseInsigniaDialog}
                onSubmit={handleSubmitInsignia}
            />

            <ChallengeFormDialog
                open={challengeDialog.open}
                mode={challengeDialog.mode}
                initialData={challengeDialog.data}
                insignias={insignias}
                loading={savingChallenge}
                onClose={handleCloseChallengeDialog}
                onSubmit={handleSubmitChallenge}
            />

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir {deleteTarget?.type === "insignia" ? "a insígnia" : "o desafio"} "
                        {deleteTarget?.label}"? Esta ação não poderá ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <SEGButton colorTheme="outlined" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                        Cancelar
                    </SEGButton>
                    <SEGButton colorTheme="purple" onClick={handleConfirmDelete} loading={deleting}>
                        Excluir
                    </SEGButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GamificationRegisters;
