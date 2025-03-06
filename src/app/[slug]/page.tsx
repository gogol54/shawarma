import Image from "next/image";
import { notFound } from "next/navigation";

import { getRestaurantBySlug } from "../data/actions_restaurant";
import ConsumptionMethodOption from "./components/consumption-method-options";

interface RestaurantsPageProps {
  params: Promise<{ slug: string }>;
}
const RestaurantsPage = async ({ params }: RestaurantsPageProps) => {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if(!restaurant){
    return notFound()
  }
  return (
    <div className="flex flex-col items-center justify-center-px-6 pt-24">
      <div className="flex flex-col items-center gap-2">
          <Image 
            src={restaurant?.avatarImageUrl}
            alt={restaurant?.name}
            width={82}
            height={82}
          />
          <h2 className="font-semibold">{restaurant.name}</h2>
      </div>
      <div className="pt-24 text-center space-y-2">
        <h3 className="text-2xl font-semibold">
          Seja Bem-vindo!
        </h3>
        <p className="opacity-55">
          Escolha como prefere aproveitar sua refeição. Estamos aqui para
          oferecer praticidade e sabor em cada detalhe!
        </p>
      </div>
      <div className="pt-14 grid grid-cols-2 gap-4">
        <ConsumptionMethodOption 
          slug={slug}
          buttonText="Retirar no local"
          option="dine_in"
          imageAlt="Retirar no local"
          imageUrl="/dine_in.png"
        />
        <ConsumptionMethodOption
          slug={slug}
          option="takeaway" 
          buttonText="Entrega 🛵"
          imageAlt="Tele entrega"
          imageUrl="/takeaway.png"
        />
      </div>
    </div>
  )
};

export default RestaurantsPage;
