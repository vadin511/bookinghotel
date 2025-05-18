"use client";

const Footer = () => {
  return (
    <div className="w-full bg-[#4e3520]  text-white pt-10 ">
      <div>
        <div>
          <h1 className="font-luckiest text-3xl mb-8 md:mb-0 md:flex-1 text-center ">
            BYPILLOW
          </h1>
        </div>
        <div className="">
          <div className="flex flex-col md:flex-row md:flex-2 justify-evenly max-w-7xl gap-10 md:gap-20 text-white text-lg mx-auto p-5 md:mx-0">
            <ul className="space-y-1 md:w-48">
              <li>Legal Notice</li>
              <li>Manage consent</li>
              <li>Disclaimer</li>
              <li>Privacy Policy (EU)</li>
              <li>Cookie Policy (EU)</li>
              <li>Boutique Hotels</li>
              <li>City Hotels</li>
              <li>Beach Hotels</li>
              <li>Family Hotels</li>
            </ul>
            <div className="md:w-48">
              <h2 className="mb-4 text-lg">CENTRAL OFFICES BARCELONA</h2>
              <p>Travessera de Gràcia 73, 5º</p>
              <p>08021 Barcelona</p>
              <p>Spain</p>
              <h2 className="mt-8 mb-4 text-lg">SOCIAL</h2>
              <div className="flex space-x-3 text-xl">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-gray-300"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-gray-300"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="hover:text-gray-300"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <ul className="space-y-1 md:w-48">
              <li className="text-lg mb-4">CUSTOMER HELP</li>
              <li>Contact</li>
              <li>News</li>
              <li>Offers</li>
              <li>Work with us</li>
              <li>Club BYP</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-[#3a2715] text-center text-xs py-3">
        Copyright © 2025 BYPILLOW | Powered by B2 Performance
      </div>
    </div>
  );
};

export default Footer;
