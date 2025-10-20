import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const ChallengesPage: React.FC = () => {

    const [challenges, setChallenges] = useState();

    const getChallenges = async () => {

        const response = await api.get("/challenge/student-view/all");

        if(response.status === 200){

            setChallenges(response.data);

        }
    };

    useEffect(() => {

        getChallenges();

    },[]);
    
    console.log('challenges: ' + JSON.stringify(challenges));
    return (
        <h1>Challenges Page</h1>
    );

}
export default ChallengesPage;