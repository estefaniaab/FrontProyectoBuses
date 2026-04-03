import { User } from "../Users/user.model";

export class Profile {
    id?: string;
    user: User | null;
    phone?: string;
    photo?: string;
}
