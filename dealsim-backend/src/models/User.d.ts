import mongoose from 'mongoose';
export interface IUser extends mongoose.Document {
    organizationId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'organization_admin' | 'org_employee' | 'admin' | 'manager' | 'employee';
    createdAt: Date;
    comparePassword: (password: string) => Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map