/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4081397366")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number2392207156",
    "max": null,
    "min": null,
    "name": "sodium_per_100g",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4081397366")

  // remove field
  collection.fields.removeById("number2392207156")

  return app.save(collection)
})
