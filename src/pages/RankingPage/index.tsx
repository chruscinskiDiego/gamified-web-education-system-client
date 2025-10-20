import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const RankingPage: React.FC = () => {

    const[ranking, setRanking] = useState([]);
    const[fetchedRank, setFetchedRank] = useState<boolean>(false);

    const getRanking = async () => {

        const response = await api.get("/ranking");

        if(response.status === 200){

            setRanking(response.data);
            setFetchedRank(true);

        }
    };


    useEffect(() => {

        if(ranking.length > 0 && fetchedRank) return;

        getRanking();

    }, []);

    console.log(JSON.stringify(ranking));

    return (
        <h1>Ranking Page</h1>
    );
};

export default RankingPage;