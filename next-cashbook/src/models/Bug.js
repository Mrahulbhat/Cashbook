import mongoose from 'mongoose';

const BUG_STATUSES = ['Not Started', 'In Progress', 'In Review', 'Fixed'];
const LEGACY_BUG_STATUSES = ['Draft', 'Automated', 'Non Automatable', 'Blocked', 'Deprecated'];
const BUG_STATUS_VALUES = [...new Set([...BUG_STATUSES, ...LEGACY_BUG_STATUSES])];

const normalizeBugStatus = (value) => {
    if (typeof value !== 'string') return value;

    const normalized = value.trim();
    if (!normalized) return normalized;

    const aliasMap = {
        'not started': 'Not Started',
        'in progress': 'In Progress',
        'in review': 'In Review',
        'fixed': 'Fixed',
        'draft': 'Draft',
        'automated': 'Automated',
        'non automatable': 'Non Automatable',
        'blocked': 'Blocked',
        'deprecated': 'Deprecated',
    };

    const key = normalized.toLowerCase();
    return aliasMap[key] || normalized;
};

const bugSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: BUG_STATUS_VALUES,
            default: 'Not Started',
            required: true,
            set: normalizeBugStatus,
        },
    },
    { timestamps: true }
);

const Bug = mongoose.models.Bug || mongoose.model('Bug', bugSchema);
export default Bug;
