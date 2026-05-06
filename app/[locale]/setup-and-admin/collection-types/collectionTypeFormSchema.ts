import { z } from 'zod';

export const collectionTypeFormSchema = z.object({
  customerAgreement: z.string().min(1, 'Customer agreement is required'),
  account: z.string().min(1, 'Account is required'),
  fileUploadOptions: z.object({
    errorRejection: z.string().min(1, 'File error rejection option is required'),
    cutoffBreach: z.string().min(1, 'Cut-off time breach option is required'),
  }),
  statementReferencing: z.object({
    references: z.array(z.string()).min(1, 'At least one statement reference is required'),
  }),
  hostToHostOptions: z.object({
    batchErrorRejection: z.string().min(1, 'Batch error rejection option is required'),
    cutoffBreach: z.string().min(1, 'Cut-off time breach option is required'),
  }),
  collectionModel: z.object({
    countryOrRegion: z.string().min(1, 'Country/region is required'),
    hostFileUploadDefault: z.string().min(1, 'Host/file upload default is required'),
  }),
});

export type CollectionTypeFormSchema = typeof collectionTypeFormSchema;
