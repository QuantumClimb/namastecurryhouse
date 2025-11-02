import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  
  useEffect(() => {
    // Fetch publishable key from backend
    fetch(`${API_BASE_URL}/stripe/config`)
      .then(res => res.json())
      .then(data => {
        const stripe = loadStripe(data.publishableKey);
        setStripePromise(stripe);
      })
      .catch(err => console.error('Failed to load Stripe:', err));
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
