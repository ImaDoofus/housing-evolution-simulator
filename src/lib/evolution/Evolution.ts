import type Terrain from './Terrain';
import { commandCacher } from './Command';
import Command from './Command';
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
	populationSize = 100;
	stopPointGenTimeMins = 60;
	mutationRate = 0.3;
	mutationAmount = 5;
	stopPointLikeness = 99.5;
	terrainSize = 80; // TODO: make a bounding box instead
	survivorRate = 0.8;
	isRunning = false;
	fitnessHistory: number[] = [];
	bestFitnessHistory: number[] = [];
	likenessHistory: number[] = [];

	averageFitness = 0;
	bestCommand = new Command();
	likenessToTarget = 0;
	generations = 250;

	constructor() {
		this.population = [];
	}

	async onMount() {
		// loop this.step as fast as possible
		const loop = () => {
			if (this.isRunning) {
				const start = performance.now();
				while (performance.now() - start < 1000 / 60) {
					this.step();
				}
			}
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	calculateLikenessToTarget() {
		let likeness = 0;
		const current = this.currentTerrain.mcWorld.blocks;
		const target = this.targetTerrain.mcWorld.blocks;
		for (let i = 0; i < current.length; i++) {
			if (current[i] === target[i]) likeness++;
			else likeness--;
		}

		this.likenessToTarget = likeness / current.length;
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
	}

	createRandomPopulation() {
		for (let i = 0; i < this.populationSize; i++) {
			const command = Command.generateRandom(this.terrainSize);
			command.optimizedFitnessCalculation();
			this.population.push(command);
		}
	}

	start() {
		this.isRunning = true;
		Command.setTerrains(this.currentTerrain, this.targetTerrain);
		this.resetPopulation();
		this.calculateLikenessToTarget();
	}

	play() {
		this.isRunning = true;
	}

	pause() {
		this.isRunning = false;
	}

	step() {
		if (this.generation < this.generations) {
			this.nextGeneration();
		} else {
			this.executeCommand();
			this.resetPopulation();
		}
	}

	executeCommand() {
		if (this.bestCommand.fitness === 0) {
			return;
		}

		this.commandsExecuted.push(this.bestCommand);
		this.bestCommand.execute(this.currentTerrain);

		this.likenessHistory.push(this.likenessToTarget);

		if (this.calculateGenerationTime() > this.stopPointGenTimeMins * 60) {
			this.pause();
		}
		if (this.likenessToTarget > this.stopPointLikeness / 100) {
			this.pause();
		}

		commandCacher.clearCache();

		if (this.commandsExecuted.length % 50 === 0) {
			$currentMC.world.updateAllChunks();
			this.calculateLikenessToTarget();
		}
	}

	calculateGenerationTime() {
		return this.commandsExecuted.reduce((acc, command) => acc + command.executionTime, 0);
	}

	nextGeneration() {
		this.generation++;
		this.calculateAverageFitness();
		this.bestCommand?.unhighlight();
		this.calculateBestCommand();
		this.bestCommand?.highlight();

		this.fitnessHistory.push(this.averageFitness);
		this.bestFitnessHistory.push(this.bestCommand?.fitness || 0);
		if (this.fitnessHistory.length > 50) {
			this.fitnessHistory.shift();
			this.bestFitnessHistory.shift();
		}

		const MAX_WORLD_EDIT_SIZE = 100000;
		const hasReachedConvergence =
			this.bestFitnessHistory.length === 50 &&
			this.bestFitnessHistory.every((v) => v === this.bestFitnessHistory[0]);
		const hasReachedMaxWorldEditSize = this.bestCommand.getSize() > MAX_WORLD_EDIT_SIZE;
		// console.log(this.bestCommand.getSize(), MAX_WORLD_EDIT_SIZE);
		if ((hasReachedMaxWorldEditSize || hasReachedConvergence) && this.bestCommand.fitness > 0) {
			// if (hasReachedConvergence) console.log('Reached convergence');
			// if (hasReachedMaxWorldEditSize) console.log('Reached max world edit size');
			this.executeCommand();
			this.resetPopulation();
			return;
		}

		//  if average fitness is close to best fitness
		const survivalCount = Math.floor(this.populationSize * this.survivorRate);
		const newPopulation = this.population.slice(0, survivalCount);

		// i have no idea how to code a genetic algorithm
		for (let i = 0; i < this.populationSize; i++) {
			const parent = this.population[i];
			if (!parent) break;
			const survived = parent.fitness > 0 && i < survivalCount;
			if (survived) {
				const child = parent.reproduce();
				child.mutate(this.mutationRate, this.mutationAmount, this.terrainSize);
				child.optimizedFitnessCalculation();
				newPopulation.push(child);
				if (child.fitness > parent.fitness) {
					newPopulation.push(child);
				} else {
					newPopulation.push(parent);
				}
			} else {
				const random = Command.generateRandom(this.terrainSize);
				random.optimizedFitnessCalculation();
				newPopulation.push(random);
			}
		}

		this.population = newPopulation;
		this.population.sort((a, b) => {
			// sort by fitness then by size
			if (a.fitness === b.fitness) {
				return a.getSize() - b.getSize();
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
