import { evolution } from '$lib/stores/evolution';
import { currentMC } from '$lib/stores/minecraft';
import type Terrain from './Terrain';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { Minecraft } from 'three-js-minecraft';
let $currentMC: Minecraft;
currentMC.subscribe((value) => ($currentMC = value));

class CommandCacher {
	cache: Map<string, number>;

	constructor() {
		this.cache = new Map();
	}

	getCacheKey(command: Command) {
		return `${command.x1},${command.y1},${command.z1},${command.x2},${command.y2},${command.z2}`;
	}

	getCachedCommand(command: Command) {
		const key = this.getCacheKey(command);
		return this.cache.get(key);
	}

	cacheCommand(command: Command) {
		const key = this.getCacheKey(command);
		this.cache.set(key, command.fitness);
	}

	clearCache() {
		this.cache = new Map();
	}
}

export const commandCacher = new CommandCacher();

export default class Command {
	id: number;
	generation: number;
	fitness: number;
	block: number;
	x1: number;
	y1: number;
	z1: number;
	x2: number;
	y2: number;
	z2: number;
	mesh: Mesh | undefined;
	executionTime = 2;
	isHighlighted = false;

	static count = 0;

	constructor() {
		this.id = Command.count++;
		this.generation =
			this.fitness =
			this.block =
			this.x1 =
			this.y1 =
			this.z1 =
			this.x2 =
			this.y2 =
			this.z2 =
				0;
	}

	toString() {
		return `Command(${this.block === 1 ? 'block' : 'air'}, ${this.x1}, ${this.y1}, ${this.z1}, ${
			this.x2
		}, ${this.y2}, ${this.z2})`;
	}

	getSize() {
		const minX = Math.min(this.x1, this.x2);
		const maxX = Math.max(this.x1, this.x2);
		const minY = Math.min(this.y1, this.y2);
		const maxY = Math.max(this.y1, this.y2);
		const minZ = Math.min(this.z1, this.z2);
		const maxZ = Math.max(this.z1, this.z2);

		return (maxX - minX) * (maxY - minY) * (maxZ - minZ);
	}

	private clamp(value: number, min: number, max: number) {
		return Math.round(Math.max(min, Math.min(value, max + 1)));
	}

	mutate(mutationRate: number, mutationAmount: number, boundingBox: { x1: number; y1: number; z1: number, x2: number, y2: number, z2: number }) {
		function getMutation() {
			return Math.random() * mutationAmount * 2 - mutationAmount;
		}
		if (Math.random() < mutationRate)
			this.x1 = this.clamp(this.x1 + getMutation(), boundingBox.x1, boundingBox.x2);
		if (Math.random() < mutationRate)
			this.y1 = this.clamp(this.y1 + getMutation(), boundingBox.y1, boundingBox.y2);
		if (Math.random() < mutationRate)
			this.z1 = this.clamp(this.z1 + getMutation(), boundingBox.z1, boundingBox.z2);
		if (Math.random() < mutationRate)
			this.x2 = this.clamp(this.x2 + getMutation(), boundingBox.x1, boundingBox.x2);
		if (Math.random() < mutationRate)
			this.y2 = this.clamp(this.y2 + getMutation(), boundingBox.y1, boundingBox.y2);
		if (Math.random() < mutationRate)
			this.z2 = this.clamp(this.z2 + getMutation(), boundingBox.z1, boundingBox.z2);

	}

	reproduce() {
		const clone = new Command();
		clone.generation = this.generation++;
		clone.block = this.block;
		clone.x1 = this.x1;
		clone.y1 = this.y1;
		clone.z1 = this.z1;
		clone.x2 = this.x2;
		clone.y2 = this.y2;
		clone.z2 = this.z2;
		return clone;
	}

