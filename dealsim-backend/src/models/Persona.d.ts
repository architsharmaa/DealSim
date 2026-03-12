import mongoose from 'mongoose';
export interface IPersona extends mongoose.Document {
    name: string;
    role: string;
    company: string;
    personalityTraits: string[];
    resistanceLevel: 'low' | 'medium' | 'high';
    defaultObjections: string[];
    organizationId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const Persona: mongoose.Model<IPersona, {}, {}, {}, mongoose.Document<unknown, {}, IPersona, {}, mongoose.DefaultSchemaOptions> & IPersona & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPersona>;
export default Persona;
//# sourceMappingURL=Persona.d.ts.map