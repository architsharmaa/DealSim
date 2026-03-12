import mongoose from 'mongoose';
export interface ICompetency {
    name: string;
    description: string;
    weight: number;
    scoringGuidelines: string;
}
export interface IRubric extends mongoose.Document {
    name: string;
    competencies: ICompetency[];
    organizationId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const Rubric: mongoose.Model<IRubric, {}, {}, {}, mongoose.Document<unknown, {}, IRubric, {}, mongoose.DefaultSchemaOptions> & IRubric & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRubric>;
export default Rubric;
//# sourceMappingURL=Rubric.d.ts.map