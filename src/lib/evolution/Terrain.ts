import { createNoise2D } from 'simplex-noise';
import { Minecraft } from 'three-js-minecraft';

export default class Terrain {
	size: number;
	mcWorld: Minecraft.World;
	constructor(size: number, mcWorld: Minecraft.World) {
		this.size = size;
		this.mcWorld = mcWorld;

		mcWorld.clear();
	}

	setRegion(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, value: number) {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		const minZ = Math.min(z1, z2);
		const maxZ = Math.max(z1, z2);
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				for (let z = minZ; z <= maxZ; z++) {
					this.mcWorld.setBlock(x, y, z, value);
				}
			}
		}
	}

	static generate(size: number, frequency: number, mcWorld: Minecraft.World) {
		const terrain = new Terrain(size, mcWorld);
		const noise = createNoise2D();
		const AMPLITUDE = size / 2;
		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const height = Math.floor((noise(x / frequency, z / frequency) + 1) * AMPLITUDE);
				for (let y = 0; y < height; y++) {
					terrain.mcWorld.setBlock(x, y, z, 1);
				}
			}
		}
		return terrain;
	}

	static fromImage(img: HTMLImageElement, size: number, mcWorld: Minecraft.World) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get canvas context');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, size, size);
		ctx.drawImage(img, 0, 0, size, size);
		const terrain = new Terrain(size, mcWorld);

		const imageData = ctx.getImageData(0, 0, size, size);

		function getImageHeightAt(x: number, z: number) {
			const i = (x + z * size) * 4;
			const r = imageData.data[i + 0];
			const g = imageData.data[i + 1];
			const b = imageData.data[i + 2];
			const height = Math.floor(((r + g + b) / 3 / 255) * size);
			return height;
		}

		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const height = getImageHeightAt(x, z);
				for (let y = 0; y < height; y++) {
					terrain.mcWorld.setBlock(x, y, z, 1);
				}
			}
		}

		return terrain;
	}

	toCanvas() {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = this.size;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get canvas context');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, this.size, this.size);

		for (let x = 0; x < this.size; x++) {
			for (let z = 0; z < this.size; z++) {
				for (let y = 0; y < this.size; y++) {
					const value = this.mcWorld.getBlock(x, y, z);
					if (value === 0) continue;
					const color = Math.floor((y / this.size) * 255);
					ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
					ctx.fillRect(x, z, 1, 1);
				}
			}
		}

		return canvas;
	}
}

// export default class Terrain {
// 	size: number;
// 	bitmap: Uint8Array;

// 	constructor(size: number) {
// 		this.size = size;
// 		// this.bitmap = new Uint8Array(size * size);
// 		this.bitmap = new Uint8Array(size * size * size);
// 	}

// 	// getBlock(x: number, z: number) {
// 	// 	return this.bitmap[x + z * this.size];
// 	// }

// 	getBlock(x: number, y: number, z: number) {
// 		return this.bitmap[x + y * this.size + z * this.size * this.size];
// 	}

// 	// setBlock(x: number, z: number, value: number) {
// 	// 	this.bitmap[x + z * this.size] = value;
// 	// }

// 	setBlock(x: number, y: number, z: number, value: number) {
// 		this.bitmap[x + y * this.size + z * this.size * this.size] = value;
// 	}

// 	// getLikeness(other: Terrain) {
// 	// 	let likeness = 0;
// 	// 	for (let x = 0; x < this.size; x++) {
// 	// 		for (let z = 0; z < this.size; z++) {
// 	// 			likeness += this.getBlock(x, z) === other.getBlock(x, z) ? 1 : -1;
// 	// 		}
// 	// 	}
// 	// 	return likeness;
// 	// }

// 	getLikeness(other: Terrain) {
// 		let likeness = 0;
// 		for (let x = 0; x < this.size; x++) {
// 			for (let y = 0; y < this.size; y++) {
// 				for (let z = 0; z < this.size; z++) {
// 					likeness += this.getBlock(x, y, z) === other.getBlock(x, y, z) ? 1 : -1;
// 				}
// 			}
// 		}
// 		return likeness;
// 	}

// 	// setRegion(x1: number, z1: number, x2: number, z2: number, value: number) {
// 	// 	const minX = Math.min(x1, x2);
// 	// 	const maxX = Math.max(x1, x2);
// 	// 	const minZ = Math.min(z1, z2);
// 	// 	const maxZ = Math.max(z1, z2);
// 	// 	for (let x = minX; x <= maxX; x++) {
// 	// 		for (let z = minZ; z <= maxZ; z++) {
// 	// 			this.setBlock(x, z, value);
// 	// 		}
// 	// 	}
// 	// }

// 	setRegion(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, value: number) {
// 		const minX = Math.min(x1, x2);
// 		const maxX = Math.max(x1, x2);
// 		const minY = Math.min(y1, y2);
// 		const maxY = Math.max(y1, y2);
// 		const minZ = Math.min(z1, z2);
// 		const maxZ = Math.max(z1, z2);
// 		for (let x = minX; x <= maxX; x++) {
// 			for (let y = minY; y <= maxY; y++) {
// 				for (let z = minZ; z <= maxZ; z++) {
// 					this.setBlock(x, y, z, value);
// 				}
// 			}
// 		}
// 	}

