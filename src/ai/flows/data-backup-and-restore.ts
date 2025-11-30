'use server';

/**
 * @fileOverview A flow that reminds the user to manually create periodic backups of their MongoDB Atlas data.
 *
 * @function remindUserToBackupData - This is the main exported function that triggers the reminder flow.
 * @typedef ReminderOutput - The output type for the reminder, which is a simple string.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReminderOutputSchema = z.object({
  reminder: z.string().describe('A reminder message to back up MongoDB Atlas data.'),
});

export type ReminderOutput = z.infer<typeof ReminderOutputSchema>;

async function remindUserToBackupData(): Promise<ReminderOutput> {
  return dataBackupAndRestoreFlow();
}

const prompt = ai.definePrompt({
  name: 'dataBackupAndRestorePrompt',
  output: {schema: ReminderOutputSchema},
  prompt: `Please remember to manually create periodic backups of your MongoDB Atlas data to a secure external storage location. Here are a few examples:

- Using mongodump to back up to your local drive:
  \`mongodump --uri=\