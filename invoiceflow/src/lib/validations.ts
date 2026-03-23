// validations using zod 

import {z} from "zod";

export const lineItemSchema = z.object({
   id : z.string(),
   description : z.string().min(1 , "Description is required"),
   quantity : z.number().min(0.01 , "Quantity must be positive"),
   rate : z.number().min(0 , "Rate must be non-negative")
});



export const clientSchema = z.object({
    name : z.string().min(1 , "Client name is required"),
    email : z.email("Invalid email address"),
    address : z.string().min(1 , "Address is required"),
    city : z.string().min(1 , "City is required"),
    country : z.string().min(1 , "Country is required"),
});

export const businessSchema = z.object({
   name : z.string().min(1 , "Business name is required"),
   email : z.email("Invalid email"),
   address : z.string().min(1 , "Address is required"),
   city : z.string().min(1 , "City is required"),
   country : z.string().min(1 , "Country is required"),
   logoUrl : z.url().optional().or(z.literal("")),
});


export const invoiceSchema = z.object({
   invoiceNumber : z.string().min(1 , "Invoice number is required"),
   issueDate : z.string().min(1 , "Issue date is required"),
   dueDate : z.string().min(1 , "Due date is required"),
   client : clientSchema,
   business : businessSchema,
   lineItems : z.array(lineItemSchema).min(1 , "At least one line item is required"),
   taxRate : z.number().min(0).max(100),
   notes : z.string().optional(),
   currency : z.string().min(1),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

