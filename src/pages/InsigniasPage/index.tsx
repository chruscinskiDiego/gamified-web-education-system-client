import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const InsigniasPage: React.FC = () => {

    const [insignias, setInsignias] = useState();

    const getInsignias = async () => {

        const response = await api.get("/insignia/view-by-student");

        setInsignias(response.data || []);
    }

    useEffect(() => {

        getInsignias();

    },[]);

    console.log(JSON.stringify(insignias));
    
    return (
        <>
        <h1>insignias</h1>
        </>
    );
}

export default InsigniasPage;