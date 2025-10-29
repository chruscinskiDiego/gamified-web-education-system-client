import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  MenuItem,
  Typography,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import SEGTextField from "../../components/SEGTextField";
import { colors } from "../../theme/colors";
import SEGButton from "../../components/SEGButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import type { Category } from "../../interfaces/course.interfaces";
import SEGPrincipalLoader from "../../components/Loaders/SEGPrincipalLoader";
import SEGPrincipalNotificator from "../../components/Notifications/SEGPrincipalNotificator";



const NewCoursePage: React.FC = () => {

  // #region states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loadingCourseCreation, setLoadingCourseCreation] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const difficulties = [
    {
      value: 'E',
      name: 'Fácil'
    },
    {
      value: 'M',
      name: 'Médio'
    },
    {
      value: 'H',
      name: 'Difícil'
    }
  ];

  // #region fetchs

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

  }

  useEffect(() => {

    if (categories.length > 0) return;

    getCategories();

  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {

    if (e) e.preventDefault();

    const { isValid, missingFields } = validateFields();

    if (!isValid) {

      const formattedFields = missingFields.join(", ");
      const message = missingFields.length > 1
        ? `Preencha os campos: ${formattedFields}.`
        : `Preencha o campo: ${formattedFields}.`;

      SEGPrincipalNotificator(message, "warning", "Campos obrigatórios");

      return;

    }

    const payloadDTO = {
      title,
      description,
      difficulty_level: difficulty,
      id_category: Number(category)
    };

    try {

      setLoadingCourseCreation(true);

      const response = await api.post("/course/create", payloadDTO);

      if (response?.status === 201) {
        const createdCourseId = response?.data?.created_course_id;

        const uploadImageResponse = await handleUploadImage(createdCourseId);

        if (uploadImageResponse) {

          SEGPrincipalNotificator("Curso cadastrado com sucesso!", "success", "Sucesso");

          handleNavigateTo(`/course-management/${createdCourseId}`);

        }
        else{
          SEGPrincipalNotificator("Falha ao enviar imagem!", "warning", "Sucesso parcial");
        }
        
      }


    } catch (error) {

      alert(error);

      console.error(error);

    } finally {

      setLoadingCourseCreation(false);

    }
  };


  const handleUploadImage = async (courseId: string): Promise<boolean> => {
    if (!imageFile) return false;
    const form = new FormData();
    form.append("file", imageFile);

    try {
      await api.post(`/course/set-thumbnail/${courseId}`, form, {
        headers: { "Content-Type": undefined },
      });
      return true;
    } catch (err) {
      console.error("Upload falhou:", err);
      return false;
    }
  };



  // #region utils
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
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



  const handleNavigateTo = (route: string) => {
    navigate(route);
  };

  const validateFields = (): { isValid: boolean; missingFields: string[] } => {

    const missingFields: string[] = [];

    if (!title.trim()) missingFields.push("Título");
    if (!description.trim()) missingFields.push("Descrição");
    if (!difficulty.trim()) missingFields.push("Dificuldade");
    if (!category.trim()) missingFields.push("Categoria");

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };

  };

  if (loadingCategories) {
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

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        px: { xs: 3, md: 6 },
        pb: { xs: 4, md: 6 },
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          color: colors.purple,
          fontWeight: 700,
          mb: { xs: 2, md: 3 },
          fontSize: { xs: 22, md: 34 },
        }}
      >
        Novo Curso
      </Typography>

      <Paper
        elevation={0}
        sx={{
          bgcolor: "#fbfbfb",
          borderRadius: 2,
          p: { xs: 2, md: 4 },
          border: "1px solid #f0f0f0",
          mx: "auto",
          width: "100%",
          maxWidth: "1400px",
          boxSizing: "border-box",
          minHeight: { xs: "auto", md: 560 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >

          <Grid container spacing={3} sx={{ mb: { xs: 2, md: 2 } }}>
            <Grid item xs={12} md={8}>
              <SEGTextField
                placeholder="Informe o título do curso"
                label="Título"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{
                  mb: 0,
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
                sx={{
                  mb: 0,
                  "& .MuiFilledInput-root": { minHeight: 56, display: "flex", alignItems: "center" },
                }}
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
              <SEGTextField
                label="Categoria"
                fullWidth
                select
                value={category}
                onChange={(e: any) => setCategory(String(e.target.value))}
                sx={{
                  mb: 0,
                  "& .MuiFilledInput-root": { minHeight: 56, display: "flex", alignItems: "center" },
                }}
                InputProps={{ disableUnderline: true }}
              >
                <MenuItem value="">
                  <em>Selecione</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id_category} value={category.id_category}>
                    {category.name}
                  </MenuItem>
                ))}
              </SEGTextField>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={3}
            alignItems="stretch"
            sx={{
              flex: 1,
              minHeight: { xs: "auto", md: 360 },
            }}
          >
            <Grid
              item
              xs={12}
              md={8}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <SEGTextField
                label="Descrição"
                fullWidth
                multiline
                minRows={12}
                maxRows={12}
                placeholder="Escreva a descrição do curso..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{
                  height: "100%",
                  "& .MuiFilledInput-root": {
                    backgroundColor: "#f4efef",
                    borderRadius: 2,
                    p: 2,
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                  },
                  mb: 0,
                }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                pl: { xs: 0, md: 3 },
              }}
            >
              <Typography sx={{ color: colors.strongGray ?? "#7d7d7d", fontWeight: 600, mb: 1 }}>
                Imagem
              </Typography>

              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: "#fff",
                      borderRadius: 2,
                      border: "1px solid #f0f0f0",
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="preview"
                      sx={{
                        maxWidth: "100%",
                        maxHeight: { xs: 200, md: 300 },
                        objectFit: "contain",
                        borderRadius: 1,
                        background: "#fff",
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <SEGButton colorTheme="outlined" startIcon={<PhotoCamera />} onClick={pickImage} sx={{ minWidth: 120 }}>
                        Trocar
                      </SEGButton>
                      <SEGButton colorTheme="outlined" onClick={clearImage} sx={{ minWidth: 120 }}>
                        Remover
                      </SEGButton>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: "330px",
                      bgcolor: "#f4efef",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: colors.strongGray }}>
                      Nenhuma imagem selecionada
                    </Typography>

                    <SEGButton
                      colorTheme="purple"
                      startIcon={<PhotoCamera />}
                      onClick={pickImage}
                      sx={{
                        textTransform: "uppercase",
                        borderRadius: 3,
                        px: 3,
                        boxShadow: "none",
                        width: { xs: "140px", md: "180px" },
                      }}
                    >
                      Selecionar
                    </SEGButton>

                    <Typography variant="caption" sx={{ color: colors.strongGray }}>
                      PNG, JPG — até 5MB
                    </Typography>
                  </Box>
                )}

                <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <SEGButton
                  colorTheme="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => handleNavigateTo("/my-courses")}
                  sx={{
                    width: { xs: 140, md: 200 },
                  }}
                >
                  Meus Cursos
                </SEGButton>

                <SEGButton
                  type="submit"
                  loading={loadingCourseCreation}
                  colorTheme="gradient"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  sx={{
                    width: { xs: 120, md: 140 },
                  }}
                >
                  Salvar
                </SEGButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewCoursePage;
