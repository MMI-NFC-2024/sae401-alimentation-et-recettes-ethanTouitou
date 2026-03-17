/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4122981313");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "1 = 0",
    "deleteRule": "1 = 0",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      }
    ],
    "id": "pbc_4122981313",
    "indexes": [],
    "listRule": "",
    "name": "recipe_ingredients",
    "system": false,
    "type": "base",
    "updateRule": "1 = 0",
    "viewRule": ""
  });

  return app.save(collection);
})
