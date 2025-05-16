import CategoryHotel from "../home/categoryhotel/CategoryHotel"
import BannerSlider from './bannerSlider/BannerSlider'

const Home = () => {
  return (
    <div >
     <div className="relative">
      <BannerSlider />
      <CategoryHotel />
      </div>
    </div>
  )
}

export default Home
