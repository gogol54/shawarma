import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProductPage = () => {
  return (
    <div className="rounded-xl border border-red-500 p-5">
      <h1 className="text-red-500">products page</h1>
      <Button>Test BTN</Button>
      <Input placeholder="Bora tancar esse projeto!" />
    </div>
  );
};

export default ProductPage;
