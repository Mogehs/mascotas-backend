# Payment API Documentation

This document provides comprehensive documentation for the payment-related API endpoints in the Mascotas Backend, specifically for PetPro subscription payments.

## Base URL

```
/payment
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Payment Intent Management](#payment-intent-management)
2. [Payment Confirmation](#payment-confirmation)
3. [Subscription Plans](#subscription-plans)
4. [Error Responses](#error-responses)

---

## Payment Intent Management

### 1. Create Payment Intent

**Endpoint:** `POST /payment/create-payment-intent`

**Description:** Create a Stripe payment intent for PetPro subscription purchase. This generates the client secret needed for frontend payment processing.

**Request Body:**

```json
{
  "business_id": "string", // Required - Business ID (MongoDB ObjectId)
  "subscription_type": "string", // Optional - "premium" or "basic" (default: "premium")
  "currency": "string" // Optional - Currency code (default: "usd")
}
```

**Subscription Types:**

- `"premium"` - Premium subscription ($49.00/year)
- `"basic"` - Basic subscription ($29.00/year)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "client_secret": "pi_1234567890_secret_abc123",
    "payment_intent_id": "pi_1234567890",
    "amount": 4900,
    "currency": "usd",
    "subscription_details": {
      "type": "premium",
      "description": "PetPro Premium Subscription - 1 Year",
      "features": "Featured Ads (10), Products (100), Promotions (20), Analytics",
      "business_name": "Pet Store Plus"
    }
  }
}
```

**Response Fields Explanation:**

- `client_secret` - Use this with Stripe.js to complete payment on frontend
- `payment_intent_id` - Stripe payment intent ID for confirmation
- `amount` - Amount in cents (e.g., 4900 = $49.00)
- `currency` - Payment currency
- `subscription_details` - Details about the subscription being purchased

**Error Responses:**

- `404` - Business not found
- `400` - Invalid subscription type
- `500` - Server error or Stripe error

---

## Payment Confirmation

### 2. Confirm Payment

**Endpoint:** `POST /payment/confirm-payment`

**Description:** Confirm a successful payment and activate the PetPro subscription. This should be called after the payment is completed on the frontend.

**Request Body:**

```json
{
  "payment_intent_id": "string", // Required - Stripe payment intent ID
  "business_id": "string", // Required - Business ID (MongoDB ObjectId)
  "subscription_type": "string" // Required - "premium" or "basic"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment confirmed and subscription activated successfully",
  "data": {
    "subscription": {
      "is_active": true,
      "subscription_type": "premium",
      "start_date": "2025-07-20T10:00:00.000Z",
      "end_date": "2026-07-20T10:00:00.000Z",
      "payment_status": "paid",
      "amount_paid": 49,
      "payment_method": "stripe",
      "stripe_payment_intent_id": "pi_1234567890"
    },
    "features": {
      "can_create_featured_ads": true,
      "max_featured_ads": 10,
      "can_showcase_products": true,
      "max_products": 100,
      "can_create_promotions": true,
      "max_promotions": 20,
      "analytics_access": true
    },
    "payment_details": {
      "amount_paid": 49,
      "currency": "usd",
      "payment_intent_id": "pi_1234567890"
    }
  }
}
```

**Response Fields Explanation:**

- `subscription` - Updated subscription details in the database
- `features` - Activated features based on subscription type
- `payment_details` - Payment transaction details

**Error Responses:**

- `400` - Payment not completed or failed
- `400` - Business ID mismatch with payment intent
- `404` - Business not found
- `500` - Server error

---

## Subscription Plans

### Premium Plan ($49.00/year)

- **Featured Ads:** 10 maximum
- **Product Showcase:** 100 products maximum
- **Promotions:** 20 maximum
- **Analytics:** Full access
- **Duration:** 1 year

### Basic Plan ($29.00/year)

- **Featured Ads:** 3 maximum
- **Product Showcase:** 25 products maximum
- **Promotions:** 5 maximum
- **Analytics:** Full access
- **Duration:** 1 year

---

## Error Responses

