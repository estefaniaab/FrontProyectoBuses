import { User } from '../Users/user.model';
import { Role } from '../Roles/role.model';
export class UserRole {
    id?: string;
    user?: { id: string; name?: string } | null;
    role?: { id: string; name?: string } | null;
}
