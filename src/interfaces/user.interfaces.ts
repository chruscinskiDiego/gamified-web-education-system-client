export interface ISignIn{
    email: string;
    password: string;
}

export interface ISignUp{
    name: string;
    surname: string;
    email: string;
    password: string;
    type: 'S' | 'T';
    birth_date: string;
}
