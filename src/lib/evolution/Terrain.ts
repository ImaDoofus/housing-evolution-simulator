import { createNoise2D, createNoise3D } from 'simplex-noise';
import { Minecraft } from 'three-js-minecraft';

export default class Terrain {
	size: number;
	mcWorld: Minecraft.World;
	constructor(size: number, mcWorld: Minecraft.World) {
		this.size = size;
		this.mcWorld = mcWorld;

		mcWorld.clear();
		mcWorld.setSize(size);
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

	static generate2D(mcWorld: Minecraft.World, size: number, frequency: number, octaves: number) {
		console.log(mcWorld);
		const terrain = new Terrain(size, mcWorld);
		const noise = createNoise2D();
		const AMPLITUDE = size / 10;

		function getNoise(x: number, z: number, frequency: number) {
			let value = 0;
			for (let i = 0; i < octaves; i++) {
				value += noise(x / frequency, z / frequency) * 0.5 + 0.5;
				frequency /= 2;
			}
			return value;
		}

		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const height = getNoise(x, z, frequency) * AMPLITUDE;
				for (let y = 0; y < height; y++) {
					terrain.mcWorld.setBlock(x, y, z, 1);
				}
			}
		}
		return terrain;
	}

	static generate3D(
		mcWorld: Minecraft.World,
		size: number,
		frequency: number,
		octaves: number,
		lacunarity: number
	) {
		const terrain = new Terrain(size, mcWorld);
		const noise = createNoise3D();

		function getNoise(x: number, y: number, z: number, frequency: number) {
			let value = 0;
			for (let i = 0; i < octaves; i++) {
				value += noise(x / frequency, y / frequency, z / frequency);
				frequency /= 2;
			}
			return value;
		}

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				for (let z = 0; z < size; z++) {
					const value = getNoise(x, y, z, frequency);
					if (value > lacunarity) {
						terrain.mcWorld.setBlock(x, y, z, 1);
					}
				}
			}
		}

		return terrain;
	}

	generateSphere(x: number, y: number, z: number, radius: number, value: number) {
		for (let dx = -radius; dx <= radius; dx++) {
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dz = -radius; dz <= radius; dz++) {
					const xPos = x + dx;
					const yPos = y + dy;
					const zPos = z + dz;
					if (xPos < 0 || xPos > this.size - 1) continue;
					if (yPos < 0 || yPos > this.size - 1) continue;
					if (zPos < 0 || zPos > this.size - 1) continue;
					if (dx * dx + dy * dy + dz * dz < radius * radius) {
						this.mcWorld.setBlock(x + dx, y + dy, z + dz, value);
					}
				}
			}
		}
	}

	generateEllipsoid(
		x: number,
		y: number,
		z: number,
		radiusX: number,
		radiusY: number,
		radiusZ: number,
		value: number
	) {
		for (let dx = -radiusX; dx <= radiusX; dx++) {
			const xPos = x + dx;
			if (xPos < -11 || xPos > 266) continue;
			for (let dy = -radiusY; dy <= radiusY; dy++) {
				const yPos = y + dy;
				if (yPos < 0 || yPos > 255) continue;
				for (let dz = -radiusZ; dz <= radiusZ; dz++) {
					const zPos = z + dz;
					if (zPos < -11 || zPos > 266) continue;
					if (
						(dx * dx) / (radiusX * radiusX) +
							(dy * dy) / (radiusY * radiusY) +
							(dz * dz) / (radiusZ * radiusZ) <
						1
					) {
						this.mcWorld.setBlock(x + dx, y + dy, z + dz, value);
					}
				}
			}
		}
	}

	static generateHousingTest(mcWorld: Minecraft.World) {
		const size = 64;
		const terrain = new Terrain(size, mcWorld);

		// generate a sphere
		terrain.generateSphere(32, 64, 32, 32, 1);


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

	static fromBlockArray(
		mcWorld: Minecraft.World,
		blocks: number[],
		width: number,
		height: number,
		depth: number
	) {
		const longestAxis = Math.min(Math.max(width, height, length), 256);
		const worldSize = Math.pow(2, Math.ceil(Math.log2(longestAxis)));
		const terrain = new Terrain(worldSize, mcWorld);
		console.log(width, height, depth);
		for (let y = 0; y < height; y++) {
			for (let z = 0; z < depth; z++) {
				for (let x = 0; x < width; x++) {
					if (x >= worldSize || y >= worldSize || z >= worldSize) continue;
					const index = (y * depth + z) * width + x;
					terrain.mcWorld.setBlock(x, y, z, blocks[index]);
				}
			}
		}

		return terrain;
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
