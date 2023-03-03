async function getSpecies(species){
    footerP("Fetching species")
    const rawSpecies = await fetch(`https://raw.githubusercontent.com/${repo}/species.h`)
    const textSpecies = await rawSpecies.text()

    return regexSpecies(textSpecies, species)
}


async function getBaseStats(species){
    footerP("Fetching base stats")
    const rawBaseStats = await fetch(`https://raw.githubusercontent.com/${repo}/base_stats.h`)
    const textBaseStats = await rawBaseStats.text()
    return regexBaseStats(textBaseStats, species)
}

async function getLevelUpLearnsets(species){
    footerP("Fetching level up learnsets")
    const rawLevelUpLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_learnsets.h`)
    const textLevelUpLearnsets = await rawLevelUpLearnsets.text()

    const rawLevelUpLearnsetsPointers = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_learnset_pointers.h`)
    const textLevelUpLearnsetsPointers = await rawLevelUpLearnsetsPointers.text()


    const levelUpLearnsetsConversionTable = getLevelUpLearnsetsConversionTable(textLevelUpLearnsetsPointers)


    return regexLevelUpLearnsets(textLevelUpLearnsets, levelUpLearnsetsConversionTable, species)
}

async function getTMHMLearnsets(species){
    footerP("Fetching TMHM learnsets")
    const rawTMHMLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/tmhm_learnsets.h`)
    const textTMHMLearnsets = await rawTMHMLearnsets.text()

    const TMHMLearnsetsConversionTable = getTMHMLearnsetsConversionTable(textTMHMLearnsets)

    return regexTMHMLearnsets(textTMHMLearnsets, TMHMLearnsetsConversionTable, species)
}

async function getEvolution(species){
    footerP("Fetching evolution line")
    const rawEvolution = await fetch(`https://raw.githubusercontent.com/${repo}/evolution.h`)
    const textEvolution = await rawEvolution.text()

    return regexEvolution(textEvolution, species)
}

async function getForms(species){
    footerP("Fetching alternate forms")
    const rawForms = await fetch(`https://raw.githubusercontent.com/${repo}/form_species_tables.h`)
    const textForms = await rawForms.text()

    return regexForms(textForms, species)
}

async function getEggMovesLearnsets(species){
    footerP("Fetching egg moves learnsets")
    const rawEggMoves = await fetch(`https://raw.githubusercontent.com/${repo}/egg_moves.h`)
    const textEggMoves = await rawEggMoves.text()

    return regexEggMovesLearnsets(textEggMoves, species)
}

async function getTutorLearnsets(species){
    footerP("Fetching tutor learnsets")
    const rawTutorLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/tutor_learnsets.h`)
    const textTutorLearnsets = await rawTutorLearnsets.text()

    const tutorLearnsetsConversionTable = getTutorLearnsetsConversionTable(textTutorLearnsets)

    return regexTutorLearnsets(textTutorLearnsets, tutorLearnsetsConversionTable, species)
}

async function getSprite(species){
    footerP("Fetching sprites... this could take a while")
    const rawFrontPicTable = await fetch(`https://raw.githubusercontent.com/${repo}/front_pic_table.h`)
    const textFrontPicTable = await rawFrontPicTable.text()

    const rawSprite = await fetch(`https://raw.githubusercontent.com/${repo}/pokemon.h`)
    const textSprite = await rawSprite.text()

    const spriteConversionTable = getSpriteConversionTable(textFrontPicTable, species)

    return regexSprite(textSprite, spriteConversionTable, species)
}

async function getChanges(species, url){
    footerP("Fetching species changes")
    const rawChanges = await fetch(url)
    const textChanges = await rawChanges.text()
    return regexChanges(textChanges, species)
}






async function buildSpeciesObj(){
    let species = {}
    species = await getSpecies(species)
    
    species = await initializeSpeciesObj(species)
    species = await getEvolution(species)
    species = await getForms(species) // should be called in that order until here
    species = await getBaseStats(species)
    species = await getChanges(species, "https://raw.githubusercontent.com/rh-hideout/pokeemerald-expansion/master/src/data/pokemon/species_info.h")
    species = await getLevelUpLearnsets(species)
    species = await getTMHMLearnsets(species)
    species = await getEggMovesLearnsets(species)
    species = await getTutorLearnsets(species)
    species = await getSprite(species)




    delete species["SPECIES_ZYGARDE_CELL"]
    delete species["SPECIES_ZYGARDE_CORE"]


    Object.keys(species).forEach(name => {
        if(species[name]["type1"] === "TYPE_FIRE" || species[name]["type2"] === "TYPE_FIRE"){
            if(!species[name]["tutorLearnsets"].includes("MOVE_BURN_UP"))
                species[name]["tutorLearnsets"].push("MOVE_BURN_UP")
        }
        if(species[name]["type1"] === "TYPE_DRAGON" || species[name]["type2"] === "TYPE_DRAGON"){
            if(!species[name]["tutorLearnsets"].includes("MOVE_DRACO_METEOR"))
                species[name]["tutorLearnsets"].push("MOVE_DRACO_METEOR")
        }
        species[name]["TMHMLearnsets"].sort(function(a,b) {
            a = parseInt(a[1].match(/\d+/)[0])
            b = parseInt(b[1].match(/\d+/)[0])

            return a - b
        })
        species[name]["TMHMLearnsets"].sort(function(a,b) {
            if(a[1].includes("TM")){
                a = 1
            }
            else{
                a = 2
            }
            if(b[1].includes("TM")){
                b = 1
            }
            else{
                b = 2
            }

            return a - b
        })
    })

    await localStorage.setItem("species", LZString.compressToUTF16(JSON.stringify(species)))
    return species
}


function initializeSpeciesObj(species){
    footerP("Initializing species")
    for (const name of Object.keys(species)){
        species[name]["baseHP"] = 0
        species[name]["baseAttack"] = 0
        species[name]["baseDefense"] = 0
        species[name]["baseSpAttack"] = 0
        species[name]["baseSpDefense"] = 0
        species[name]["baseSpeed"] = 0
        species[name]["BST"] = 0
        species[name]["abilities"] = []
        species[name]["innates"] = []
        species[name]["type1"] = ""
        species[name]["type2"] = ""
        species[name]["item1"] = ""
        species[name]["item2"] = ""
        species[name]["eggGroup1"] = ""
        species[name]["eggGroup2"] = ""
        species[name]["changes"] = []
        species[name]["levelUpLearnsets"] = []
        species[name]["TMHMLearnsets"] = []
        species[name]["eggMovesLearnsets"] = []
        species[name]["tutorLearnsets"] = []
        species[name]["evolution"] = []
        species[name]["evolutionLine"] = [name]
        species[name]["forms"] = []
        species[name]["sprite"] = ""
    }
    delete species["SPECIES_NONE"]
    delete species["SPECIES_EGG"]
    return species
}


async function fetchSpeciesObj(){
    if(!localStorage.getItem("species"))
        window.species = await buildSpeciesObj()
    else
        window.species = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("species")))


    window.spritesObj = {}
    if(localStorage.getItem("sprites")){
        spritesObj = JSON.parse(localStorage.getItem("sprites"))
        Object.keys(spritesObj).forEach(species => {
            spritesObj[species] = LZString.decompressFromUTF16(spritesObj[species])
        })
    }

    await displaySpecies()
}
