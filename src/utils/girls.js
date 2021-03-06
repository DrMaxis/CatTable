const girls = [
    {
        "name": "Mae",
        "rarity": "0",
        "characterID": "0",
        "avi": "https://www.catgirl.io/images/catgirls/mae/mae.png",
        "season": "1"
    },
    {
        "name": "Lisa",
        "rarity": "0",
        "characterID": "1",
        "avi": "https://www.catgirl.io/images/catgirls/lisa/lisa.png",
        "season": "1"
    },
    {
        "name": "Kita",
        "rarity": "1",
        "characterID": "0",
        "avi": "https://www.catgirl.io/images/catgirls/kita/kita-web.png",
        "season": "1"
    },
    {
        "name": "Aoi",
        "rarity": "1",
        "characterID": "1",
        "avi": "https://www.catgirl.io/images/catgirls/aoi/aoi.png",
        "season": "1"
    },
    {
        "name": "Hana",
        "rarity": "2",
        "characterID": "0",
        "avi": "https://www.catgirl.io/images/catgirls/hana/hana.png",
        "season": "1"
    },
    {
        "name": "Rin",
        "rarity": "2",
        "characterID": "1",
        "avi": "https://www.catgirl.io/images/catgirls/rin/rin.png",
        "season": "1"
    },
    {
        "name": "Celeste",
        "rarity": "3",
        "characterID": "0",
        "avi": "/assets/celeste.png",
        "season": "1"
    },
    {
        "name": "Mittsy",
        "rarity": "4",
        "characterID": "0",
        "avi": "/assets/mittsy.png",
        "season": "1"
    }
]


exports.girls = girls.map(function (catgirl) {
    return {
        avi: catgirl.avi,
        characterId: catgirl.characterID,
        name: catgirl.name,
        rarity: catgirl.rarity,
        season: catgirl.season

    }
});