// 	clone() {
// 		const clone = new Terrain(this.size);
// 		clone.bitmap = new Uint8Array(this.bitmap);
// 		return clone;
// 	}

// 	// static generate(size: number, frequency: number) {
// 	// 	const terrain = new Terrain(size);
// 	// 	const noise = createNoise2D();
// 	// 	for (let x = 0; x < size; x++) {
// 	// 		for (let z = 0; z < size; z++) {
// 	// 			const value = noise(x / frequency, z / frequency);
// 	// 			if (value < -0.5) {
// 	// 				terrain.setBlock(x, z, 1);
// 	// 			} else if (value > 0.5) {
// 	// 				terrain.setBlock(x, z, 2);
// 	// 			}
// 	// 		}
// 	// 	}
// 	// 	return terrain;
// 	// }

// 	static generate(size: number, frequency: number) {
// 		const terrain = new Terrain(size);
// 		const AMPLITUDE = 10;
// 		const noise = createNoise2D();
// 		// 3d terrain
// 		for (let x = 0; x < size; x++) {
// 			for (let z = 0; z < size; z++) {
// 				const value = noise(x / frequency, z / frequency);
// 				const y = Math.floor(value * AMPLITUDE);
// 				terrain.setBlock(x, y, z, 1);
// 			}
// 		}
// 		return terrain;
// 	}

// 	static fromImage(img: HTMLImageElement, size: number) {
// 		const canvas = document.createElement('canvas');
// 		canvas.width = canvas.height = size;
// 		const ctx = canvas.getContext('2d');
// 		if (!ctx) throw new Error('Could not get canvas context');
// 		ctx.drawImage(img, 0, 0, size, size);
// 		const terrain = new Terrain(size);
// 		const imageData = ctx.getImageData(0, 0, size, size);
// 		for (let i = 0; i < size * size; i++) {
// 			const a = imageData.data[i * 4 + 3];
// 			if (a === 0) continue;
// 			const r = imageData.data[i * 4 + 0];
// 			const g = imageData.data[i * 4 + 1];
// 			const b = imageData.data[i * 4 + 2];
// 			const avg = (r + g + b) / 3;
// 			if (avg < 128) terrain.bitmap[i] = 1;
// 		}
// 		return terrain;
// 	}

// 	// toCanvas() {
// 	// 	const canvas = document.createElement('canvas');
// 	// 	canvas.width = canvas.height = this.size;
// 	// 	const ctx = canvas.getContext('2d');
// 	// 	if (!ctx) throw new Error('Could not get canvas context');
// 	// 	const imageData = ctx.createImageData(this.size, this.size);
// 	// 	for (let i = 0; i < this.size * this.size; i++) {
// 	// 		const value = this.bitmap[i] === 0 ? 0 : 255;
// 	// 		imageData.data[i * 4 + 0] = value;
// 	// 		imageData.data[i * 4 + 1] = value;
// 	// 		imageData.data[i * 4 + 2] = value;
// 	// 		imageData.data[i * 4 + 3] = 255;
// 	// 	}
// 	// 	ctx.putImageData(imageData, 0, 0);

// 	// 	return canvas;
// 	// }

// 	toCanvas() {
// 		const canvas = document.createElement('canvas');
// 		canvas.width = canvas.height = this.size;
// 		const ctx = canvas.getContext('2d');
// 		if (!ctx) throw new Error('Could not get canvas context');
// 		for (let x = 0; x < this.size; x++) {
// 			for (let z = 0; z < this.size; z++) {
// 				// for (let y = this.size; y >= 0; y--) {
// 				const value = this.getBlock(x, 25, z);
// 				if (value === 0) continue;
// 				// ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
// 				ctx.fillStyle = 'red';
// 				ctx.fillRect(x, z, 1, 1);
// 				// }
// 			}
// 		}

// 		return canvas;
// 	}

// 	// toMinecraft(minecraft: Minecraft) {
// 	// 	for (let x = 0; x < this.size; x++) {
// 	// 		for (let z = 0; z < this.size; z++) {
// 	// 			const block = this.getBlock(x, z);
// 	// 			minecraft.world.setBlock(x, 0, z, block === 0 ? 0 : 1);
// 	// 		}
// 	// 	}
// 	// 	minecraft.world.updateAllChunks();
// 	// }

// 	toMinecraft(minecraft: Minecraft) {
// 		for (let x = 0; x < this.size; x++) {
// 			for (let y = 0; y < this.size; y++) {
// 				for (let z = 0; z < this.size; z++) {
// 					const block = this.getBlock(x, y, z);
// 					minecraft.world.setBlock(x, y, z, block === 0 ? 0 : 1);
// 				}
// 			}
// 		}
// 		minecraft.world.updateAllChunks();
// 	}
// }
