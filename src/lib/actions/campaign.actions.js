"use server";

import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";

/**
 * Get featured campaign for home page display
 * (Raines: the Laravel API has no campaign module — skip the network call.
 * Flash-sale style promos come from on-sale products instead.)
 */
export async function getFeaturedCampaign() {
  return {
    success: true,
    campaign: null,
    error: null,
  };
}

/**
 * Get all active campaigns for flash sale page
 */
export async function getAllCampaigns() {
  try {
    const response = await resilientFetch(`${baseURL}/campaign/all`, {
      next: {
        revalidate: 30,
        tags: ["campaigns_all"],
      },
    });

    const campaigns = await handleResponse(response);

    return {
      success: true,
      campaigns: campaigns || [],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      campaigns: [],
      error: error.message,
    };
  }
}

/**
 * Get showing campaigns (active only)
 */
export async function getShowingCampaigns() {
  try {
    const response = await resilientFetch(`${baseURL}/campaign/show`, {
      next: {
        revalidate: 30,
        tags: ["campaigns_showing"],
      },
    });

    const campaigns = await handleResponse(response);

    return {
      success: true,
      campaigns: campaigns || [],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      campaigns: [],
      error: error.message,
    };
  }
}

/**
 * Get campaign by slug
 */
export async function getCampaignBySlug(slug) {
  try {
    const response = await resilientFetch(`${baseURL}/campaign/slug/${slug}`, {
      next: {
        revalidate: 30,
        tags: ["campaign", `campaign-${slug}`],
      },
    });

    const campaign = await handleResponse(response);

    return {
      success: true,
      campaign,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      campaign: null,
      error: error.message,
    };
  }
}

/**
 * Check if product is in active campaign
 */
export async function checkProductCampaign(productId) {
  try {
    const response = await resilientFetch(
      `${baseURL}/campaign/check-product/${productId}`,
      {
        next: {
          revalidate: 30,
          tags: ["campaign_product", `campaign-product-${productId}`],
        },
      },
    );

    const data = await handleResponse(response);

    return {
      success: true,
      ...data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      inCampaign: false,
      error: error.message,
    };
  }
}
