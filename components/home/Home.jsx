import CategoryHotel from "../home/categoryhotel/CategoryHotel";
import BannerSlider from "./bannerSlider/BannerSlider";
import SearchRoom from "./searchRoom/SearchRoom";

const Home = () => {
  return (
    <div>
      <div className="">
        <BannerSlider />
        <div className="absolute z-50 bottom-1/8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full  max-w-7xl px-4">
          <SearchRoom />
        </div>
      </div>
      <CategoryHotel />
    </div>
  );
};

export default Home;



