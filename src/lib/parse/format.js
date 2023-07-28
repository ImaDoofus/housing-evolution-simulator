import * as nbt from 'https://cdn.jsdelivr.net/npm/nbtify/dist/index.min.js';
import mappings from './mappings.json' assert { type: 'json' };

export async function index(inputArrayBuffer, logErrors) {
	let temp = formatSchematic((await nbt.read(inputArrayBuffer)).data, logErrors);

	return temp;
}

function formatSchematic(data, logErrors) {
	var blocks = [];

	let l = Object.keys(data.Blocks).length;

	for (let i = 0; i < l; i++) {
		//make negative 8 bit values correspond to correct id
		blocks[i] = data.Blocks[i];
		if (blocks[i] < 0) {
			blocks[i] += 256;
		}
	}

	var mapList = Object.keys(mappings);

	if (logErrors) {
		for (let i = 0; i < l; i++) {
			if (mappings[mapList[blocks[i]]] !== null) {
				if (Object.keys(mappings[mapList[blocks[i]]]).includes('variants')) {
					if (Object.keys(mappings[mapList[blocks[i]]].variants).length > data.Data[i]) {
						blocks[i] = mappings[mapList[blocks[i]]].variants[data.Data[i]];
					} else {
						blocks[i] = mapList[blocks[i]];
						console.log(
							'Warning! ' +
								blocks[i] +
								' with a data value of ' +
								data.Data[i] +
								' cannot be pasted into housing!'
						);
					}
				} else {
					blocks[i] = mapList[blocks[i]];
				}

				if (blocks[i].includes('stair', 0) || blocks[i].includes('slab', 0)) {
					console.log(
						'Warning! ' +
							blocks[i] +
							' will always be in the default orientation and data will be lost!'
					);
				}
			} else {
				blocks[i] = mapList[blocks[i]];
				console.log('Warning! ' + blocks[i] + ' cannot be pasted into housing!');
			}
		}
	} else {
		for (let i = 0; i < l; i++) {
			if (mappings[mapList[blocks[i]]] !== null) {
				if (Object.keys(mappings[mapList[blocks[i]]]).includes('variants')) {
					if (Object.keys(mappings[mapList[blocks[i]]].variants).length > data.Data[i]) {
						blocks[i] = mappings[mapList[blocks[i]]].variants[data.Data[i]];
					} else {
						blocks[i] = mapList[blocks[i]];
					}
				} else {
					blocks[i] = mapList[blocks[i]];
				}
			} else {
				blocks[i] = mapList[blocks[i]];
			}
		}
	}

	return blocks;
}
