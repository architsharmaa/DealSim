import mongoose from 'mongoose';
export interface IContext extends mongoose.Document {
    product: string;
    dealSize: string;
    salesStage: string;
    specialConditions: string;
    organizationId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const Context: mongoose.Model<IContext, {}, {}, {}, mongoose.Document<unknown, {}, IContext, {}, mongoose.DefaultSchemaOptions> & IContext & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IContext>;
export default Context;
//# sourceMappingURL=Context.d.ts.map