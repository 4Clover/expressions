// Profile and authentication
export { profiles } from './profiles.js';

// Staff management
export { staff, staffRelations } from './staff.js';

// Services and pricing
export {
  priceTypeEnum,
  serviceCategories,
  services,
  staffServices,
  serviceCategoriesRelations,
  servicesRelations,
  staffServicesRelations
} from './services.js';

// Appointments and scheduling
export {
  appointmentStatusEnum,
  staffSchedule,
  appointments,
  staffScheduleRelations,
  appointmentsRelations
} from './appointments.js';

// Payments and payment methods
export {
  paymentMethodTypeEnum,
  staffPaymentMethods,
  staffSquareConfig,
  payments,
  processedWebhooks,
  staffPaymentMethodsRelations,
  staffSquareConfigRelations,
  paymentsRelations
} from './payments.js';
