// ok as you can see this is the code for this vocation project
// its a pokemon battle sim yeyeyyyyy
// ive been longing to make this for a long time
// lets see if i get this right

import { resolve } from 'path';
import { ask, endrl } from './ask.js';
import fs from 'fs';
import { type } from 'os';
// package
const types = JSON.parse(fs.readFileSync('./src/types.json', 'utf-8'))
const moves = JSON.parse(fs.readFileSync('./src/moves.json', 'utf-8'))
const pokemons = JSON.parse(fs.readFileSync("./src/pokemons.json", 'utf-8'))
function sleep(ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    })
}

// console.log(Object.keys(pokemons))


class Pokemon {
    #name;
    #type;
    #maxHp;
    #currentHp;
    #attack;
    #defense;
    #specialAttack;
    #specialDefense;
    #speed;
    #moves; 
    //encapsulation
    constructor(data) {
        this.#name = data.name;
        this.#type = data.type;
        this.#maxHp = data.stats.hp;
        this.#currentHp = data.stats.hp;
        this.#attack = data.stats.attack;
        this.#defense = data.stats.defense;
        this.#specialAttack = data.stats.specialAttack;
        this.#specialDefense = data.stats.specialDefense;
        this.#speed = data.stats.speed;
        this.#moves = data.moves.map((move) => ({
            ...moves[move], currentpp: moves[move].pp
        }))
    }

    //getters
    getName() {
        return this.#name;
      }
    
    getType() {
        return this.#type;
      }
    
    getCurrentHp() {
        return this.#currentHp;
      }
      //abstraction
    
    getMaxHp() {
        return this.#maxHp;
      }

      getMoves() {
        return this.#moves;
      }

    getStat(statName) {
        return {
          attack: this.#attack,
          defense: this.#defense,
          specialAttack: this.#specialAttack,
          specialDefense: this.#specialDefense,
          speed: this.#speed
        }[statName];
    }
    //abstraction

    getAttacked(damage) {
        this.#currentHp = Math.max(0, this.#currentHp - damage);
    }

    isFainted() {
        return this.#currentHp <= 0;
    }
}

class pokeBattle {

    constructor() {
        this.playerPoke = null;
        this.enemyPoke = null;
        this.isPlayerturn = true;
    }

    async startgame() {
        console.log("=====THE GAME BEGINS=======")
        await this.selectPlayerPokemon()
        console.log("Now its your Opponent turn to pick their pokemon")
        await sleep(1000);
        await this.selectEnemyPokemon()

        console.log(`so it will be ${this.playerPoke.getName()} vs ${this.enemyPoke.getName()}`)
        await sleep(1000);
        console.log("Battle Start!!!")
        await sleep(1000);

        this.battleLoop()
    }

    async selectPlayerPokemon() {
        console.log("Available Pokemon: ")
        await sleep(500);
        Object.values(pokemons).map((pokemon, index) => {
            console.log(`${index + 1} ${pokemon.name} : ${pokemon.type} Type`)
            
        })
        await sleep(1000);
        console.log("======Choose Your Pokemon======")
        await sleep(1000);
        const answer = await ask(`Type a number from 1 - ${Object.keys(pokemons).length}: `)
        await sleep(1000);
        if(isNaN(answer) || answer <= 0 || answer > Object.keys(pokemons).length) {
            console.log("Heyyy Thats not on the list. Focus idiot!, ill restart it for you")
            await sleep(500);
            return await this.selectPlayerPokemon()
        }
        const selectedIndex = answer - 1;
        
        this.playerPoke = new Pokemon(Object.values(pokemons)[selectedIndex])
        console.log(`So you choose ${this.playerPoke.getName()} huh? interesting`)
        await sleep(1000);
    };

    async selectEnemyPokemon() {
        const selectedIndex = Math.floor(Math.random() * Object.keys(pokemons).length)
        if(isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex > Object.keys(pokemons).length) {
            console.log("IDK how, But the bot just pick a invalid number on the list, well this isnt supposed to happen, but here we are :< (my algs sucks)")
            await sleep(1000);
            console.log("Lets give the bot Another Chance this time.")
            return await this.selectEnemyPokemon()
        }
        await sleep(1000);
        this.enemyPoke = new Pokemon(Object.values(pokemons)[selectedIndex])
        console.log(`The Enemy Choose ${this.enemyPoke.getName()}`)
        await sleep(1000);
    }

