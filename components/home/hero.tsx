import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { FeaturedProduct } from "@/components/home/featured-product";

export const HeroSection = async () => {
  const t = await getTranslations("home");

  return (
    <section className="relative max-w-full mx-auto overflow-hidden mt-4 mb-10">
      <div className="bg-white flex justify-between items-center ">
        <h1 className="text-black text-xl md:text-5xl font-black italic text-left mb-[31px] ml-[8px]">
          {t("defineYourStyle")}
        </h1>
        <h1 className="text-black text-xl md:text-5xl font-black italic mb-[20px]">
          {t("ownYourWorld")}
        </h1>
      </div>

      {/* Black bg here */}
      <div className="bg-amber-950 min-h-[175px] min-w-[370px] rounded-2xl p-4 justify-between">
        <h4 className="text-white text-justify font-black italic">{t("featured")}</h4>
        <FeaturedProduct />
      </div>

      <div className="absolute inset-x-0 -top-[3px] flex right-25 justify-center pointer-events-none z-10 ">
        <div className="relative w-[132px] md:w-[420px] h-[600px]">
          <Image
            src="/images/hero/shirt-model.jpg" // The fully transparent PNG cutout
            alt="Model"
            fill
            priority
            className="object-contain object-top"
          />
        </div>
            <div className="bg-black flex justify max-h-[0px] max-w-[130px]">
                <Button className="absolute hover: bg-white mt-45 mr-3 text-black">{t("explore")}</Button>
                <h4 className="text-white font-black italic text-[16px] mt-18">{t("whereComfort")}<br/>{t("meetsConfidence")}<br/></h4>
            </div>
      </div>

    </section>
  );
};