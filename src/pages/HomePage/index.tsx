import { useMemo, useState, type SyntheticEvent } from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Grid,
    Rating,
    Stack,
    Tab,
    Tabs,
    Typography,
    useTheme,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { mapDifficulty } from "../../helpers/DifficultyLevel";

const MOCK_HOME_DATA = {
    registered_courses: [
        {
            title: "dasdsadsadsadsad",
            id_course: "018d9444-2785-4ad3-972e-9a6f62b7de58",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/018d9444-2785-4ad3-972e-9a6f62b7de58",
            difficulty_level: "M",
            avaliation_average: 5,
        },
    ],
    highlighted_courses: [
        {
            title: "dasdsadsadsadsad",
            id_course: "018d9444-2785-4ad3-972e-9a6f62b7de58",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/018d9444-2785-4ad3-972e-9a6f62b7de58",
            difficulty_level: "M",
            avaliation_average: 5,
        },
        {
            title: "teste de titulo",
            id_course: "01977d33-58c1-445e-886e-a880b16b0293",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/01977d33-58c1-445e-886e-a880b16b0293",
            difficulty_level: "M",
            avaliation_average: 2,
        },
        {
            title: "Titulo teste",
            id_course: "02d4dd14-d443-4d39-beed-2fe0d68b29a5",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/02d4dd14-d443-4d39-beed-2fe0d68b29a5",
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "Titulo teste",
            id_course: "07657129-654c-498b-a755-583ac224297b",
            link_thumbnail: null,
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "Curso de conversação",
            id_course: "0b5986c1-acc7-4342-9176-1349d579af12",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/0b5986c1-acc7-4342-9176-1349d579af12",
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "dsadsadasdsa",
            id_course: "0e92f5fe-42a5-4262-9027-a6082afab0e7",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/0e92f5fe-42a5-4262-9027-a6082afab0e7",
            difficulty_level: "H",
            avaliation_average: null,
        },
        {
            title: "Titulo teste",
            id_course: "11e28b3a-d1dc-4bfd-b73a-b13336382c6a",
            link_thumbnail: null,
            difficulty_level: "E",
            avaliation_average: null,
        },
        {
            title: "Curso de conversação",
            id_course: "16db9b03-9496-41f8-98a9-0c8c97b3fb1a",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/16db9b03-9496-41f8-98a9-0c8c97b3fb1a",
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "dsadsadasdsa",
            id_course: "1b32b4fd-b084-4d4e-b1eb-7c7716c7fe76",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/1b32b4fd-b084-4d4e-b1eb-7c7716c7fe76",
            difficulty_level: "H",
            avaliation_average: null,
        },
        {
            title: "Titulo teste",
            id_course: "1e0f1a0f-53a3-481d-824b-d2d5466d9283",
            link_thumbnail: null,
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "dasdsadsadsadsad",
            id_course: "221a7fff-df8a-4c2c-9e9a-ea6e79ee3b7a",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//courses/thumbnail/221a7fff-df8a-4c2c-9e9a-ea6e79ee3b7a",
            difficulty_level: "M",
            avaliation_average: null,
        },
        {
            title: "Fund. de Prog. 3",
            id_course: "222f6dab-18e6-495f-92fc-28b514d32e6b",
            link_thumbnail:
                "https://gamified-web-education-system-server.s3.sa-east-1.amazonaws.com//user-profile-pictures/20c55048-111a-45cf-b40a-24c34ef80579",
            difficulty_level: "E",
            avaliation_average: null,
        },
    ],
};

type CourseSummary = {
    title: string;
    id_course: string;
    link_thumbnail: string | null;
    difficulty_level: string;
    avaliation_average: number | null;
};

type HomePageResponse = {
    registered_courses: CourseSummary[];
    highlighted_courses: CourseSummary[];
};

const SECTION_TABS = [
    { value: "registered", label: "Meus cursos" },
    { value: "highlighted", label: "Em alta" },
] as const;

type TabValue = typeof SECTION_TABS[number]["value"];

const useHomeCourses = () => {
    return useMemo<HomePageResponse>(() => MOCK_HOME_DATA, []);
};

