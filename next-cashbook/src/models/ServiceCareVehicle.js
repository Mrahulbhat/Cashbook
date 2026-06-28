import mongoose from 'mongoose';

const serviceCareVehicleSchema = new mongoose.Schema(
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
    model: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      default: '',
    },
    registration: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const ServiceCareVehicle = mongoose.models.ServiceCareVehicle || mongoose.model('ServiceCareVehicle', serviceCareVehicleSchema);
export default ServiceCareVehicle;
