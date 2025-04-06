import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('L\'adresse email n\'est pas valide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Le pays est requis'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  }),
  referralCode: z.string().optional()
});
