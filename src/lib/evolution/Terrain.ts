import { createNoise2D } from 'simplex-noise';

export default class Terrain {
	size: number;
	bitmap: Uint8Array;

	constructor(size: number) {
		this.size = size;
		this.bitmap = new Uint8Array(size * size);
	}

	getBlock(x: number, z: number) {
		return this.bitmap[x + z * this.size];
	}

	setBlock(x: number, z: number, value: number) {
		this.bitmap[x + z * this.size] = value;
	}

	getLikeness(other: Terrain) {
		let likeness = 0;
		for (let x = 0; x < this.size; x++) {
			for (let z = 0; z < this.size; z++) {
				likeness += this.getBlock(x, z) === other.getBlock(x, z) ? 1 : -1;
			}
		}
		return likeness;
	}

	setRegion(x1: number, z1: number, x2: number, z2: number, value: number) {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minZ = Math.min(z1, z2);
		const maxZ = Math.max(z1, z2);
		for (let x = minX; x <= maxX; x++) {
			for (let z = minZ; z <= maxZ; z++) {
				this.setBlock(x, z, value);
			}
		}
	}

	clone() {
		const clone = new Terrain(this.size);
		clone.bitmap = new Uint8Array(this.bitmap);
		return clone;
	}

	static generate(size: number, frequency: number) {
		const terrain = new Terrain(size);
		const noise = createNoise2D();
		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const value = noise(x / frequency, z / frequency);
				if (value < -0.5) {
					terrain.setBlock(x, z, 1);
				} else if (value > 0.5) {
					terrain.setBlock(x, z, 2);
				}
			}
		}
		return terrain;
	}

	static fromImage(img: HTMLImageElement, size: number) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get canvas context');
		ctx.drawImage(img, 0, 0, size, size);
		const terrain = new Terrain(size);
		const imageData = ctx.getImageData(0, 0, size, size);
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const index = (x + y * size) * 4;
				const r = imageData.data[index + 0];
				const g = imageData.data[index + 1];
				const b = imageData.data[index + 2];
				const a = imageData.data[index + 3];
				terrain.setBlock(x, y, Math.random() > 0.5 ? 1 : 0);
				// if (r === 0 && g === 0 && b === 0 && a === 255) {
				// 	terrain.setBlock(x, y, 0);
				// } else {
				// 	terrain.setBlock(x, y, 1);
				// }
			}
		}
		return terrain;
	}

	drawToCanvas(canvas: HTMLCanvasElement) {
		canvas.width = canvas.height = this.size;
		canvas.style.border = '14px solid black';
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get canvas context');
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				const value = this.getBlock(x, y);
				if (value === 0) {
					ctx.fillStyle = 'white';
				} else if (value === 1) {
					ctx.fillStyle = 'black';
				}
				ctx.fillRect(x, y, 1, 1);
			}
		}
		ctx.fillStyle = 'red';
		ctx.fillRect(0, 0, this.size, this.size);
	}
}
