import mongoose from 'mongoose';

const serviceCareServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCareVehicle',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    showroom: {
      type: Boolean,
      default: false,
    },
    tasks: {
      type: [String],
      default: [],
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const ServiceCareService = mongoose.models.ServiceCareService || mongoose.model('ServiceCareService', serviceCareServiceSchema);
export default ServiceCareService;
