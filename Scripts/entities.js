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
  create(entity) {
    let definiton = entities.definitions[entity.name];

    if (!definition) {
      console.log("Undefined Entity Name", entity.name);
      return;
    }
    switch (entity.type) {
      case "block":
        entity.health = definiton.fullHealth;
        entity.fullHealth = definiton.fullHealth;
        entity.shape = "rectangle";
        entity.sprite = loader.loadImage(`Images/entities/${entity.name}.png`);

        box2d.createRectangle(entity, definiton);
        break;
      case "ground":
        entity.shape = "rectangle";
        box2d.createRectangle(entity, definiton);
        break;
      case "hero":
      case "villain":
        entity.health = definiton.fullHealth;
        entity.fullHealth = definiton.fullHealth;
        entity.sprite = loader.loadImage(`Images/entities/${entity.name}.png`);
        entity.shape = definition.shape;
        if (definition.shape === "circle") {
          entity.radius = definition.radius;
          box2d.createCircle(entity, definition);
        } else if (definition.shape === "rectangle") {
          entity.width = definition.width;
          entity.height = definition.height;
          box2d.createRectangle(entity, definition);
        }
        break;

      default:
        console.log("Undefined Entity Type", entity.type)
        break;
    }
  },
  draw(entity, position, angle) {},
};
