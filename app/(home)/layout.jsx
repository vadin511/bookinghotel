"use client";

import Footer from "../../components/common/footer/Footer";
import Header from "../../components/common/header/Header";

function HomeLayout({ children }) {
  // const router = useRouter();
  // const dispatch = useDispatch();
  // const user = useSelector(selectUser);

  // useEffect(() => {
  //   dispatch(fetchUserProfile());
  // }, [dispatch]);

  // useEffect(() => {
  //   if (user?.role_id === "user") {
  //     router.push("/");
  //   } else if (user?.role_id === "admin") {
  //     router.push("/admin");
  //   }
  // }, [user]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default HomeLayout;
