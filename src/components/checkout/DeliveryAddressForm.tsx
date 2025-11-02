import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeliveryAddress } from '@/types/order';

const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

interface DeliveryAddressFormProps {
  initialData?: DeliveryAddress;
  onSubmit: (data: DeliveryAddress) => void;
  onBack: () => void;
}

export default function DeliveryAddressForm({ initialData, onSubmit, onBack }: DeliveryAddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || { country: 'Portugal' },
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="Rua Example, 123"
            />
            {errors.street && (
              <p className="text-sm text-red-600 mt-1">{errors.street.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="apartment">Apartment / Unit (Optional)</Label>
            <Input
              id="apartment"
              {...register('apartment')}
              placeholder="Apt 4B"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Lisbon"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="1000-001"
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600 mt-1">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="Portugal"
            />
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
