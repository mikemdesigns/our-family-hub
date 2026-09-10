import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const payment = z.object({enabled:z.boolean().default(false),url:z.string().optional(),destination:z.string().optional()});
const eventPhoto = z.object({src:z.string(),alt:z.string().min(1)});
const initiatives = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/initiatives'}),schema:z.object({
 child:z.enum(['Rashid','Kamaal','Sophia']),title:z.string(),date:z.string().nullable().default(null),fundingDeadline:z.string().nullable().default(null),
 description:z.string(),category:z.string(),goal:z.number().positive().nullable().default(null),raised:z.number().nonnegative().nullable().default(null),
 status:z.enum(['auto','funding','funded','upcoming','completed','made-possible']).default('auto'),featured:z.boolean().default(true),secret:z.boolean().default(false),cta:z.string().default('Help Make It Happen'),
 contributors:z.array(z.string().min(1)).default([]),paymentMethods:z.record(payment).default({}),photos:z.object({albumUrl:z.string().default(''),coverImage:z.string().default(''),gallery:z.array(eventPhoto).default([])}).default({albumUrl:'',coverImage:'',gallery:[]})
})});
export const collections = {initiatives};
