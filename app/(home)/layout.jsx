import Footer from "../../components/common/footer/Footer";
import Header from "../../components/common/header/Header";

function HomeLayout({ children }) {
  
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default HomeLayout;
