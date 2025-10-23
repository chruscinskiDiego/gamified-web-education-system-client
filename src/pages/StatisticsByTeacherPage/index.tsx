import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const StatisticsByTeacherPage: React.FC = () => {

    const [statistics, setStatistics] = useState();

    const getStatistics = async () => {

        const response = await api.get("/course/statistics");

        if (response.status === 200) {

            setStatistics(response.data);

        }
    };

    useEffect(() => {

        getStatistics();

    }, []);

    console.log(JSON.stringify(statistics));

    return (
        <h1>Statistics By Teacher</h1>
    );
}

export default StatisticsByTeacherPage;