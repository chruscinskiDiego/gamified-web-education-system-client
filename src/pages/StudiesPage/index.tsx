import type React from "react";
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const StudiesPage: React.FC = () => {

    const [courses, setCourses] = useState();

    const getRegisteredCourses = async () => {


        const response = await api.get("/course/user-registered");

        if (response.status === 200) {

            setCourses(response.data);

        }
    }

    useEffect(() => {

        getRegisteredCourses();

    }, []);

    console.log(JSON.stringify(courses));

    return (
        <>

            <h1>cursos registrados</h1>

        </>
    )
};

export default StudiesPage;