import mongoose from 'mongoose';

const serviceCareTypeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    tasks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const ServiceCareType = mongoose.models.ServiceCareType || mongoose.model('ServiceCareType', serviceCareTypeSchema);
export default ServiceCareType;
