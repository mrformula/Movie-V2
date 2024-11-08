export interface User {
    _id: string;
    username: string;
    role: 'admin' | 'moderator';
    createdAt: Date;
}

export interface NewUser {
    username: string;
    password: string;
    role: 'admin' | 'moderator';
} 