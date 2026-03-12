import mongoose from 'mongoose';
const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    industry: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Organization = mongoose.model('Organization', OrganizationSchema);
export default Organization;
//# sourceMappingURL=Organization.js.map