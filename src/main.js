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
        if(this.isPlayerturn) {
            await this.#playerTurn()
            this.isPlayerturn = false
        } else {
            await this.#enemyTurn()
            this.isPlayerturn = true
        }


        if(this.playerPoke.isFainted()) {
            console.log(`Noob ${this.playerPoke.getName()} Has Fainted`)
            await sleep(1000);
            console.log("So you loose the battle")
            this.#endGame()
        } else if(this.enemyPoke.isFainted()) {
            console.log(`Nice!! ${this.enemyPoke.getName()} Has Fainted`)
            await sleep(1000);
            console.log("You Won The Battle")
            this.#endGame()
        }
        this.battleStatus()
        this.battleLoop()
    }

    async #playerTurn() {
        console.log(" ==== Your Trun ===")
        console.log("Movesets: ")
        
        this.playerPoke.getMoves().map((move, index) => {
            console.log(`${index + 1} ${move.name} (${move.type}, Power: ${move.power}, PP: ${move.currentpp}/${move.pp})`)
        })

        const answer = await ask(`Pick one from 1 - ${this.playerPoke.getMoves().length}`)
        const selected = parseInt(answer) - 1;

        if (isNaN(selection) || selection < 0 || selection >= this.playerPoke.moves.length) {
            console.log("Seriously -_- -_- -_-.");
            console.log("Pick Something From the list Please")
            return await this.#playerTurn();
          }
        
        const selectedMove = this.playerPoke.move[selected]
        if(selectedMove.currentpp <= 0) {
            console.log("Theres no pp left you dummy. Choose another one")
            return await this.#playerTurn();
        }

        selectedMove.currentpp --;

        this.#executeAttack(this.playerPoke, this.enemyPoke, selectedMove)
    }

    async #enemyTurn() {
        console.log("enemy")
        await sleep(1000)
    }

    async #executeAttack(attacker, defender, move) {
        const typeEffectiveness = types[t]
    } 

    #endGame() {
        console.log("=====The Game Is Over======")
        endrl()
    }
};

const game = new pokeBattle()
game.startgame()
