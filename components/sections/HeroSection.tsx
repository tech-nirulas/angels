"use client";

import { Box, Button } from "@mui/material";
import Slider, { Settings } from "react-slick";

export default function HeroSection() {
  const settings: Settings = {
    // autoplay: true,
    // autoplaySpeed: 3000,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const data = [
    {
      image: "/assets/hero_section/Big boy.jpg",
      title: "Big Boy",
      description: "A towering chocolate masterpiece with layers of rich ganache and moist cake, crowned with a glossy chocolate glaze and adorned with chocolate shavings.",
    },
    {
      image: "/assets/hero_section/Jus Chkn.jpg",
      title: "Jus Chkn",
      description: "A savory delight featuring tender, juicy chicken marinated in a blend of herbs and spices, slow-cooked to perfection and served with a rich, flavorful jus.",
    },
    {
      image: "/assets/hero_section/Healthy high.jpg",
      title: "Healthy High",
      description: "A guilt-free indulgence packed with nutrient-rich ingredients like oats, nuts, and dried fruits, sweetened naturally with honey or maple syrup for a wholesome treat.",
    },
  ]

  return (
    <Box sx={{ width: "100%", height: "70vh" }} id="home">
      <Slider {...settings}>
        {data.map((item, index) => (
          <Box sx={{ width: "100%", height: "70vh", backgroundImage: `url('${item.image}')`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", position: "relative" }} key={index}>
            <Box sx={{ display: "flex", gap: 2, position: "absolute", bottom: "20%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <Button variant="contained" color="primary">
                Order Now
              </Button>
              <Button
                href="#order"
                sx={{
                  backgroundColor: "var(--color-accent-cream)",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "var(--color-accent-cream)"
                  }
                }}>
                Customize Cake
              </Button>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}