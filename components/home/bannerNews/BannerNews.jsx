import Image from "next/image";
import imgBannerNews from "../../../public/assets/images/imgBannerNews.jpg";

const BannerNews = () => {
  return (
    <div className="pt-[40px] pb-[40px]">
      <div className=" bg-[#f1ede8] rounded-lg p-8 text-center text-[#5a4634] select-none">
        <p className="mb-10 text-2xl leading-relaxed">
          Booking through our website will open many
          <br />
          doors for you. You will receive very important advantages.
        </p>
        <div className="flex flex-row justify-evenly items-center">
          <div className=" flex-row gap-10 justify-evenly  space-x-12">
            <div className="flex flex-col  items-center text-2xl  mb-8 md:mb-0">
              <span className="mb-1 text-2xl">①</span>
              <p>
                <strong>Mejor precio</strong>
                <br />
                You will enjoy a more economical stay.sdfdsvdsvsdvsdv
              </p>
            </div>
            <div className="flex flex-col items-center text-2xl  mb-8 md:mb-0">
              <span className="mb-1 text-2xl">②</span>
              <p>
                <strong>Free cancellation 24h.</strong>
                <br />
                If you have to cancel, it’s free for you.
              </p>
            </div>
          </div>
          <div className="hidden md:block max-w-[360px]">
            <Image alt="imgBannerNews" src={imgBannerNews} />
          </div>
          <div className=" gap-10 md:flex-row md:justify-center md:items-center md:space-x-12 mt-6 mb-6">
            <div className="flex flex-col items-center text-2xl  mb-8 md:mb-0">
              <span className="mb-1 text-2xl">③</span>
              <p>
                <strong>Better room</strong>
                <br />
                the room category for free. If there is availability.ory for
                free.
              </p>
            </div>
            <div className="flex flex-col items-center text-2xl  mb-8 md:mb-0">
              <span className="mb-1 text-2xl">④</span>
              <p>
                <strong>Free Late Checkout</strong>
                <br />
                Si la habitación está disponible,you can extend for a few hours
                .
              </p>
            </div>
          </div>
        </div>
        <button
          className="mt-8 bg-[#5a4634] text-white text-2xl font-semibold rounded-full px-6 py-2"
          type="button"
        >
          See Offers
        </button>
      </div>
    </div>
  );
};

export default BannerNews;
