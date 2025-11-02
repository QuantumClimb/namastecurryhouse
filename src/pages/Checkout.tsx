import { useState } from 'react';
import useCartStore from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import DeliveryAddressForm from '@/components/checkout/DeliveryAddressForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import CheckoutStepIndicator from '@/components/checkout/CheckoutStepIndicator';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import StripeProvider from '@/components/StripeProvider';
import { CustomerInfo, DeliveryAddress, PaymentMethod } from '@/types/order';

type CheckoutStep = 'cart' | 'customer' | 'address' | 'payment' | 'stripe-payment';

export default function Checkout() {
  const { 
    items, 
    total, 
    customerInfo, 
    deliveryAddress, 
    selectedPaymentMethod,
    setCustomerInfo,
    setDeliveryAddress,
    setPaymentMethod,
  } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const deliveryFee = 2.50; // Fixed for now
  const grandTotal = total + deliveryFee;
  
  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setCurrentStep('address');
  };
  
  const handleAddressSubmit = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    setCurrentStep('payment');
  };
  
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    if (method === 'whatsapp') {
      handleWhatsAppOrder();
    } else if (method === 'stripe') {
      setCurrentStep('stripe-payment');
    }
  };
  
  const handleWhatsAppOrder = () => {
    if (!customerInfo || !deliveryAddress) return;
    
    const itemList = items
      .map((item) => {
        let custom = '';
        if (item.customization) {
          const { spiceLevel, specialInstructions, extras } = item.customization;
          const parts = [];
          if (spiceLevel) parts.push(`Spice: ${spiceLevel}`);
          if (specialInstructions) parts.push(`Note: ${specialInstructions}`);
          if (extras?.length) parts.push(`Extras: ${extras.join('/')}`);
          if (parts.length) custom = ` (${parts.join(', ')})`;
        }
        return `${item.quantity} x ${item.menuItem.name}${custom}`;
      })
      .join(', ');
    
    const addressStr = `${deliveryAddress.street}${deliveryAddress.apartment ? ', ' + deliveryAddress.apartment : ''}, ${deliveryAddress.postalCode} ${deliveryAddress.city}`;
    
    const message = encodeURIComponent(
      `Hi, I would like to order:\n\n` +
      `Name: ${customerInfo.name}\n` +
      `Phone: ${customerInfo.phone}\n` +
      `Email: ${customerInfo.email}\n` +
      `Delivery Address: ${addressStr}\n\n` +
      `Order: ${itemList}\n\n` +
      `Subtotal: €${total.toFixed(2)}\n` +
      `Delivery Fee: €${deliveryFee.toFixed(2)}\n` +
      `Total: €${grandTotal.toFixed(2)}`
    );
    
    window.open(`https://wa.me/351920617185?text=${message}`, '_blank');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <CheckoutStepIndicator currentStep={currentStep} />
      
      {/* Cart Review */}
      {currentStep === 'cart' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <ul className="space-y-3 mb-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity} x {item.menuItem.name}
                        {item.customization && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({item.customization.spiceLevel})
                          </span>
                        )}
                      </span>
                      <span>€{item.totalPrice.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>€{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setCurrentStep('customer')} 
                  className="w-full mt-6"
                  size="lg"
                >
                  Continue to Customer Info
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Customer Info */}
      {currentStep === 'customer' && (
        <CustomerInfoForm 
          initialData={customerInfo || undefined}
          onSubmit={handleCustomerInfoSubmit}
          onBack={() => setCurrentStep('cart')}
        />
      )}
      
      {/* Delivery Address */}
      {currentStep === 'address' && (
        <DeliveryAddressForm 
          initialData={deliveryAddress || undefined}
          onSubmit={handleAddressSubmit}
          onBack={() => setCurrentStep('customer')}
        />
      )}
      
      {/* Payment Method */}
      {currentStep === 'payment' && (
        <PaymentMethodSelector 
          onSelect={handlePaymentMethodSelect}
          onBack={() => setCurrentStep('address')}
          total={grandTotal}
        />
      )}
      
      {/* Stripe Payment */}
      {currentStep === 'stripe-payment' && customerInfo && deliveryAddress && (
        <StripeProvider>
          <StripePaymentForm 
            orderItems={items}
            customerInfo={customerInfo}
            deliveryAddress={deliveryAddress}
            total={grandTotal}
            onBack={() => setCurrentStep('payment')}
          />
        </StripeProvider>
      )}
    </div>
  );
}
