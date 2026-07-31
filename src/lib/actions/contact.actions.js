"use server";

import { z } from "zod";
import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

// Contact form validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(6, "Please enter a valid phone number")
    .max(30, "Phone number is too long"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

/**
 * Submit contact form
 */
export async function submitContactForm(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone") || "";
  const subject = formData.get("subject");
  const message = formData.get("message");

  // Validate input
  const validatedFields = contactSchema.safeParse({
    name,
    email,
    phone,
    subject,
    message,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      error: null,
    };
  }

  try {
    // Raines Laravel: POST /contact-us — {name, email, phone, subject, message}
    // (the template's original backend used /setting/contact)
    const response = await resilientFetch(`${baseURL}/contact-us`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
      }),
    });

    await handleResponse(response);

    return {
      success: true,
      message:
        "Your message has been sent successfully! We will contact you shortly.",
      errors: null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send message. Please try again.",
      errors: null,
    };
  }
}
