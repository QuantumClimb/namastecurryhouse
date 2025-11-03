import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Use the publishable key directly from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  
  useEffect(() => {
    if (stripePublishableKey) {
      const stripe = loadStripe(stripePublishableKey);
      setStripePromise(stripe);
    } else {
      console.error('Stripe publishable key not found in environment variables');
    }
  }, []);
  
  if (!stripePromise) {
    return <div className="flex justify-center items-center p-6">Loading payment system...</div>;
  }
  
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
