import { z } from "zod";

const signupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "At least 8 characters long" })
    // .regex(/[a-zA-Z]/, { message: "at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    // .regex(/[^a-zA-Z0-9]/, {
    //   message: "contain at least one special character.",
    // })
    .trim(),
});

const updateProfileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  address: z
    .string()
    .min(6, { message: "Address must be at least 6 characters long." })
    .trim(),
  phone: z
    .string()
    .min(10, { message: "Phone must be at least 10 characters long." })
    .max(15, { message: "Phone must be at most 15 characters long." })
    .regex(/^[\d+\-\s()]+$/, {
      message: "Phone must only contain numbers, +, -, spaces, or parentheses.",
    })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  image: z
    .string()
    .refine(
      (url) => {
        // Allow empty string (no image)
        if (!url || url === "") return true;

        // Must be a valid URL
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return false;
          }
        } catch {
          return false;
        }

        // Check for common image file extensions
        const commonImageExtensions =
          /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
        // Check for Cloudinary URLs
        const cloudinaryImage = /cloudinary\.com/.test(url);
        // Check for Google user content URLs
        const googleImage = /lh3\.googleusercontent\.com/.test(url);
        // Check for Facebook user content URLs
        const facebookImage = /fbcdn\.net/.test(url);
        // Check for GitHub user content URLs
        const githubImage = /avatars\.githubusercontent\.com/.test(url);
        // Check for other common image hosting services
        const imgurImage = /imgur\.com/.test(url);
        const unsplashImage = /unsplash\.com/.test(url);

        return (
          commonImageExtensions ||
          cloudinaryImage ||
          googleImage ||
          facebookImage ||
          githubImage ||
          imgurImage ||
          unsplashImage
        );
      },
      {
        message:
          "Invalid image URL. Please use a valid image URL from a supported hosting service.",
      },
    )
    .optional()
    .or(z.literal("")),
});

const changePasswordFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  currentPassword: z
    .string()
    .min(8, { message: "Current password is required" })
    .trim(),

  newPassword: z
    .string()
    .min(8, { message: "At least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "contain at least one special character.",
    })
    .trim(),
});

const shippingAddressFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long." })
    .trim(),
  address: z
    .string()
    .min(10, { message: "Name must be at least 10 characters long." })
    .trim(),
  contact: z
    .string()
    .min(8, { message: "Contact must be at least 8 characters long." })
    .max(15, { message: "Contact must be at most 15 characters long." })
    .regex(/^\d+$/, { message: "Contact must only contain numbers." })
    .trim(),
  country: z.string().min(2, { message: "Country is required." }).trim(),
  city: z.string().min(2, { message: "City is required." }).trim(),
  area: z.string().min(2, { message: "Area is required." }).trim(),
});

const checkoutFormSchema = (shippingOptions) => {
  // console.log("shippingOptions:::", shippingOptions);
  return z.object({
    firstName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .trim(),
    lastName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .trim(),
    email: z.string().email({ message: "Please enter a valid email." }).trim(),
    contact: z
      .string()
      .min(10, { message: "Contact must be at least 10 characters long." })
      .max(15, { message: "Contact must be at most 15 characters long." })
      .regex(/^\d+$/, { message: "Contact must only contain numbers." })
      .trim(),
    address: z
      .string()
      .min(5, { message: "Address must be at least 5 characters long." })
      .trim(),
    city: z
      .string()
      .min(2, { message: "City must be at least 2 characters long." })
      .trim(),
    country: z
      .string()
      .min(2, { message: "Country must be at least 2 characters long." })
      .trim(),
    zipCode: z
      .string()
      .min(5, { message: "Zip code must be at least 5 characters long." })
      .max(10, { message: "Zip code must be at most 10 characters long." })
      .regex(/^\d+$/, { message: "Zip code must only contain numbers." })
      .trim(),

    // Payment methods are admin-configured (Laravel settings.payment_methods),
    // so the valid set is passed in rather than hardcoded.
    paymentMethod: z.string().min(1, { message: "Payment method is required." }),
    shippingOption: z.enum(shippingOptions, {
      message: "Shipping Cost is required.",
    }),
  });
};

export {
  signupFormSchema,
  loginFormSchema,
  updateProfileFormSchema,
  changePasswordFormSchema,
  checkoutFormSchema,
  shippingAddressFormSchema,
};