	highlight() {
		if (this.isHighlighted) return;
		const expand = 0.1;
		const geometry = new BoxGeometry(
			this.x2 - this.x1 + expand,
			this.y2 - this.y1 + expand,
			this.z2 - this.z1 + expand
		);
		const material = new MeshBasicMaterial({
			color: this.block !== 0 ? 0x00ff00 : 0xff0000,
			transparent: true,
			opacity: 0.5
		});
		const mesh = new Mesh(geometry, material);
		mesh.position.set(
			this.x1 + (this.x2 - this.x1) / 2 - expand / 2,
			this.y1 + (this.y2 - this.y1) / 2 - expand / 2,
			this.z1 + (this.z2 - this.z1) / 2 - expand / 2
		);

		this.mesh = mesh;
		$currentMC.scene.add(mesh);
		this.isHighlighted = true;
	}

	unhighlight() {
		if (!this.isHighlighted) return;
		$currentMC.scene.remove(this.mesh);
		this.isHighlighted = false;
	}

	execute(terrain: Terrain) {
		terrain.setRegion(this.x1, this.y1, this.z1, this.x2, this.y2, this.z2, this.block);
	}

	static currentTerrain: Terrain;
	static targetTerrain: Terrain;

	static setTerrains(currentTerrain: Terrain, targetTerrain: Terrain) {
		Command.currentTerrain = currentTerrain;
		Command.targetTerrain = targetTerrain;
	}

	optimizedFitnessCalculation() {
		const size = this.getSize();
		if (size > 1000) {
			const cachedFitness = commandCacher.getCachedCommand(this);
			if (cachedFitness) {
				this.fitness = cachedFitness;
				return;
			}
			commandCacher.cacheCommand(this);
		}
		const shift = Math.log2(Command.currentTerrain.size);
		this.fitness = 0;
		const minX = Math.min(this.x1, this.x2);
		const maxX = Math.max(this.x1, this.x2);
		const minY = Math.min(this.y1, this.y2);
		const maxY = Math.max(this.y1, this.y2);
		const minZ = Math.min(this.z1, this.z2);
		const maxZ = Math.max(this.z1, this.z2);
		const currentBlocks = Command.currentTerrain.mcWorld.blocks;
		const targetBlocks = Command.targetTerrain.mcWorld.blocks;
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				for (let z = minZ; z <= maxZ; z++) {  
					const index = ((x << shift) << shift) + (y << shift) + z;
					const currentBlock = currentBlocks[index];
					const targetBlock = targetBlocks[index];
					if (this.block !== targetBlock) this.fitness--;
					else if (this.block === targetBlock && currentBlock !== targetBlock) this.fitness++;
				}
			}
		}
	}

	// calculateFitness(currentTerrain: Terrain, targetTerrain: Terrain) {
	// 	const currentTerrainClone = currentTerrain.clone();
	// 	const beforeCommandLikeness = currentTerrainClone.getLikeness(targetTerrain);
	// 	this.execute(currentTerrainClone);
	// 	const afterCommandLikeness = currentTerrainClone.getLikeness(targetTerrain);
	// 	this.fitness = afterCommandLikeness - beforeCommandLikeness;
	// }

	// calculateFitness(currentTerrain: Terrain, targetTerrain: Terrain) {
	// 	const beforeCommandLikeness = currentTerrain.optimizedGetLikeness(targetTerrain);
	// 	this.execute(currentTerrain);
	// 	const afterCommandLikeness = currentTerrain.optimizedGetLikeness(targetTerrain);
	// 	// undo the command
	// 	this.execute(currentTerrain);

	// 	this.fitness = afterCommandLikeness - beforeCommandLikeness;
	// }


	// TODO: optimize generation of commands
	static generateRandom(boundingBox: { x1: number; y1: number; z1: number, x2: number, y2: number, z2: number }) {
		const command = new Command();
		// generate point in bounding box
		command.x1 = Math.floor(Math.random() * (boundingBox.x2 - boundingBox.x1) + boundingBox.x1);
		command.y1 = Math.floor(Math.random() * (boundingBox.y2 - boundingBox.y1) + boundingBox.y1);
		command.z1 = Math.floor(Math.random() * (boundingBox.z2 - boundingBox.z1) + boundingBox.z1);
		command.x2 = command.x1;
		command.y2 = command.y1;
		command.z2 = command.z1;
		command.generation = 0;
		command.block = Command.targetTerrain.mcWorld.getBlockID(command.x1, command.y1, command.z1);
		return command;
	}
}
