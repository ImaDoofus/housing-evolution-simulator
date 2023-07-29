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
	populationSize = 50;
	stopPointGenTimeMins = 30;
	mutationRate = 0.1;
	stopPointLikeness = 97.5;
	terrainSize = 64;
	killRate = 0.5;
	isRunning = false;

	averageFitness = 0;
	bestCommand = new Command();
	likenessToTarget = 0;

	constructor() {
		this.population = [];

		setInterval(() => {
			if (this.isRunning) {
				this.step();
			}
		}, 1000);
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

		const survivors = [];
		//  kill all with 0 or negative fitness
		for (let i = 0; i < this.population.length; i++) {
			if (this.population[i].fitness > 0) {
				survivors.push(this.population[i]);
			}
		}

		const newPopulation = [];
		// reproduce
		for (let i = 0; i < this.population.length; i++) {
			const parent = this.population[i];
			const child = parent.reproduce();
			child.mutate(this.mutationRate, 1, this.terrainSize);
			child.optimizedFitnessCalculation(this.currentTerrain, this.targetTerrain);
			newPopulation.push(child);
		}

		// the rest of the population is random
		for (let i = newPopulation.length; i < this.populationSize; i++) {
			const command = Command.generateRandom(this.terrainSize);
			command.optimizedFitnessCalculation(this.currentTerrain, this.targetTerrain);
			newPopulation.push(command);
		}

		this.population = newPopulation;
		this.population.sort((a, b) => {
			// sort by fitness then by size
			if (a.fitness === b.fitness) {
				return b.getSize() - a.getSize();
			}
			return b.fitness - a.fitness;
		});

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
