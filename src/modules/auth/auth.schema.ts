import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: 'Email address is required' })
        .email('Invalid email address')
        .max(255, 'Email address cannot contain more than 255 characters'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must contain at least 8 characters')
        .max(255, 'Password cannot contain more than 255 characters'),
      passwordConfirm: z.string({
        required_error: 'Please confirm your password',
      }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export type RegisterInput = Omit<
  z.infer<typeof registerSchema>['body'],
  'passwordConfirm'
>;

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
