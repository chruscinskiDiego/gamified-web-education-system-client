import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const AllCoursesPage: React.FC = () => {

    const [courses, setCourses] = useState();

    const getCourses = async() => {

        const response = await api.get("/course/view-all");

        if(response.status === 200) {

            setCourses(response.data);
        }
    };

    useEffect(() => {

        getCourses();

    },[]);

    console.log(JSON.stringify(courses));

    return (
        <>
        <h1>todos os cursos</h1>
        </>
    )
};

export default AllCoursesPage;