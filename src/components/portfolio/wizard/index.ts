// Main wizard export
export { PortfolioWizard } from './PortfolioWizard';

// Types export
export type {
  PortfolioFormData,
  ProfileType,
  SocialLink,
  Project,
  Testimonial,
  Media,
  AIFlags,
  GroqFlags, // Legacy alias for AIFlags
} from './types';

export {
  PROFILE_TYPES,
  SOCIAL_PLATFORMS,
  initialFormData,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  calculateAIFlags,
  calculateGroqFlags, // Legacy alias for calculateAIFlags
} from './types';
