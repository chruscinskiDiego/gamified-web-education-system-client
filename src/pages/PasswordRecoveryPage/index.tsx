import { useState } from "react"
import { api } from "../../lib/axios";

const PasswordRecoveryPage: React.FC = () => {

    const [email, setEmail] = useState<string>('');

    const handleSubmit = async () => {

        try{

        const response = await api.post("/user-profile/password-recovery",
            {
                email
            });

        if (response.status == 200) {

            const message = response?.data?.message;
            
            //todo: mudar a tela com um símbolo de sucesso e a mensagem
        }

        }
        catch(error){

            throw error;

            //todo: mudar a tela com um símbolo de erro e a mensagem

        }

    }

    return (
        <>
            <h1>password recovery</h1>
        </>
    );
}

export default PasswordRecoveryPage;