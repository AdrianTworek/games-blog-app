import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *    CreateGameInput:
 *      type: object
 *      required:
 *        - title
 *        - description
 *      properties:
 *        title:
 *          type: string
 *          default: Game title
 *        description:
 *          type: string
 *          default: Game description
 *    CreateGameResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        title:
 *          type: string
 *        description:
 *          type: string
 *        authorId:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 */
export const createGameSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .max(255, 'Title cannot contain more than 255 characters'),
    description: z
      .string({ required_error: 'Description is required' })
      .max(1000, 'Description cannot contain more than 1000 characters'),
  }),
});

export type CreateGameInput = z.infer<typeof createGameSchema>['body'];

export const deleteGameParamsSchema = z.object({
  params: z.object({
    gameId: z.string({ required_error: 'gameId is required' }),
  }),
});

export type DeleteGameParams = z.infer<typeof deleteGameParamsSchema>['params'];
