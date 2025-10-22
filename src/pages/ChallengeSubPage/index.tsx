import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { api } from "../../lib/axios";

const ChallengeSubPage: React.FC = () => {

    const {id} = useParams();

    const [challenge, setChallenge] = useState();

    const getChallenges = async () => {

        const response = await api.get(`/challenge/student-view/id/${id}`);

        if(response.status === 200){

            setChallenge(response.data);

        }
    };

    useEffect(() => {


        getChallenges();

    }, []);

    console.log(JSON.stringify(challenge));
    
    return (
        <>
        <h1>
            CHALLENGE BY ID {id}
        </h1>
        </>
    )
};

export default ChallengeSubPage;