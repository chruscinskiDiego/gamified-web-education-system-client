import { useCallback, useEffect, useMemo, useState } from "react";
import {
    alpha,
    Box,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SearchIcon from "@mui/icons-material/Search";

import { api } from "../../lib/axios";
import SEGButton from "../../components/SEGButton";
import SEGTextField from "../../components/SEGTextField";
import SEGPagination from "../../components/SEGPagination";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import { colors } from "../../theme/colors";
import { type Category } from "../../interfaces/course.interfaces";

type DialogMode = "create" | "edit" | null;

const PAGE_SIZE = 8;
const GRID_MAX_WIDTH = 1120;

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [formName, setFormName] = useState<string>("");
    const [savingCategory, setSavingCategory] = useState<boolean>(false);

    const [togglingCategory, setTogglingCategory] = useState<boolean>(false);

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<Category[]>("/category/view-all");
            setCategories(response?.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Não foi possível carregar as categorias agora.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filteredCategories = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return categories;

        return categories.filter((category) => category.name.toLowerCase().includes(term));
    }, [categories, searchTerm]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE) || 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [filteredCategories, page]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const paginatedCategories = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredCategories.slice(start, start + PAGE_SIZE);
    }, [filteredCategories, page]);

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE) || 1);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, category: Category) => {
        setMenuAnchor(event.currentTarget);
        setSelectedCategory(category);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleOpenCreateDialog = () => {
        setDialogMode("create");
        setFormName("");
        setSelectedCategory(null);
    };

    const handleOpenEditDialog = () => {
        if (!selectedCategory) return;
        setDialogMode("edit");
        setFormName(selectedCategory.name);
        handleCloseMenu();
    };

    const handleDialogClose = () => {
        setDialogMode(null);
        setFormName("");
    };


    const handleSubmitCategory = async () => {

        const trimmedName = formName.trim();

        if (!trimmedName) {
            SEGPrincipalNotificator("Informe um nome para a categoria.", "warning", "Nome obrigatório");
            return;
        }

        setSavingCategory(true);

        try {
            if (dialogMode === "create") {

                const response = await api.post("/category/create", { name: trimmedName });

                if (response.status === 201) {

                    SEGPrincipalNotificator("Categoria criada com sucesso!", "success", "Sucesso");

                    setCategories(prev => [
                        ...prev,
                        {
                            id_category: response.data.created_category_id,
                            name: trimmedName,
                            active: true,
                        }
                    ])

                }

            } else if (dialogMode === "edit" && selectedCategory?.id_category) {

                const response = await api.patch(`/category/update/${selectedCategory.id_category}`, {
                    name: trimmedName,
                });

                if (response.status === 200) {

                    setCategories(prev =>
                        prev.map(cat => (cat.id_category === selectedCategory?.id_category ? { ...cat, name: trimmedName, active: selectedCategory.active } : cat))
                    )
                }

                SEGPrincipalNotificator("Categoria atualizada com sucesso!", "success", "Sucesso");
            }

            //await loadCategories();
            setPage(1);
            handleDialogClose();
        } catch (err) {
            console.error(err);
            SEGPrincipalNotificator("Não foi possível salvar a categoria.", "error", "Erro");
        } finally {
            setSavingCategory(false);
        }
    };

    const handleToggleCategory = async () => {

        if (!selectedCategory?.id_category) return;

        setTogglingCategory(true);

        try {

            const response = await api.patch(`/category/update/${selectedCategory.id_category}`, {
                active: !selectedCategory.active,
            });

            if (response.status === 200) {

                setCategories(prev =>
                    prev.map(cat =>
                        cat.id_category === selectedCategory.id_category
                            ? { ...cat, active: !selectedCategory.active }
                            : cat
                    )
                )
            }
            SEGPrincipalNotificator(
                selectedCategory.active ? "Categoria desativada." : "Categoria ativada.",
                "success",
                "Atualizado",
            );
        } catch (err) {
            console.error(err);
            SEGPrincipalNotificator("Não foi possível alterar o status da categoria.", "error", "Erro");
        } finally {
            setTogglingCategory(false);
            handleCloseMenu();
        }
    };


    const renderContent = () => {
        if (loading) {
            return (
                <Box
                    sx={{
                        py: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                    }}
                >
                    <SEGPrincipalLoader />
                    <Typography sx={{ color: alpha("#000", 0.6), fontWeight: 500 }}>
                        Carregando categorias...
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Box
                    sx={{
                        py: 8,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6" sx={{ color: colors.purple, mb: 1 }}>
                        Ops!
                    </Typography>
                    <Typography sx={{ color: alpha("#000", 0.6) }}>{error}</Typography>
                    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                        <SEGButton colorTheme="gradient" fullWidth={false} onClick={() => void loadCategories()}>
                            Tentar novamente
                        </SEGButton>
                    </Box>
                </Box>
            );
        }

        if (categories.length === 0) {
            return (
                <Box
                    sx={{
                        py: 8,
                        textAlign: "center",
                        color: alpha("#000", 0.6),
                    }}
                >
                    <Typography variant="h6" sx={{ color: colors.purple, fontWeight: 700, mb: 1 }}>
                        Nenhuma categoria cadastrada ainda
                    </Typography>
                    <Typography>
                        Comece adicionando a primeira categoria para organizar os conteúdos da plataforma.
                    </Typography>
                </Box>
            );
        }

        if (filteredCategories.length === 0) {
            return (
                <Box
                    sx={{
                        py: 8,
                        textAlign: "center",
                        color: alpha("#000", 0.6),
                    }}
                >
                    <Typography variant="h6" sx={{ color: colors.purple, fontWeight: 700, mb: 1 }}>
                        Nenhuma categoria encontrada
                    </Typography>
                    <Typography>
                        {searchTerm
                            ? `Não encontramos resultados para "${searchTerm}".`
                            : "Tente ajustar os filtros ou adicionar uma nova categoria."}
                    </Typography>
                </Box>
            );
        }

        return (
            <>
                <Box
                    sx={{
                        width: "100%",
                        display: "grid",
                        gap: { xs: 3, md: 4 },
                        gridTemplateColumns: {
                            xs: "repeat(1, minmax(0, 1fr))",
                            sm: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(3, minmax(0, 1fr))",
                            lg: "repeat(4, minmax(0, 1fr))",
                        },
                        justifyContent: "center",
                        justifyItems: "center",
                    }}
                >
                    {paginatedCategories.map((category) => (
                        <Paper
                            key={category.id_category ?? category.name}
                            elevation={0}
                            sx={{
                                width: "100%",
                                maxWidth: { xs: "100%", sm: 320, lg: 280 },
                                height: "100%",
                                borderRadius: 4,
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: 2,
                                background: "linear-gradient(135deg, rgba(93,112,246,0.08) 0%, rgba(73,160,251,0.12) 100%)",
                                boxShadow: "0 18px 40px rgba(71, 103, 214, 0.18)",
                                border: `1px solid ${alpha(colors.purple, 0.18)}`,
                            }}
                        >
                            <Stack spacing={2}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="subtitle2" sx={{ color: alpha("#000", 0.5) }}>
                                            #{category.id_category}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: colors.purple,
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={category.active ? "Ativa" : "Inativa"}
                                            sx={{
                                                mt: 1,
                                                alignSelf: "flex-start",
                                                fontWeight: 600,
                                                color: category.active ? colors.purple : "#fff",
                                                backgroundColor: category.active
                                                    ? alpha(colors.purple, 0.18)
                                                    : alpha("#000", 0.38),
                                            }}
                                        />
                                    </Stack>

                                    <IconButton
                                        aria-label="ações"
                                        size="small"
                                        onClick={(event) => handleOpenMenu(event, category)}
                                        sx={{
                                            backgroundColor: alpha("#fff", 0.55),
                                            boxShadow: "0 8px 20px rgba(33, 33, 52, 0.18)",
                                            "&:hover": {
                                                backgroundColor: alpha("#fff", 0.85),
                                            },
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                <Typography sx={{ color: alpha("#000", 0.65), fontSize: 14 }}>
                                    Utilize as categorias para agrupar cursos e facilitar a navegação dos alunos pela plataforma.
                                </Typography>
                            </Stack>
                        </Paper>
                    ))}
                </Box>

                {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <SEGPagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
                    </Box>
                )}
            </>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                minHeight: "100vh",
                py: { xs: 6, md: 8 },
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={{ xs: 4, md: 6 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                    >
                        <Stack spacing={1}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: 0.6,
                                    color: colors.purple,
                                }}
                            >
                                Categorias
                            </Typography>
                            <Typography sx={{ color: alpha("#000", 0.6), maxWidth: 520 }}>
                                Administre as categorias utilizadas para organizar os cursos e deixe a experiência dos alunos mais intuitiva.
                            </Typography>
                        </Stack>

                        <SEGButton
                            startIcon={<AddIcon />}
                            colorTheme="gradient"
                            onClick={handleOpenCreateDialog}
                            fullWidth={false}
                            sx={{
                                alignSelf: { xs: "stretch", md: "flex-start" },
                                mb: 0,
                                whiteSpace: "nowrap",
                                height: 56,
                                minHeight: 56,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            Nova categoria
                        </SEGButton>
                    </Stack>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            p: { xs: 3, md: 4 },
                            backgroundColor: "#fff",
                            boxShadow: "0 24px 60px rgba(33, 33, 52, 0.14)",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: GRID_MAX_WIDTH,
                                mx: "auto",
                            }}
                        >
                            <Stack spacing={{ xs: 3, md: 4 }}>
                                <SEGTextField
                                    placeholder="Buscar categoria"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    startIcon={<SearchIcon sx={{ color: alpha("#000", 0.5), mb: 2 }} />}
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiFilledInput-root": {
                                            backgroundColor: "#fff",
                                            boxShadow: "0 12px 30px rgba(33, 33, 52, 0.12)",
                                        },
                                    }}
                                />

                                {renderContent()}
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Container>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 16px 40px rgba(33, 33, 52, 0.18)",
                        "& .MuiMenuItem-root": {
                            gap: 1.5,
                            fontWeight: 500,
                            color: alpha("#000", 0.7),
                        },
                    },
                }}
            >
                <MenuItem onClick={handleOpenEditDialog}>
                    <EditOutlinedIcon fontSize="small" /> Editar
                </MenuItem>
                <MenuItem onClick={handleToggleCategory} disabled={togglingCategory}>
                    <PowerSettingsNewIcon fontSize="small" />
                    {selectedCategory?.active ? "Desativar" : "Ativar"}
                </MenuItem>
            </Menu>

            <Dialog
                open={dialogMode !== null}
                onClose={savingCategory ? undefined : handleDialogClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: { xs: 1, md: 1.5 },
                        background: alpha("#fff", 0.96),
                        boxShadow: "0 24px 64px rgba(33, 33, 52, 0.18)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        color: colors.purple,
                    }}
                >
                    {dialogMode === "create" ? "Nova categoria" : "Editar categoria"}
                </DialogTitle>
                <DialogContent>
                    <SEGTextField
                        label="Nome da categoria"
                        placeholder="Ex.: Matemática"
                        value={formName}
                        onChange={(event) => setFormName(event.target.value)}
                        disabled={savingCategory}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 2, flexWrap: "wrap" }}>
                    <SEGButton
                        variant="outlined"
                        colorTheme="outlined"
                        onClick={handleDialogClose}
                        fullWidth={false}
                        disabled={savingCategory}
                    >
                        Cancelar
                    </SEGButton>
                    <SEGButton
                        onClick={handleSubmitCategory}
                        loading={savingCategory}
                        fullWidth={false}
                    >
                        Salvar
                    </SEGButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoriesPage;
