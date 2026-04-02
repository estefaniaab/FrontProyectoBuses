import { User } from "../Users/user.model";

export class Profile {
    id?: string;
    user: { id: string; name?: string } | null;
    phone?: string;
    photo?: string;
}
