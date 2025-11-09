import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Clock } from 'lucide-react';
import { Order } from '@/types/order';
import useCartStore from '@/stores/cartStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  // Support both order_number (from Stripe) and orderNumber (legacy)
  const orderNumber = searchParams.get('order_number') || searchParams.get('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearCart = useCartStore(state => state.clearCart);
  const clearCheckoutData = useCartStore(state => state.clearCheckoutData);
  
  useEffect(() => {
    console.log('OrderConfirmation: orderNumber =', orderNumber);
    console.log('OrderConfirmation: URL params =', Object.fromEntries(searchParams.entries()));
    
    if (!orderNumber) {
      console.error('OrderConfirmation: No order number in URL');
      setError('No order number provided');
      setLoading(false);
      return;
    }
    
    console.log('OrderConfirmation: Fetching order from API...');
    fetch(`${API_BASE_URL}/orders/number/${orderNumber}`)
      .then(res => {
        console.log('OrderConfirmation: Response status =', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('OrderConfirmation: Order data received:', data);
        setOrder(data);
        setLoading(false);
        
        // Clear cart and checkout data after successful order
        console.log('OrderConfirmation: Clearing cart and checkout data');
        clearCart();
        clearCheckoutData();
      })
      .catch(err => {
        console.error('OrderConfirmation: Failed to load order:', err);
        setError(err.message || 'Failed to load order');
        setLoading(false);
      });
  }, [orderNumber, clearCart, clearCheckoutData]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading your order...</p>
            <p className="text-sm text-gray-400 mt-2">Order Number: {orderNumber}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">
              {error || 'Order not found'}
            </p>
            <p className="text-center text-gray-600 mb-4">
              Order Number: {orderNumber || 'Not provided'}
            </p>
            <Link to="/menu" className="block">
              <Button className="w-full">Back to Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your order. We'll start preparing it right away!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold">{order.orderNumber}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.street}
                    {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">30-45 minutes</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <ul className="space-y-2">
                {(order.orderItems as any).map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} x {item.name}
                      {item.spiceLevel !== undefined && item.spiceLevel !== null && (
                        <span className="text-gray-500 ml-2">(Spice: {item.spiceLevel}%)</span>
                      )}
                    </span>
                    <span>€{item.totalPrice.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee:</span>
                <span>€{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total {order.paymentStatus === 'SUCCEEDED' ? 'Paid' : ''}:</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                {order.paymentStatus === 'SUCCEEDED' ? (
                  <>A confirmation email has been sent to <strong>{order.customerEmail}</strong></>
                ) : (
                  <>We'll confirm your order via WhatsApp at <strong>{order.customerPhone}</strong></>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link to="/menu" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
