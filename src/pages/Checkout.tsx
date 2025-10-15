import useCartStore from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";

function generateOrderMessage(items, total) {
  if (!items.length) return "Hi, I would like to order, but my cart is empty.";
  const itemList = items
    .map((item) => {
      let custom = "";
      if (item.customization) {
        const { spiceLevel, specialInstructions, extras } = item.customization;
        const parts = [];
        if (spiceLevel) parts.push(`Spice: ${spiceLevel}`);
        if (specialInstructions) parts.push(`Note: ${specialInstructions}`);
        if (extras && extras.length) parts.push(`Extras: ${extras.join("/")}`);
        if (parts.length) custom = ` (${parts.join(", ")})`;
      }
      return `${item.quantity} x ${item.menuItem.name}${custom}`;
    })
    .join(", ");
  return `Hi, I would like to order: ${itemList}. Total price: €${total.toFixed(2)}`;
}

export default function Checkout() {
  const { items, total } = useCartStore();

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(generateOrderMessage(items, total));
    window.open(`https://wa.me/351920617185?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <ul className="mb-4">
        {items.length === 0 ? (
          <li>Your cart is empty.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="mb-2">
              {item.quantity} x {item.menuItem.name} €{item.menuItem.price.toFixed(2)}
            </li>
          ))
        )}
      </ul>
      <div className="font-semibold mb-6">Total: €{total.toFixed(2)}</div>
      <Button
        onClick={handleWhatsAppOrder}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
        disabled={items.length === 0}
      >
        Order via WhatsApp
      </Button>
    </div>
  );
}
