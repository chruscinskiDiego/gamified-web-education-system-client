import { useEffect, useState } from "react";
import {
    Box,
    Container,
    Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { type CourseSummary } from "../../interfaces/course.interfaces";
import { CourseSection } from "../../components/CourseSection";
import { api } from "../../lib/axios";


export const HomePage: React.FC = () => {

    const [registeredCourses, setRegisteredCourses] = useState<CourseSummary[]>([]);
    const [highlightedCourses, setHighlightedCourses] = useState<CourseSummary[]>([]);

    const navigate = useNavigate();

    const getHomePageInfos = async () => {

        const response = await api.get("/course/registered-and-highlighted");

        setRegisteredCourses(response.data.registered_courses || []);
        setHighlightedCourses(response.data.highlighted_courses || []);

    };

    useEffect(() => {

        if(highlightedCourses.length > 0) return;

        getHomePageInfos();

    },[]);

    const handleNavigateToCourse = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    return (
        <Box sx={{ background: "#ffff", minHeight: "calc(100vh - 64px)" }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Stack spacing={4}>
                        <CourseSection
                            title="Meus cursos"
                            description="Continue de onde parou nos cursos em que você já está matriculado."
                            courses={registeredCourses}
                            onNavigate={handleNavigateToCourse}
                            type="registered"
                        />

                        <CourseSection
                            title="Cursos em destaque"
                            description="Explore o que outros alunos estão estudando agora mesmo."
                            courses={highlightedCourses}
                            onNavigate={handleNavigateToCourse}
                            type="highlighted"
                        />
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default HomePage;
