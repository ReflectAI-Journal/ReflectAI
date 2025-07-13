import { useEffect, useState } from 'react';

interface CheckoutButtonProps {
  productId: string;
  price?: string;
}

export function CheckoutButton({ productId, price = '$29' }: CheckoutButtonProps) {
  const [lemonLoaded, setLemonLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    script.onload = () => {
      setLemonLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {lemonLoaded ? (
        <a
          href={`https://reflectai.lemonsqueezy.com/checkout/buy/${productId}`}
          className="lemonsqueezy-button"
        >
          Buy Now {price}
        </a>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}