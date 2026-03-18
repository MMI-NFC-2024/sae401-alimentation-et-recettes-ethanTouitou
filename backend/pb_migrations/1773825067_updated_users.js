/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select4020398583",
    "maxSelect": 1,
    "name": "sex",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "homme",
      "femme"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number2704281778",
    "max": null,
    "min": null,
    "name": "age",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number3310020690",
    "max": null,
    "min": null,
    "name": "height_cm",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "number2654930660",
    "max": null,
    "min": null,
    "name": "weight_kg",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "select2229861024",
    "maxSelect": 1,
    "name": "activity_level",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "sedentaire",
      "leger",
      "modere",
      "eleve",
      "tres-eleve"
    ]
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "select3622176189",
    "maxSelect": 1,
    "name": "nutrition_goal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "perte-de-poids",
      "maintien",
      "prise-de-masse"
    ]
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number1345260106",
    "max": null,
    "min": null,
    "name": "bmi",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3347810418",
    "max": 0,
    "min": 0,
    "name": "bmi_category",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "number991769388",
    "max": null,
    "min": null,
    "name": "maintenance_calories",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "number4291749736",
    "max": null,
    "min": null,
    "name": "target_calories",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select4020398583")

  // remove field
  collection.fields.removeById("number2704281778")

  // remove field
  collection.fields.removeById("number3310020690")

  // remove field
  collection.fields.removeById("number2654930660")

  // remove field
  collection.fields.removeById("select2229861024")

  // remove field
  collection.fields.removeById("select3622176189")

  // remove field
  collection.fields.removeById("number1345260106")

  // remove field
  collection.fields.removeById("text3347810418")

  // remove field
  collection.fields.removeById("number991769388")

  // remove field
  collection.fields.removeById("number4291749736")

  return app.save(collection)
})
