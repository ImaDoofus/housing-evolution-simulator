import Command from './Command';
import Terrain from './Terrain';
import { evolution } from '$lib/stores/evolution';
import { currentMC, targetMC } from '$lib/stores/minecraft';

let $currentMC: any;
let $targetMC: any;

currentMC.subscribe((value) => ($currentMC = value));
targetMC.subscribe((value) => ($targetMC = value));

export default class Evolution {
	population: Command[];
	currentTerrain!: Terrain;
	targetTerrain!: Terrain;
	generation = 0;
	commandsExecuted: Command[] = [];
	populationSize = 69;
	stopPointGenTimeMins = 3;
	mutationRate = 0.1;
	stopPointLikeness = 97.5;
	terrainSize = 100;
	killRate = 0.5;
	isRunning = false;

	averageFitness = 0;
	bestCommand = new Command();
	likenessToTarget = 0;

	constructor() {
		this.population = [];
		this.population.push(new Command());

		setInterval(() => {
			if (this.isRunning) {
				this.step();
			}
		}, 10);
	}

	calculateLikenessToTarget() {
		this.likenessToTarget = this.currentTerrain.mcWorld.getLikeness(this.targetTerrain.mcWorld);
	}

	calculateAverageFitness() {
		let totalFitness = 0;
		for (const command of this.population) {
			totalFitness += command.fitness;
		}
		this.averageFitness = totalFitness / this.population.length;
	}

	calculateBestCommand() {
		this.bestCommand = this.population[0];
		for (const command of this.population) {
			if (command.fitness > this.bestCommand.fitness) {
				this.bestCommand = command;
			}
		}
	}

	createRandomPopulation() {
		for (let i = 0; i < this.populationSize; i++) {
			const command = Command.generateRandom(this.terrainSize);
			command.optimizedFitnessCalculation(this.currentTerrain, this.targetTerrain);
			this.population.push(command);
		}
	}

	start() {
		this.isRunning = true;
		this.createRandomPopulation();
	}

	play() {
		this.isRunning = true;
	}

	pause() {
		this.isRunning = false;
	}

	step() {
		if (this.generation < 100) {
			this.nextGeneration();
		} else {
			this.executeCommand();
			this.resetPopulation();
		}
	}

	executeCommand() {
		this.commandsExecuted.push(this.bestCommand);
		this.bestCommand.execute(this.currentTerrain);

		this.calculateLikenessToTarget();

		console.log(this.calculateGenerationTime(), this.likenessToTarget, this.stopPointLikeness);

		if (this.calculateGenerationTime() > this.stopPointGenTimeMins * 60) {
			this.pause();
		}
		if (this.likenessToTarget > this.stopPointLikeness / 100) {
			this.pause();
		}

		$currentMC.world.updateAllChunks();
	}

	calculateGenerationTime() {
		return this.commandsExecuted.reduce((acc, command) => acc + command.executionTime, 0);
	}

	nextGeneration() {
		this.generation++;
		this.calculateAverageFitness();
		this.bestCommand.unhighlight();
		this.calculateBestCommand();
		this.bestCommand.highlight();

		const killCount = Math.floor(this.populationSize * this.killRate);
		const newPopulation = [];
		for (let i = 0; i < killCount; i++) {
			newPopulation.push(this.population[i]);
		}
		for (let i = 0; i < killCount; i++) {
			if (Math.random() < 0.5) {
				const command = this.population[i].reproduce();
				command.mutate(this.mutationRate, 1);
				command.optimizedFitnessCalculation(this.currentTerrain, this.targetTerrain);
				newPopulation.push(command);
			} else {
				const command = Command.generateRandom(this.terrainSize);
				command.optimizedFitnessCalculation(this.currentTerrain, this.targetTerrain);
				newPopulation.push(command);
			}
		}
		this.population = newPopulation;
		this.population.sort((a, b) => b.fitness - a.fitness);

		// eslint-disable-next-line no-self-assign
		evolution.update((e) => (e = e));
	}

	resetPopulation() {
		this.generation = 0;
		this.population = [];
		this.averageFitness = 0;
		this.createRandomPopulation();

		// eslint-disable-next-line no-self-assign
		evolution.update((e) => (e = e));
	}

	// reproduce() {}

	static instance: Evolution = new Evolution();
}
