import type React from "react";
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const GamificationRegisters: React.FC = () => {


    // insignia

    const [insignias, setInsignias] = useState();

    const getInsignias = async () => {

        const response = await api.get("/insignia/view-all");

        if (response.status === 200) {
            setInsignias(response.data);
        }
    };

    useEffect(() => {

        getInsignias();

    }, []);

    // desafios

    const [challenges, setChallenges] = useState();

    const getChallenges = async () => {

        const response = await api.get("/challenge/view-all");

        if (response.status === 200) {
            setChallenges(response.data);
        }
    }

    useEffect(() => {

        getChallenges();

    }, []);

    console.log('insignias: ' + JSON.stringify(insignias));

    console.log('challenges: ' + JSON.stringify(challenges));

    return (
        <>

            <h1>gamificacao</h1>
        </>
    );
}

export default GamificationRegisters;