const CourseCard = ({ course, onClick }: { course: CourseSummary; onClick: () => void }) => {
    const theme = useTheme();

    const difficulty = mapDifficulty(course.difficulty_level ?? "M");
    const ratingValue = course.avaliation_average ?? 0;
    const hasRating = course.avaliation_average !== null && course.avaliation_average !== undefined;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                height: "100%",
                background: "#ffffff",
                boxShadow: "0px 10px 30px rgba(33, 33, 52, 0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 18px 40px rgba(33, 33, 52, 0.18)",
                },
            }}
        >
            <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
                {course.link_thumbnail ? (
                    <CardMedia
                        component="img"
                        height="160"
                        image={course.link_thumbnail}
                        alt={`Capa do curso ${course.title}`}
                        sx={{ objectFit: "cover" }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: theme.palette.grey[100],
                            color: theme.palette.grey[500],
                        }}
                    >
                        <ImageIcon fontSize="large" />
                    </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
                            <Chip
                                label={difficulty}
                                size="small"
                                sx={{
                                    background: "rgba(77, 103, 246, 0.12)",
                                    color: "#5560ff",
                                    fontWeight: 600,
                                    letterSpacing: 0.2,
                                }}
                            />
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {hasRating ? (
                                    <>
                                        <Rating
                                            value={ratingValue}
                                            precision={0.5}
                                            readOnly
                                            size="small"
                                            sx={{ color: "#ffb400" }}
                                        />
                                        <Typography variant="body2" sx={{ color: theme.palette.grey[600], fontWeight: 600 }}>
                                            {ratingValue.toFixed(1)}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                                        Sem avaliações
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>

                        <Stack spacing={1}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    minHeight: 56,
                                }}
                            >
                                {course.title}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "#5560ff", fontWeight: 600 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Ver detalhes
                                </Typography>
                                <ArrowForwardIcon sx={{ fontSize: 18 }} />
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export const HomePage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState<TabValue>("registered");

    const { registered_courses, highlighted_courses } = useHomeCourses();

    const coursesToDisplay = currentTab === "registered" ? registered_courses : highlighted_courses;

    const handleChangeTab = (_: SyntheticEvent, value: TabValue) => {
        setCurrentTab(value);
    };

    const handleNavigateToCourse = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    return (
        <Box sx={{ background: "linear-gradient(180deg, #f7f8ff 0%, #ffffff 60%)", minHeight: "calc(100vh - 64px)" }}>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1f1f39",
                                textAlign: { xs: "center", md: "left" },
                            }}
                        >
                            Olá! Continue aprendendo com a SEG Academy
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: theme.palette.grey[600],
                                maxWidth: 520,
                                textAlign: { xs: "center", md: "left" },
                                alignSelf: { xs: "center", md: "flex-start" },
                            }}
                        >
                            Acompanhe os cursos em que você está matriculado e descubra o que está em alta entre os alunos da
                            plataforma.
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            borderRadius: 4,
                            background: "#ffffff",
                            boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                            p: { xs: 2.5, md: 4 },
                        }}
                    >
                        <Tabs
                            value={currentTab}
                            onChange={handleChangeTab}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            sx={{
                                mb: { xs: 3, md: 4 },
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    minWidth: 120,
                                },
                                "& .MuiTabs-indicator": {
                                    background: "linear-gradient(90deg, #5D70F6 0%, #49A0FB 100%)",
                                    height: 3,
                                    borderRadius: 8,
                                },
                            }}
                        >
                            {SECTION_TABS.map((tab) => (
                                <Tab key={tab.value} value={tab.value} label={tab.label} />
                            ))}
                        </Tabs>

                        {coursesToDisplay.length === 0 ? (
                            <Box
                                sx={{
                                    py: { xs: 6, md: 8 },
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    color: theme.palette.grey[500],
                                }}
                            >
                                <ImageIcon sx={{ fontSize: 56, mb: 2, color: theme.palette.grey[400] }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    Nada por aqui ainda
                                </Typography>
                                <Typography variant="body2" sx={{ maxWidth: 360 }}>
                                    Assim que novos cursos estiverem disponíveis, eles aparecerão nesta seção.
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {coursesToDisplay.map((course) => (
                                    <Grid item xs={12} sm={6} md={4} key={course.id_course}>
                                        <CourseCard
                                            course={course}
                                            onClick={() => handleNavigateToCourse(course.id_course)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default HomePage;