    battleStatus() {
        console.log(`\n${this.playerPoke.getName()} (Player): ${this.playerPoke.getCurrentHp()}/${this.playerPoke.getMaxHp()} HP`);
        console.log(`${this.enemyPoke.getName()} (enemy): ${this.enemyPoke.getCurrentHp()}/${this.enemyPoke.getMaxHp()} HP`);

    }

    async battleLoop() {
        if (this.playerPoke.isFainted() || this.enemyPoke.isFainted()) {
            return;
        }
        this.battleStatus()

        if(this.isPlayerturn) {
            await this.#playerTurn()
            this.isPlayerturn = false
        } else {
            await this.#enemyTurn()
            this.isPlayerturn = true
        }


        if(this.playerPoke.isFainted()) {
            console.log(`Noob! your ${this.playerPoke.getName()} Has Fainted`)
            await sleep(1000);
            console.log("So you loose the battle")
            await this.#endGame()
        } else if(this.enemyPoke.isFainted()) {
            console.log(`Nice!! the enemy ${this.enemyPoke.getName()} Has Fainted`)
            await sleep(1000);
            console.log("You Won The Battle")
            await this.#endGame()
        }
        
        await this.battleLoop()
    }

    async #playerTurn() {
        console.log(" ==== Your Trun ===")
        console.log("Movesets: ")
        await sleep(500);
        
        this.playerPoke.getMoves().map((move, index) => {
            console.log(`${index + 1} ${move.name} (${move.type}, Power: ${move.power}, PP: ${move.currentpp}/${move.pp})`)
        })
        await sleep(1000);

        const answer = await ask(`Pick one from 1 - ${this.playerPoke.getMoves().length}: `)
        const selection = parseInt(answer) - 1;
        await sleep(1000);

        if (isNaN(selection) || selection < 0 || selection >= this.playerPoke.getMoves().length) {
            console.log("Seriously -_- -_- -_-.");
            console.log("Pick Something From the list Please")
            return await this.#playerTurn();
          }
        
        const selectedMove = this.playerPoke.getMoves()[selection]
        if(selectedMove.currentpp <= 0) {
            console.log("Theres no pp left you dummy. Choose another one")
            await sleep(1000);
            return await this.#playerTurn();
        }

        selectedMove.currentpp--;

        await this.#executeAttack(this.playerPoke, this.enemyPoke, selectedMove)
    }

    async #enemyTurn() {
        console.log("=== Enemy Turn ==")
        await sleep(500);
        const selectedMove = this.enemyPoke.getMoves()[Math.floor(Math.random() * this.enemyPoke.getMoves().length)]
        console.log(`enemy ${this.enemyPoke.getName()} used ${selectedMove.name}`)
        await sleep(500);

        selectedMove.currentpp--;
        await this.#executeAttack(this.enemyPoke, this.playerPoke, selectedMove)
    }

    async #executeAttack(attacker, defender, move) {
        const typeEffectiveness = types[move.type][defender.getType()]
        let damage = 0;

        if (move.category === "physical") {
            damage = Math.floor((((2 * 50 / 5 + 2) * move.power * attacker.getStat("attack") / defender.getStat("defense")) / 50) + 2);
        } else if (move.category === "special") {
            damage = Math.floor((((2 * 50 / 5 + 2) * move.power * attacker.getStat("specialAttack") / defender.getStat("specialDefense")) / 50) + 2);
        }

        damage = Math.floor(damage * typeEffectiveness);

        const isCritical = Math.random() < (move.critRatio ? 1/8 : 1/16);
        if (isCritical) {
          damage = Math.floor(damage * 1.5);
          console.log("A critical hit!");
        }

        // ini akurat kek di game btw
        damage = Math.floor(damage * (0.85 + Math.random() * 0.15));
    
        damage = Math.max(1, damage);

        defender.getAttacked(damage)

        if (typeEffectiveness > 1) {
        console.log("It's super effective!");
        await sleep(1000);
        } else if (typeEffectiveness < 1 && typeEffectiveness > 0) {
        console.log("It's not very effective...");
        await sleep(1000);
        } else if (typeEffectiveness === 0) {
        console.log(`It doesn't affect ${defender.getName()} at all ...`);
        console.log("Learn Your Type Chart!! ")
        await sleep(1000);
        }
        
        console.log(`${defender.getName()} took ${damage} damage!`);
        await sleep(1000);
    } 

    async #endGame() {
        console.log("=====The Game Is Over======")
        await endrl()
    }
};

const game = new pokeBattle()
game.startgame()
