import type Terrain from './Terrain';
import { commandCacher } from './Command';
import Command from './Command';
import { evolution } from '$lib/stores/evolution';
import { currentMC, targetMC } from '$lib/stores/minecraft';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

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
	populationSize = 5000;
	stopPointGenTimeMins = 60;
	mutationRate = 0.5;
	mutationAmount = 32;
	stopPointLikeness = 99.5;
	terrainSize = 80; // TODO: make a bounding box instead
	generations = 1000;
	survivorRate = 0.1;
	isRunning = false;
	fitnessHistory: number[] = [];
	bestFitnessHistory: number[] = [];
	likenessHistory: number[] = [];

	averageFitness = 0;
	bestCommand = new Command();
	likenessToTarget = 0;

	boundingBox: { x1: number; x2: number; y1: number; y2: number; z1: number; z2: number } = {
		x1: 0,
		x2: 0,
		y1: 0,
		y2: 0,
		z1: 0,
		z2: 0
	};

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
		// iterate through boudingBox
		const blocks = this.currentTerrain.mcWorld.blocks;
		const shift = Math.log2(this.currentTerrain.size);
		const minX = this.boundingBox.x1;
		const maxX = this.boundingBox.x2;
		const minY = this.boundingBox.y1;
		const maxY = this.boundingBox.y2;
		const minZ = this.boundingBox.z1;
		const maxZ = this.boundingBox.z2;
		const targetBlocks = this.targetTerrain.mcWorld.blocks;
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				for (let z = minZ; z <= maxZ; z++) {
					const index = ((x << shift) << shift) + (y << shift) + z;
					const currentBlock = blocks[index];
					const targetBlock = targetBlocks[index];
					if (currentBlock === targetBlock) likeness++;
				}
			}
		}
		const size = (maxX - minX) * (maxY - minY) * (maxZ - minZ);
		this.likenessToTarget = (likeness / size);
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
			const command = Command.generateRandom(this.boundingBox);
			command.optimizedFitnessCalculation();
			this.population.push(command);
		}
	}

	start() {
		this.isRunning = true;
		Command.setTerrains(this.currentTerrain, this.targetTerrain);
		this.findBoundingBox();
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

	findBoundingBox() {
		// loop through target terrain and find min and max x, y, z that is not air
		const blocks = this.targetTerrain.mcWorld.blocks;
		const shift = Math.log2(this.targetTerrain.size);
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		let minZ = Infinity;
		let maxZ = -Infinity;
		for (let x = 0; x < this.targetTerrain.size; x++) {
			for (let y = 0; y < this.targetTerrain.size; y++) {
				for (let z = 0; z < this.targetTerrain.size; z++) {
					const index = ((x << shift) << shift) + (y << shift) + z;
					if (blocks[index] !== 0) {
						minX = Math.min(minX, x);
						maxX = Math.max(maxX, x);
						minY = Math.min(minY, y);
						maxY = Math.max(maxY, y);
						minZ = Math.min(minZ, z);
						maxZ = Math.max(maxZ, z);
					}
				}
			}
		}
		this.boundingBox = { x1: minX, x2: maxX, y1: minY, y2: maxY, z1: minZ, z2: maxZ };
		console.log(this.boundingBox);
		// this.boundingBox = { x1: 0, x2: 5, y1: 0, y2: 5, z1: 0, z2: 11 };
		const geometry = new BoxGeometry(
			this.boundingBox.x2 - this.boundingBox.x1 + 1,
			this.boundingBox.y2 - this.boundingBox.y1 + 1,
			this.boundingBox.z2 - this.boundingBox.z1 + 1
		);
		const material = new MeshBasicMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.1
		});
		const mesh = new Mesh(geometry, material);
		mesh.position.set(
			this.boundingBox.x1 + (this.boundingBox.x2 - this.boundingBox.x1 + 1) / 2,
			this.boundingBox.y1 + (this.boundingBox.y2 - this.boundingBox.y1 + 1) / 2,
			this.boundingBox.z1 + (this.boundingBox.z2 - this.boundingBox.z1 + 1) / 2
		);

		$currentMC.scene.add(mesh);
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

		// if (this.commandsExecuted.length % 5 === 0) {
			$currentMC.world.updateAllChunks();
			this.calculateLikenessToTarget();
		// }
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
		const newPopulation = [];

		// i have no idea how to code a genetic algorithm
		// take the most fit half and make them reproduce
		for (let i = 0; i < this.populationSize / 2; i++) {
			const organism = this.population[i];
			const child = organism.reproduce();
			child.mutate(this.mutationRate, this.mutationAmount, this.boundingBox);
			child.optimizedFitnessCalculation();
			newPopulation.push(child);
			newPopulation.push(organism);
		}
		// for (let i = 0; i < this.populationSize; i++) {
		// 	const organism = this.population[i];
		// 	const survived = i < survivalCount;
		// 	if (survived) {
		// 		const child = organism.reproduce();
		// 		child.mutate(this.mutationRate, this.mutationAmount, this.boundingBox);
		// 		child.optimizedFitnessCalculation();
		// 		newPopulation.push(child);
		// 		newPopulation.push(organism);
		// 	} else {
		// 		const random = Command.generateRandom(this.boundingBox);
		// 		random.optimizedFitnessCalculation();
		// 		newPopulation.push(random);
		// 	}
		// }

		this.population = newPopulation;
		this.population.sort((a, b) => {
			// sort by fitness then by size descending
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
