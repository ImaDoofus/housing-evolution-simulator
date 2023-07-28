import { currentMC } from '$lib/stores/minecraft';
import type Terrain from './Terrain';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { Minecraft } from 'three-js-minecraft';
let $currentMC: Minecraft;
currentMC.subscribe((value) => ($currentMC = value));

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
	mesh: Mesh;
	executionTime = 5;
	isHighlighted = false;

	static count = 0;
	static TERRAIN_SIZE = 0;

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

	// toString() {
	// 	return `Command(${this.block === 1 ? 'block' : 'air'}, ${this.x1}, ${this.z1}, ${this.x2}, ${
	// 		this.z2
	// 	})`;
	// }

	toString() {
		return `Command(${this.block === 1 ? 'block' : 'air'}, ${this.x1}, ${this.y1}, ${this.z1}, ${
			this.x2
		}, ${this.y2}, ${this.z2})`;
	}

	#clamp(value: number) {
		return Math.round(Math.max(0, Math.min(Command.TERRAIN_SIZE - 1, value)));
	}

	mutate(mutationRate: number, mutationAmount: number) {
		if (Math.random() < mutationRate)
			this.x1 = this.#clamp(this.x1 + (Math.random() - 0.5) * mutationAmount);
		if (Math.random() < mutationRate)
			this.y1 = this.#clamp(this.y1 + (Math.random() - 0.5) * mutationAmount);
		if (Math.random() < mutationRate)
			this.z1 = this.#clamp(this.z1 + (Math.random() - 0.5) * mutationAmount);
		if (Math.random() < mutationRate)
			this.x2 = this.#clamp(this.x2 + (Math.random() - 0.5) * mutationAmount);
		if (Math.random() < mutationRate)
			this.y2 = this.#clamp(this.y2 + (Math.random() - 0.5) * mutationAmount);
		if (Math.random() < mutationRate)
			this.z2 = this.#clamp(this.z2 + (Math.random() - 0.5) * mutationAmount);
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

	// highlight() {
	// 	if (this.isHighlighted) return;
	// 	const geometry = new BoxGeometry(this.x2 - this.x1 + 1, 1.1, this.z2 - this.z1 + 1);
	// 	const material = new MeshBasicMaterial({
	// 		color: this.block === 1 ? 0x0000ff : 0xff0000,
	// 		transparent: true,
	// 		opacity: 0.5
	// 	});
	// 	const mesh = new Mesh(geometry, material);
	// 	mesh.position.x = (this.x1 + this.x2) / 2 + 0.5;
	// 	mesh.position.z = (this.z1 + this.z2) / 2 + 0.5;
	// 	mesh.position.y = 0.5;

	// 	this.mesh = mesh;
	// 	$currentMC.scene.add(mesh);
	// 	this.isHighlighted = true;
	// }

	highlight() {
		if (this.isHighlighted) return;
		const geometry = new BoxGeometry(
			this.x2 - this.x1 + 1,
			this.y2 - this.y1 + 1,
			this.z2 - this.z1 + 1
		);
		const material = new MeshBasicMaterial({
			color: this.block === 1 ? 0x0000ff : 0xff0000,
			transparent: true,
			opacity: 0.5
		});
		const mesh = new Mesh(geometry, material);
		mesh.position.x = (this.x1 + this.x2) / 2 + 0.5;
		mesh.position.y = (this.y1 + this.y2) / 2 + 0.5;
		mesh.position.z = (this.z1 + this.z2) / 2 + 0.5;

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

	// optimizedFitnessCalculation(currentTerrain: Terrain, targetTerrain: Terrain) {
	// 	let likenessBeforeExecution = 0;
	// 	let likenessAfterExecution = 0;
	// 	const minX = Math.min(this.x1, this.x2);
	// 	const maxX = Math.max(this.x1, this.x2);
	// 	const minY = Math.min(this.y1, this.y2);
	// 	const maxY = Math.max(this.y1, this.y2);
	// 	const minZ = Math.min(this.z1, this.z2);
	// 	const maxZ = Math.max(this.z1, this.z2);

	// 	const chunkMinX = Math.floor(minX / 16);
	// 	const chunkMaxX = Math.floor(maxX / 16);
	// 	const chunkMinY = Math.floor(minY / 16);
	// 	const chunkMaxY = Math.floor(maxY / 16);
	// 	const chunkMinZ = Math.floor(minZ / 16);
	// 	const chunkMaxZ = Math.floor(maxZ / 16);

	// 	for (let x = chunkMinX; x <= chunkMaxX; x++) {
	// 		for (let y = chunkMinY; y <= chunkMaxY; y++) {
	// 			for (let z = chunkMinZ; z <= chunkMaxZ; z++) {
	// 				const currentChunk = currentTerrain.mcWorld.getChunk(x, y, z);
	// 				const targetChunk = targetTerrain.mcWorld.getChunk(x, y, z);
	// 				for (let i = 0; i < currentChunk.blocks.length; i++) {
	// 					const x = i % 16;
	// 					if (x < minX || x > maxX) continue;
	// 					const y = Math.floor(i / 256);
	// 					if (y < minY || y > maxY) continue;
	// 					const z = Math.floor((i % 256) / 16);
	// 					if (z < minZ || z > maxZ) continue;

	// 					const currentBlock = currentChunk.blocks[i];
	// 					const targetBlock = targetChunk.blocks[i];
	// 					likenessBeforeExecution += currentBlock === targetBlock ? 1 : -1;
	// 					likenessAfterExecution += this.block === targetBlock ? 1 : -1;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	this.fitness = likenessAfterExecution - likenessBeforeExecution;
	// }
	optimizedFitnessCalculation(currentTerrain: Terrain, targetTerrain: Terrain) {
		let likenessBeforeExecution = 0;
		let likenessAfterExecution = 0;
		const minX = Math.min(this.x1, this.x2);
		const maxX = Math.max(this.x1, this.x2);
		const minY = Math.min(this.y1, this.y2);
		const maxY = Math.max(this.y1, this.y2);
		const minZ = Math.min(this.z1, this.z2);
		const maxZ = Math.max(this.z1, this.z2);
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				for (let z = minZ; z <= maxZ; z++) {
					const currentBlock = currentTerrain.mcWorld.getBlock(x, y, z);
					const targetBlock = targetTerrain.mcWorld.getBlock(x, y, z);
					likenessBeforeExecution += currentBlock === targetBlock ? 1 : -1;
					likenessAfterExecution += this.block === targetBlock ? 1 : -1;
				}
			}
		}
		this.fitness = likenessAfterExecution - likenessBeforeExecution;
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

	static generateRandom(terrainSize: number) {
		const command = new Command();
		command.generation = 0;
		command.block = Math.random() > 0.5 ? 1 : 0;
		command.x1 = Math.floor(Math.random() * terrainSize);
		command.y1 = Math.floor(Math.random() * terrainSize);
		command.z1 = Math.floor(Math.random() * terrainSize);
		command.x2 = Math.floor(Math.random() * terrainSize);
		command.y2 = Math.floor(Math.random() * terrainSize);
		command.z2 = Math.floor(Math.random() * terrainSize);
		return command;
	}
}
