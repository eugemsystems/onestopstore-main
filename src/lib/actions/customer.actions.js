"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getHeaders } from "@lib/auth-server";
import {
  deleteAddress,
  listRawAddresses,
  createRawAddress,
  updateRawAddress,
  listCountries,
} from "@services/LaravelAddress";
import { laravelSelf } from "@services/LaravelAuth";

/**
 * Customer address-book actions — Raines Laravel edition.
 * Laravel's address book is a plain multi-row resource at `/address` (see
 * services/LaravelAddress.js). The account pages (checkout's billing/
 * shipping selectors, My Addresses) all read/write it directly in its real
 * shape — {title, street, city, country_id, phone} — rather than through a
 * single-address free-text form.
 */

/**
 * Full raw address book (id, title, street, city, country{id,name}, phone) —
 * used by the checkout billing/shipping address selector, which (like the
 * legacy Checkout/ShowAddress.jsx) lists every saved address and lets the
 * user pick the one to use for each, rather than the single-address flow
 * above.
 */
export async function listAddressBook() {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { addresses: [], error: "Unauthorized" };
    }
    const addresses = await listRawAddresses(headers);
    return { addresses, error: null };
  } catch (error) {
    return { addresses: [], error: error.message };
  }
}

/** Country list for the "Add Address" form's country dropdown. */
export async function listAddressCountries() {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { countries: [], error: "Unauthorized" };
    }
    const countries = await listCountries(headers);
    return { countries, error: null };
  } catch (error) {
    return { countries: [], error: error.message };
  }
}

/** Create a new address book entry (raw Laravel shape) from checkout. */
export async function addAddressBookEntry(payload) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { address: null, error: "Unauthorized" };
    }
    const address = await createRawAddress(headers, payload);
    revalidatePath("/checkout");
    revalidatePath("/user/shipping-address");
    revalidatePath("/user/my-account");
    return { address, error: null };
  } catch (error) {
    return { address: null, error: error.message };
  }
}

/** Update an existing address book entry (raw Laravel shape). */
export async function updateAddressBookEntry(id, payload) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { address: null, error: "Unauthorized" };
    }
    const address = await updateRawAddress(headers, id, payload);
    revalidatePath("/checkout");
    revalidatePath("/user/shipping-address");
    revalidatePath("/user/my-account");
    return { address, error: null };
  } catch (error) {
    return { address: null, error: error.message };
  }
}

/** Delete an address book entry. */
export async function deleteAddressBookEntry(id) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { success: false, error: "Unauthorized" };
    }
    await deleteAddress(headers, id);
    revalidatePath("/checkout");
    revalidatePath("/user/shipping-address");
    revalidatePath("/user/my-account");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Wallet + loyalty-points balance for the checkout summary's "pay with
 * wallet/credits" breakdown (legacy PointWallet.jsx reads these from the
 * same /self response).
 */
export async function getWalletPointsBalance() {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { wallet: null, point: null, error: "Unauthorized" };
    }
    const token = headers.authorization.replace(/^Bearer\s+/i, "");
    const self = await laravelSelf(token);
    return { wallet: self?.wallet || null, point: self?.point || null, error: null };
  } catch (error) {
    return { wallet: null, point: null, error: error.message };
  }
}
