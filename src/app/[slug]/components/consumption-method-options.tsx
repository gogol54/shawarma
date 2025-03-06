import { ConsumptionMethod } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConsumptionMethodOptionProp {
  slug: string;
  imageUrl: string;
  imageAlt: string;
  option: ConsumptionMethod;
}

const ConsumptionMethodOption = ({
  imageUrl, 
  imageAlt, 
  option, 
  slug 
} : ConsumptionMethodOptionProp ) => {
  return ( 
    <Card>
      <CardContent className="flex flex-col items-center gap-8 py-8">
        <div className="relative h-[80px] w-[80px]">
          <Image
            src={imageUrl}
            fill
            className="object-contain"
            alt={imageAlt}
          />
        </div>
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`${slug}/menu?consumptionMethod=${option}`}>{option === 'dine_in' ? 'Retirar no local' : 'Entrega 🛵'}</Link>
        </Button>
      </CardContent>
    </Card>
   )
}
 
export default ConsumptionMethodOption;