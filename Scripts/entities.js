const entities = {
  definitions: {
    glass: {
      fullHealth: 100,
      density: 2.4,
      friction: 0.4,
      restitution: 0.15,
    },
    wood: {
      fullHealth: 500,
      density: 0.7,
      friction: 0.4,
      restitution: 0.4,
    },
    dirt: {
      density: 3.0,
      friction: 1.5,
      restitution: 0.2,
    },
    burger: {
      shape: "circle",
      fullHealth: 40,
      radius: 25,
      density: 1,
      friction: 0.5,
      restitution: 0.4,
    },
    sodacan: {
      shape: "rectangle",
      fullHealth: 80,
      width: 40,
      height: 60,
      density: 1,
      friction: 0.5,
      restitution: 0.7,
    },
    fries: {
      shape: "rectangle",
      fullHealth: 50,
      width: 40,
      height: 50,
      density: 1,
      friction: 0.5,
      restitution: 0.6,
    },
    apple: {
      shape: "circle",
      radius: 25,
      density: 1.5,
      friction: 0.5,
      restitution: 0.4,
    },
    orange: {
      shape: "circle",
      radius: 25,
      density: 1.5,
      friction: 0.5,
      restitution: 0.4,
    },
    strawberry: {
      shape: "circle",
      radius: 15,
      density: 2.0,
      friction: 0.5,
      restitution: 0.4,
    },
  },
  create(entity){

  },
  draw(entity,position,angle){}
};
