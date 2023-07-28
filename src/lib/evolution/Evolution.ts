import Command from './Command';
import Terrain from './Terrain';
import { evolution } from '$lib/stores/evolution';

export default class Evolution {
	population: Command[];
	populationSize: number;
	mutationRate: number;
	stopPointLikeness: number;
	stopPointCommandCount: number;
	generation: number;
	currentTerrain: Terrain;
	targetTerrain: Terrain;
	terrainSize = 100;
	isRunning = false;

	averageFitness = 0;
	bestCommand = new Command();
	likenessToTarget = 0;

	constructor() {
		this.population = [];
		this.population.push(new Command());

		this.populationSize = 69;
		this.generation = 0;
		this.currentTerrain = new Terrain(this.terrainSize);
		this.targetTerrain = new Terrain(this.terrainSize);

		this.mutationRate = 0.1;
		this.stopPointLikeness = 0.9;
		this.stopPointCommandCount = 100;
	}

	calculateLikenessToTarget() {
		this.likenessToTarget = this.currentTerrain.getLikeness(this.targetTerrain);
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

	reset() {
		this.population = [];
		this.generation = 0;
		this.currentTerrain = new Terrain(this.terrainSize);
		this.targetTerrain = new Terrain(this.terrainSize);

		// eslint-disable-next-line no-self-assign
		evolution.update((e) => (e = e));
	}

	reproduce() {}

	static instance: Evolution = new Evolution();
}