All endpoints may return the following error response format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (in development mode)"
}
```

### Common HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (validation errors, payment issues)
- `404` - Not Found (business not found)
- `500` - Internal Server Error (Stripe errors, server issues)

### Payment-Specific Error Responses:

**Payment Intent Creation Errors:**

```json
{
  "success": false,
  "message": "Invalid subscription type. Choose 'premium' or 'basic'"
}
```

**Payment Confirmation Errors:**

```json
{
  "success": false,
  "message": "Payment not completed",
  "payment_status": "requires_action"
}
```

```json
{
  "success": false,
  "message": "Business ID mismatch"
}
```

---

## Usage Examples

### Frontend JavaScript Examples

#### 1. Complete Payment Flow with Stripe Elements:

```javascript
// Step 1: Create Payment Intent
const createPaymentIntent = async (
  businessId,
  subscriptionType = "premium"
) => {
  try {
    const response = await fetch("/payment/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_id: businessId,
        subscription_type: subscriptionType,
        currency: "usd",
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Payment intent created:", result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Step 2: Process Payment with Stripe Elements
const processPayment = async (stripe, elements, clientSecret) => {
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
      redirect: "if_required",
    });

    if (error) {
      console.error("Payment failed:", error);
      throw error;
    }

    if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded:", paymentIntent);
      return paymentIntent;
    } else {
      throw new Error("Payment not completed");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

// Step 3: Confirm Payment on Backend
const confirmPayment = async (
  paymentIntentId,
  businessId,
  subscriptionType
) => {
  try {
    const response = await fetch("/payment/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        business_id: businessId,
        subscription_type: subscriptionType,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Payment confirmed and subscription activated:", result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

// Complete Flow Function
const purchaseSubscription = async (
  businessId,
  subscriptionType = "premium"
) => {
  try {
    // Step 1: Create payment intent
    const paymentData = await createPaymentIntent(businessId, subscriptionType);

    // Step 2: Initialize Stripe
    const stripe = Stripe("pk_test_your_publishable_key");
    const elements = stripe.elements({
      clientSecret: paymentData.client_secret,
    });

    // Step 3: Create payment element
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    // Step 4: Handle form submission
    document
      .getElementById("payment-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        // Show loading state
        document.getElementById("submit-button").disabled = true;

        try {
          // Process payment
          const paymentIntent = await processPayment(
            stripe,
            elements,
            paymentData.client_secret
          );

          // Confirm payment on backend
          const confirmationData = await confirmPayment(
            paymentIntent.id,
            businessId,
            subscriptionType
          );

          // Handle success
          console.log("Subscription activated successfully!");
          window.location.href = "/subscription-success";
        } catch (error) {
          console.error("Payment failed:", error);
          // Show error message to user
          document.getElementById("error-message").textContent = error.message;
        } finally {
          // Hide loading state
          document.getElementById("submit-button").disabled = false;
        }
      });
  } catch (error) {
    console.error("Error in purchase flow:", error);
  }
};
```

#### 2. Simplified Payment Intent Creation:

```javascript
const createPaymentForPremium = async (businessId) => {
  try {
    const response = await fetch("/payment/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_id: businessId,
        subscription_type: "premium",
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Use client_secret with Stripe Elements
      setupStripePayment(result.data.client_secret);

      // Display subscription details to user
      displaySubscriptionDetails(result.data.subscription_details);
    } else {
      console.error("Failed to create payment intent:", result.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const createPaymentForBasic = async (businessId) => {
  try {
    const response = await fetch("/payment/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_id: businessId,
        subscription_type: "basic",
      }),
    });

    const result = await response.json();

    if (result.success) {
      setupStripePayment(result.data.client_secret);
      displaySubscriptionDetails(result.data.subscription_details);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

#### 3. Payment Confirmation with Error Handling:

```javascript
const confirmSubscriptionPayment = async (
  paymentIntentId,
  businessId,
  subscriptionType
) => {
  try {
    const response = await fetch("/payment/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        business_id: businessId,
        subscription_type: subscriptionType,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Payment confirmed successfully
      const { subscription, features, payment_details } = result.data;

      // Update UI with subscription details
      updateSubscriptionStatus(subscription);
      updateFeatures(features);

      // Show success message
      showSuccessMessage(
        `${
          subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)
        } subscription activated! 
         Valid until: ${new Date(subscription.end_date).toLocaleDateString()}`
      );

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } else {
      // Handle specific error cases
      if (result.message.includes("Payment not completed")) {
        showErrorMessage("Payment was not completed. Please try again.");
      } else if (result.message.includes("Business ID mismatch")) {
        showErrorMessage("Invalid payment. Please contact support.");
      } else {
        showErrorMessage(result.message);
      }
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    showErrorMessage(
      "An error occurred while confirming payment. Please contact support."
    );
  }
};
```

#### 4. React Hook for Payment Processing:

```javascript
import { useState, useCallback } from "react";

const usePaymentProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = useCallback(
    async (businessId, subscriptionType = "premium") => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/payment/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            business_id: businessId,
            subscription_type: subscriptionType,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const confirmPayment = useCallback(
    async (paymentIntentId, businessId, subscriptionType) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/payment/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            business_id: businessId,
            subscription_type: subscriptionType,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createPaymentIntent,
    confirmPayment,
    loading,
    error,
    setError,
  };
};

export default usePaymentProcessing;
```

---

## Integration Notes

### Stripe Integration Requirements:

1. **Frontend Setup:**

   ```html
   <script src="https://js.stripe.com/v3/"></script>
   ```

2. **Environment Variables:**

   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

3. **Payment Element HTML:**
   ```html
   <form id="payment-form">
     <div id="payment-element">
       <!-- Stripe Elements will create form elements here -->
     </div>
     <button id="submit-button">Pay Now</button>
     <div id="error-message" role="alert"></div>
   </form>
   ```

### Security Considerations:

1. **Always verify payments on the backend** - Never trust frontend payment status
2. **Use HTTPS** - Required for Stripe payment processing
3. **Validate business ownership** - Ensure user can only purchase for their business
4. **Handle payment failures gracefully** - Provide clear error messages
5. **Store payment records** - Keep transaction history for support

### Error Handling Best Practices:

1. **Payment Intent Creation:**

   - Validate business exists before creating intent
   - Handle Stripe API errors gracefully
   - Provide clear subscription plan details

2. **Payment Confirmation:**

   - Always check payment status from Stripe
   - Verify business ID matches payment metadata
   - Handle partial failures (payment succeeded but subscription activation failed)

3. **User Experience:**
   - Show loading states during payment processing
   - Provide clear success/error messages
   - Allow users to retry failed payments
   - Redirect appropriately after success/failure

---

## Testing

### Test Credit Cards (Stripe Test Mode):

- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

### Test Scenarios:

1. Successful premium subscription purchase
2. Successful basic subscription purchase
3. Payment declined scenarios
4. Business not found scenarios
5. Invalid subscription type scenarios

---

This documentation provides everything needed to integrate PetPro subscription payments using Stripe. The examples show complete payment flows from intent creation to confirmation and subscription activation.
