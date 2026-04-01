import { User } from '../Users/user.model';
import { Role } from '../Roles/role.model';
export class UserRole {
    id?: string;
    user_id?: User[];
    role_id?: Role[];
}
