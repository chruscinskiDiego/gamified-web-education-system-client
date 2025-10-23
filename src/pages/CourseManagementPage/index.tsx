import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Paper,
    Grid,
    MenuItem,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Switch,
    FormControlLabel,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SEGTextField from "../../components/SEGTextField";
import SEGButton from "../../components/SEGButton";
import { colors } from "../../theme/colors";
import { useNavigate, useParams } from "react-router-dom";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";
import { type Category, type Course, type CourseModule } from "../../interfaces/course.interfaces";
import { api } from "../../lib/axios";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";


const difficulties = [
    { value: "E", name: "Fácil" },
    { value: "M", name: "Médio" },
    { value: "H", name: "Difícil" },
];

const CourseManagementPage: React.FC = () => {

    // #region states
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [active, setActive] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [creatingModule, setCreatingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [newModuleDescription, setNewModuleDescription] = useState("");
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);

    const [loadingModuleCreation, setLoadingModuleCreation] = useState<boolean>(false);
    const [loadingCourseSave, setLoadingCourseSave] = useState<boolean>(false);
    const [loadingModuleDelete, setLoadingModuleDelete] = useState<boolean>(false);


    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<"save-course" | "delete-course" | "delete-module">();


    const getCategories = async () => {

        setLoadingCategories(true);

        try {

            const response = await api.get("/category/view-all");

            setCategories(response?.data || []);

        } catch (error) {

            console.error(error);

        }
        finally {

            setLoadingCategories(false);

        }

    };

    const getCourse = async () => {

        setLoadingCourse(true);

        try {

            const response = await api.get(`/course/management-view/${id}`);

            const data = response?.data;
            // API might return an array or an object — suporte ambos
            if (Array.isArray(data)) setCourse(data[0] ?? null);
            else setCourse(data ?? null);

        }
        catch (error) {
            console.error(error);
        }
        finally {

            setLoadingCourse(false);
        }

    }

    useEffect(() => {

        if (categories.length === 0) getCategories();

        if (id && course === null) getCourse();
    }, [id]);

    useEffect(() => {
        if (!course) return;
        setTitle(course.title ?? "");
        setDescription(course.description ?? "");
        setDifficulty(course.difficulty_level ?? "");
        setCategoryId(course.id_category ?? "");
        setActive(Boolean(course.active));
        setPreviewUrl(course.link_thumbnail ?? null);
        setImageFile(null);
    }, [course]);

    useEffect(() => {
        if (!imageFile) return;
        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
    };
    const pickImage = () => fileRef.current?.click();
    const clearImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    if (loadingCourse || loadingCategories) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1300,
                    backgroundColor: "transparent",
                }}
            >
                <SEGPrincipalLoader />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ minHeight: "100vh", px: { xs: 3, md: 6 }, py: 6 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6">Nenhum curso disponível</Typography>
                    <Box sx={{ mt: 3 }}>
                        <SEGButton startIcon={<ArrowBackIcon />} onClick={() => navigate("/my-courses")}>
                            Voltar
                        </SEGButton>
                    </Box>
                </Paper>
            </Box>
        );
    }

    const handleSaveCourse = async () => {


        if (!title.trim() || !description.trim() || !difficulty || categoryId === "") {
            SEGPrincipalNotificator("Preencha título, descrição, dificuldade e categoria", "warning", "Atenção!");
            return;
        }


        const courseDTO: Course = {
            title: title.trim(),
            description: description.trim(),
            difficulty_level: difficulty,
            id_category: typeof categoryId === "number" ? categoryId : null,
            active,
        };

        setLoadingCourseSave(true);

        try {

            const response = await api.patch(`/course/update/${id}`, courseDTO);

            if (response.status === 200) {

                setCourse((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        title: title.trim(),
                        description: description.trim(),
                        difficulty_level: difficulty,
                        id_category: typeof categoryId === "number" ? categoryId : null,
                        active,
                        link_thumbnail: previewUrl ?? prev.link_thumbnail,
                    } as Course;
                });

                SEGPrincipalNotificator("Curso atualizado", "success", "Sucesso!");

            }

        } catch (error) {

            SEGPrincipalNotificator("Erro na atualização", "error", "Erro!");

            console.error(error);

        } finally {

            setLoadingCourseSave(false);

            handleCloseDialog();

        }

    };

    const handleAddModule = async () => {

        if (!newModuleTitle.trim() || !newModuleDescription) {
            SEGPrincipalNotificator("Título e Descrição do módulo são obrigatórios", "warning", "Atenção!");
            return;
        }

        const modules = course.course_modules ?? [];
        const maxOrder = modules.length ? Math.max(...modules.map((m) => m.order)) : 0;;

        const moduleDto: CourseModule = {
            order: maxOrder + 1,
            title: newModuleTitle.trim(),
            description: newModuleDescription.trim(),
            id_course: course.id_course
        };

        setLoadingModuleCreation(true);

        try {

            const response = await api.post("/course-module/create", moduleDto);

            const moduleId = response?.data?.created_module_id || 0;

            moduleDto.id_module = moduleId;

            setCourse((prev) => {
                if (!prev) return prev;
                return { ...prev, course_modules: [...(prev.course_modules ?? []), moduleDto] } as Course;
            });

            setNewModuleTitle("");
            setNewModuleDescription("");
            setCreatingModule(false);

            SEGPrincipalNotificator("Módulo criado", "success", "Sucesso!");

        } catch (error) {

            console.error(error);

            SEGPrincipalNotificator("Falha ao criar módulo", "error", "Erro!")

        } finally {

            setLoadingModuleCreation(false);

        }


    };

    const handleDeleteModule = async (moduleId: number) => {

        setLoadingModuleDelete(true);

        try {

            const response = await api.delete(`/course-module/delete/${moduleToDelete}`);

            if (response.status === 200) {

                setCourse((prev) => {
                    if (!prev) return prev;
                    return { ...prev, course_modules: (prev.course_modules ?? []).filter((m) => m.id_module !== moduleId) } as Course;
                });

                SEGPrincipalNotificator("Módulo removido", "success", "Sucesso!");

            }

        } catch (error) {

            SEGPrincipalNotificator("Falha ao remover módulo", "error", "Erro!");

            console.error(error);

        } finally {

            setLoadingModuleDelete(false);

            setModuleToDelete(null);

            handleCloseDialog();

        }

    };

    const handleEditModule = (moduleId?: number) => {
        if (!course || moduleId == null) return;
        navigate(`/course-management/${course.id_course}/module/${moduleId}`);
    };

    const handleCloseDialog = () => {

        setConfirmDialogOpen(false);

    };

    const handleSaveCourseDialog = () => {
        setModalType("save-course");
        setConfirmDialogOpen(true);
    };

    /*const handleDeleteCourseDialog = () => {
        setModalType("delete-course");
        setConfirmDialogOpen(true);
    };*/

    const handleDeleteModuleDialog = (moduleId: number) => {

        setModalType("delete-module");

        setModuleToDelete(moduleId);

        setConfirmDialogOpen(true);
    };

    return (

        <>

            <Dialog open={confirmDialogOpen} onClose={handleCloseDialog}>
                {
                    modalType === 'save-course' && (
                        <>
                            <DialogTitle>Confirmação</DialogTitle>

                            <DialogContent>

                                <DialogContentText>
                                    Tem certeza que deseja SALVAR as alterações do CURSO?
                                </DialogContentText>

                                <DialogActions>
                                    <SEGButton
                                        colorTheme="outlined"
                                        onClick={handleCloseDialog}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            height: "55px"
                                        }}>
                                        CANCELAR
                                    </SEGButton>

                                    <SEGButton
                                        colorTheme="gradient"
                                        onClick={handleSaveCourse}
                                        loading={loadingCourseSave}
                                        startIcon={<SaveIcon />}>
                                        SALVAR
                                    </SEGButton>
                                </DialogActions>
                            </DialogContent>
                        </>
                    )
                }

                {
                    modalType === 'delete-course' && (
                        <>
                            <DialogTitle>Confirmação</DialogTitle>

                            <DialogContent>

                                <DialogContentText>
                                    Tem certeza que deseja EXCLUIR o CURSO?
                                </DialogContentText>

                                <DialogActions>

                                    <SEGButton
                                        colorTheme="outlined"
                                        onClick={handleCloseDialog}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            height: "55px"
                                        }}>
                                        CANCELAR
                                    </SEGButton>

                                    <SEGButton
                                        colorTheme="gradient"
                                        onClick={handleSaveCourse}
                                        startIcon={<DeleteIcon />}>
                                        EXCLUIR
                                    </SEGButton>

                                </DialogActions>
                            </DialogContent>
                        </>
                    )
                }

                {
                    modalType === 'delete-module' && (
                        <>
                            <DialogTitle>Confirmação</DialogTitle>

                            <DialogContent>

                                <DialogContentText>
                                    Tem certeza que deseja <strong>EXCLUIR</strong> o <strong>MÓDULO</strong>?
                                </DialogContentText>

                                <DialogActions>
                                    <SEGButton
                                        colorTheme="outlined"
                                        onClick={handleCloseDialog}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            height: "55px"
                                        }}>
                                        CANCELAR
                                    </SEGButton>

                                    <SEGButton
                                        colorTheme="gradient"
                                        onClick={() => handleDeleteModule(moduleToDelete || 0)}
                                        loading={loadingModuleDelete}
                                        startIcon={<DeleteIcon />}>
                                        EXCLUIR
                                    </SEGButton>
                                </DialogActions>
                            </DialogContent>
                        </>
                    )
                }
            </Dialog>
            <Box component="section" sx={{ minHeight: "100vh", bgcolor: "#ffffff", px: { xs: 3, md: 6 }, pb: { xs: 4, md: 6 } }}>
                <Typography variant="h4" align="center" sx={{ color: colors.purple, fontWeight: 700, mb: { xs: 2, md: 3 }, fontSize: { xs: 22, md: 34 } }}>
                    Gerenciar Curso
                </Typography>

                <Paper elevation={0} sx={{ bgcolor: "#fbfbfb", borderRadius: 2, p: { xs: 2, md: 4 }, border: "1px solid #f0f0f0", mx: "auto", maxWidth: "1400px" }}>
                    {/* Formulário do curso — mesma aparência da página de criação */}
                    <Box component="form" noValidate sx={{ mb: 3 }} onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }}>
                        <Grid container spacing={3} sx={{ mb: { xs: 2, md: 2 } }}>
                            <Grid item xs={12} md={7}>
                                <SEGTextField
                                    placeholder="Informe o título do curso"
                                    label="Título"
                                    fullWidth
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    sx={{
                                        mb: 0,
                                        minWidth: 0,
                                        "& .MuiFilledInput-root": { minHeight: 56, display: "flex", alignItems: "center" },
                                    }}
                                    InputProps={{ disableUnderline: true }}
                                />
                            </Grid>

                            <Grid item xs={6} md={2}>
                                <SEGTextField
                                    label="Nível de Dificuldade"
                                    fullWidth
                                    select
                                    value={difficulty}
                                    onChange={(e: any) => setDifficulty(String(e.target.value))}
                                    sx={{ mb: 0, "& .MuiFilledInput-root": { minHeight: 56, display: "flex", alignItems: "center" } }}
                                    InputProps={{ disableUnderline: true }}
                                >
                                    <MenuItem value="">
                                        <em>Selecione</em>
                                    </MenuItem>
                                    {difficulties.map((d) => (
                                        <MenuItem key={d.value} value={d.value}>
                                            {d.name}
                                        </MenuItem>
                                    ))}
                                </SEGTextField>
                            </Grid>

                            <Grid item xs={6} md={2}>
                                <SEGTextField label="Categoria" fullWidth select value={categoryId} onChange={(e: any) => setCategoryId(Number(e.target.value))} sx={{ mb: 0, "& .MuiFilledInput-root": { minHeight: 56, display: "flex", alignItems: "center" } }} InputProps={{ disableUnderline: true }}>
                                    <MenuItem value="">
                                        <em>Selecione</em>
                                    </MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id_category} value={cat.id_category}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </SEGTextField>
                            </Grid>

                            <Grid item xs={6} md={1} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                <FormControlLabel
                                    control={(
                                        <Switch
                                            checked={active}
                                            onChange={(event) => setActive(event.target.checked)}
                                            color="primary"
                                        />
                                    )}
                                    label={"Ativo"}
                                    labelPlacement="start"
                                    sx={{
                                        ml: 0,
                                        flexShrink: 0,
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: { md: "transparent", xs: "#f4efef" },
                                        width: "100%",
                                        height: 56,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        columnGap: 1,
                                        "& .MuiFormControlLabel-label": {
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Descrição à esquerda (md=8) */}
                            <Grid item xs={12} md={8}>
                                <SEGTextField
                                    label="Descrição"
                                    fullWidth
                                    multiline
                                    minRows={8}
                                    placeholder="Escreva a descrição do curso..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    InputProps={{ disableUnderline: true }}
                                    sx={{ height: "100%", "& .MuiFilledInput-root": { backgroundColor: "#f4efef", borderRadius: 2, p: 2, height: "100%", display: "flex", alignItems: "flex-start" }, mb: 0 }}
                                />
                            </Grid>

                            {/* Coluna direita: imagem + botões de ação + metadados */}
                            <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: colors.strongGray ?? "#7d7d7d", fontWeight: 600, mb: 1 }}>Imagem</Typography>
                                    <Box sx={{ borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {previewUrl ? (
                                            <Box sx={{ width: "100%", bgcolor: "#fff", borderRadius: 2, border: "1px solid #f0f0f0", p: 1, display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center" }}>
                                                <Box component="img" src={previewUrl} alt="preview" sx={{ maxWidth: "100%", maxHeight: { xs: 200, md: 300 }, objectFit: "contain", borderRadius: 1, background: "#fff" }} />
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <SEGButton colorTheme="outlined" startIcon={<PhotoCamera />} onClick={() => fileRef.current?.click()} sx={{ minWidth: 120 }}>
                                                        Trocar
                                                    </SEGButton>
                                                    <SEGButton colorTheme="outlined" onClick={clearImage} sx={{ minWidth: 120 }}>
                                                        Remover
                                                    </SEGButton>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: "100%", minHeight: "200px", bgcolor: "#f4efef", borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, p: 2 }}>
                                                <Typography variant="body2" sx={{ color: colors.strongGray }}>
                                                    Nenhuma imagem selecionada
                                                </Typography>
                                                <SEGButton colorTheme="purple" startIcon={<PhotoCamera />} onClick={pickImage} sx={{ textTransform: "uppercase", borderRadius: 3, px: 3, boxShadow: "none", width: { xs: "140px", md: "180px" } }}>
                                                    Selecionar
                                                </SEGButton>
                                                <Typography variant="caption" sx={{ color: colors.strongGray }}>
                                                    PNG, JPG — até 5MB
                                                </Typography>
                                            </Box>
                                        )}

                                        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
                                    </Box>
                                    <Box sx={{ mt: 1, textAlign: "right" }}>
                                        <Typography variant="caption" sx={{ color: colors.strongGray }}>
                                            Criado em: {new Date(course?.created_at || new Date().toLocaleString()).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
                                    <SEGButton colorTheme="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/my-courses")} sx={{ width: { xs: 140, md: 200 } }}>
                                        Meus Cursos
                                    </SEGButton>

                                    <SEGButton type="button" startIcon={<SaveIcon />} colorTheme="gradient" onClick={handleSaveCourseDialog} sx={{ width: { xs: 120, md: 140 } }}>
                                        Salvar
                                    </SEGButton>
                                </Box>


                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Seção de módulos abaixo das opções do curso */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Módulos
                        </Typography>

                        <List sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #f0f0f0" }}>
                            {(course.course_modules ?? [])
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((module) => (
                                    <React.Fragment key={module.id_module}>
                                        <ListItem>
                                            <ListItemText primary={`${module.order}. ${module.title}`} secondary={module.description} />

                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <SEGButton colorTheme="outlined" onClick={() => handleEditModule(module?.id_module)}>
                                                    <EditIcon />
                                                </SEGButton>
                                                <SEGButton colorTheme="outlined" onClick={() => handleDeleteModuleDialog(module?.id_module || 0)}>
                                                    <DeleteIcon />
                                                </SEGButton>
                                            </Box>
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                        </List>

                        <Box sx={{ mt: 2 }}>
                            <SEGButton startIcon={<AddIcon />} colorTheme="gradient" onClick={() => setCreatingModule((s) => !s)}>
                                {creatingModule ? "Cancelar" : "Criar Módulo"}
                            </SEGButton>

                            {creatingModule && (
                                <Box component="form" sx={{ mt: 2, bgcolor: "#fff", p: 2, borderRadius: 2, border: "1px solid #f0f0f0" }} onSubmit={(e) => { e.preventDefault(); handleAddModule(); }}>
                                    <SEGTextField label="Título do Módulo" fullWidth value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} sx={{ mb: 1 }} InputProps={{ disableUnderline: true }} />
                                    <SEGTextField label="Descrição" fullWidth multiline minRows={3} value={newModuleDescription} onChange={(e) => setNewModuleDescription(e.target.value)} sx={{ mb: 1 }} InputProps={{ disableUnderline: true }} />

                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                        <SEGButton
                                            colorTheme="outlined"
                                            onClick={() => setCreatingModule(false)} >
                                            Cancelar
                                        </SEGButton>

                                        <SEGButton
                                            type="submit"
                                            colorTheme="gradient"
                                            loading={loadingModuleCreation}
                                            startIcon={<AddIcon />}>
                                            Adicionar
                                        </SEGButton>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default CourseManagementPage;
