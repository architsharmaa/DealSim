import mongoose from 'mongoose';
export interface IOrganization extends mongoose.Document {
    name: string;
    industry?: string;
    createdAt: Date;
}
declare const Organization: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, mongoose.DefaultSchemaOptions> & IOrganization & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrganization>;
export default Organization;
//# sourceMappingURL=Organization.d.ts.map