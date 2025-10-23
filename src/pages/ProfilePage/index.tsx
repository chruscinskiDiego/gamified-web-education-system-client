import type React from "react";
import { ProfileContext } from "../../contexts/ProfileContext";
import { useContext, useEffect, useState } from "react";
import { api } from "../../lib/axios";

const ProfilePage: React.FC = () => {

    const profileContext = useContext(ProfileContext)!;

    const { userId } = profileContext;

    const [profile, setProfile] = useState();

    const getUserProfile = async () => {

        const response = await api.get(`/user-profile/view/${userId}`);

        if (response.status === 200) {

            setProfile(response.data);

        }

    };

    useEffect(() => {

        getUserProfile();

    }, []);

    console.log(JSON.stringify(profile));

    return (
        <>
            <h1>perfil</h1>
        </>
    )

};

export default ProfilePage;